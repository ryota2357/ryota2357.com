---
title: "EcoString と CompactString から Small String Optimization と Clone-on-Write の実装方法を学ぶ"
postdate: "2024-12-09T13:11"
update: "2024-12-09T13:11"
tags: ["Rust"]
---

> この記事は[電通大生による電通大生のためのAdvent Calendar 2024 その2](https://adventar.org/calendars/10198) の 7 日目の記事です。

現在私は [lean_string](https://crates.io/crates/lean_string) という Rust のライブラリ (crate) を開発している。
この crate では [LeanString](https://docs.rs/lean_string/latest/lean_string/struct.LeanString.html) という、Small String Optimization と Clone-on-Write を実装した文字列構造体を公開している。
アイデア・実装手法については、 [ecow](https://crates.io/crates/ecow) と [compact_str](https://crates.io/crates/compact_str) という crate を参考にした。

この記事では `LeanString` の実装にあたり参考にした [`ecow::EcoString`](https://docs.rs/ecow/0.2.3/ecow/string/struct.EcoString.html) と [`compact_str::CompactString`](https://docs.rs/compact_str/0.8.0/compact_str/struct.CompactString.html) がどのように実装されているのかについて簡単に書いていく。

なお、以降では特に明記がない限り 64 ビットアーキテクチャを仮定する。

## Small String Optimization とは

Rust 言語に標準ライブラリの文字列型 `String` は概念的には文字列バッファへのポインタ `pointer`、文字列の長さ `length`、バッファの容量 `capacity` の 3 つのフィールドをもった構造体である。

```rust
struct String {
    pointer: *const u8,
    length: usize,
    capacity: usize,
}
```

文字列は `pointer` が指し示す先のバッファ (ヒープ) に格納される。
この `String` 構造体のサイズは各フィールドが 8 バイトなので合計 24 バイトの構造体である。

図にすると次のようになる。

```
+-------------------+------------------+-------------------+
| pointer (8 bytes) | length (8 bytes) | capacity (8bytes) |
+-------------------+------------------+-------------------+
  |
  |    +----------------+
  \--> | "Hello World"  | ヒープ・可変長
       +----------------+
```

ここで、`String` (のポインタが指し示す先のバッファ) に格納される文字列が非常に短い時を考える。
例として `"abc"` の 3 文字 (3 バイト) では、スタックに 24 バイト、ヒープに 3 バイトを格納することになる。

Small String Optimization (以下 SSO) とは `"abc"` のように短い文字列をヒープに格納するのではなく、せっかくスタックが 24 byte もあるのだから、スタック (構造体) にインラインで格納してしまおうというアイデアである。

文字列がインラインに格納されているのか、ヒープに格納されているか判定するために `capacity` の上位 1 バイトが `1` 以上ならばインライン、`0` ならばヒープとしてみよう。
図にすると次のようになる。 (`capacity` をリトルエンディアンで格納していることに注意)

```
長い文字列
  +-------------------+------------------+-------------------+-----+
  | pointer (8 bytes) | length (8 bytes) | capacity (7bytes) |  0  |
  +-------------------+------------------+----------------- -+-----+
     |
     |    +--------------------------------+
     \--> | "Long Text is stored in Heap"  |
          +--------------------------------+

短い文字列
  +-------------------+------------------+-------------------+-----+
  | "abc" (3 bytes)   .....                                  | > 1 |
  +-------------------+------------------+-------------------+-----+
                                                               ^^^
                                                            (フラグ値 - 1) が文字列長

```

`capacity` が 7 バイトになり表現できる数の上限が小さくなってしまったが、7 バイトで表現できる数は 2^56 - 1 bits = 64 PiB もあるため、全く問題にならない。

`String` のように 24 バイトの文字列型であれば 23 バイト分の文字列をインラインで格納できることがわかる。

SSO の利点は短い文字列に対するメモリ効率の改善である。
例として 23 バイトの文字列を格納することを考えてみる。
SSO せず格納すると、構造体のサイズ (24 バイト) とヒープ (23 バイト) 合わせて 47 バイト必要になる。
SSO を使用すると 23 バイト文字列はインラインで格納できるので 24 バイトになる。
SSO により使用するメモリ容量を抑えられただけでなく、ヒープアロケーションも回避できた。

反対に SSO の欠点としては、現在格納している文字列がインラインかヒープかの分岐が入るので、その分岐がコストになるというものがある。
(`CompactString` ではこの分岐をできるだけ回避する最適化も取り入れてはいるが、それでも多くの操作で分岐が必要となっている)

Rust の標準ライブラリの `String` は SSO を実装していない。
SSO の恩恵を受けたい場合は自分で実装するか `CompactString` ([compact_str](https://crates.io/crates/compact_str)) や `EcoString` ([ecow](https://crates.io/crates/ecow))、`SmolStr` ([smol_str](https://crates.io/crates/smol_str)) のような外部 crate を使用する必要がある。

ちなみに C++ の `std::string` は SSO が実装されている。その実装方法は Clang (stdlibc++), GCC (libc++) などで異なりインラインで格納できる容量に違いがあるらしい。

## Clone-on-Write とは

CoW などと省略され、 Copy-on-Write などとも言われる。

簡単に言えば、複製 (Clone) を編集 (Write) のタイミングまで遅延させるというものだ。

文字列を題材にする。
例えばヒープに格納された長い文字列がある。
この文字列を複製する時、CoW ではヒープへのポインタのみを複製し、編集する時に初めてヒープを複製して書き込みを行う。
このようにすることで、不要な複製を避けることができるのでメモリ効率・実行速度を改善できる。

より実践的には次の記事が非常にわかりやすい。

[多コピーの原罪 - blog.ojisan.io](https://blog.ojisan.io/many-copies-original-sin/)

## CompactString の実装

[`compact_str::CompactString`](https://docs.rs/compact_str/0.8.0/compact_str/struct.CompactString.html) は SSO を実装した 24 バイトの文字列構造体である。
先ほどの SSO の説明ではインラインに格納できる文字列は 23 バイトまでとなるが、`CompactString` は格納する文字列のエンコーディングが UTF-8 であることを利用し 24 バイトまでインライン格納できるようにしている。

### UTF-8 バイト列の仕組み

UTF-8 では文字列が 1 バイト (8 ビット) を基本単位として 1 文字を 1 ~ 8 バイトの可変長で表すエンコーディングである。

1 文字が可変長なので、1 文字 1 文字の区切りを認識するために次の規則がある。

- 1 バイト文字: 最上位ビットを `0` とする
- 2 バイト文字: 1 バイト目の上位 3 ビットを `110`、2 バイト目の上位 2 ビットを `10` とする
- 3 バイト文字: 1 バイト目の上位 4 ビットを `1110`、２バイト目、3 バイト目の上位 2 ビットを `10` とする
- 4 バイト文字: 1 バイト目の上位 4 ビットを `1111`、2 バイト目以降の上位 2 ビットを `10` とする
- ...

というようになっている。
つまり文字の始まりは「上位 2 ビットが `10` でないもの」になる。

### 24 バイトをインラインに格納する

24 バイトの UTF-8 文字列をインラインに格納した場合、24 バイト目は必ず UTF-8 文字シーケンスの最後の 1 バイトになる。
先に書いた UTF-8 バイト列の仕組みより、次の値が 24 バイト目としてあり得るものである。

| 値の範囲 (2進数)        | 値の範囲 (10進数) | 意味                              |
| ----------------------- | :---------------- | :-------------------------------- |
| `00000000` ~ `01111111` | `0` ~ `127`       | ASCII 文字                        |
| `10000000` ~ `10111111` | `128` ~ `191`     | マルチバイト文字列の最後の1バイト |

このように 192 (`11000000`) 以上の値は現れないので、残り 192 ~ 255 の 64 個の数値をフラグとして利用可能なのである。

このことより最後の 1 バイトを見て、現在 `CompactString` に格納されている文字列がインラインかヒープか、インラインならば何文字なのかを知ることができる。
例えば 192 ~ 215 はインラインで文字列長が 0 ~ 23 文字、216 ならヒープ、191 以下は 24 文字インライン文字列とできる。

`CompactString` ではさらに `&'static str` 向けのフラグを持っていたり、隙間最適化 (`size_of::<Option<CompactString>> == size_of<CompactString>`) が効くようコンパイラに伝わる書き方をしていたりする。

ここまで理解していれば [`CompactString` のソースコード](https://github.com/ParkMyCar/compact_str)を読めるはずなので、あとはそちらを読んでほしい。
`CompactString` ではこれまで説明した他に 32 ビットアーキテクチャやビックエンディアンの対応、分岐最適化などが実装されているため、複雑になっているがコメントがとても丁寧に書いてあるので読めばわかるはずである。

特に 32 ビットアーキテクチャではこれまで説明した `capacity` を 1 バイト削る方法だと、上限が 2^24 - 1 bits = 16 MiB になってしまう。
この長さは現実的に文字列としてプログラム実行中に現れ得る長さである。
`CompactString` では 32 ビットアーキテクチャの場合に限り 2^24 - 2 を超える `capacity` をヒープに置くことで 2^32 - 1 まで `capacity` を確保できるよう工夫されている。

## EcoString

[`ecow::EcoString`](https://docs.rs/ecow/0.2.3/ecow/string/struct.EcoString.html) は SSO と CoW を実装した **16 バイト**の文字列構造体である。

`EcoString` は `String` や `CompactString` より 8 バイト (1 ワード) だけ構造体サイズが小さい。
先にした SSO の説明で文字列構造体はポインタ、文字列長さ、バッファの容量の 3 つのフィールドがあると説明したが、`EcoString` ではバッファの容量をヒープに置くことで構造体サイズを節約している。

SSO の実装は `CompactString` のように UTF-8 の仕組みに基づいたインラインバッファの拡張はせず、単純にフラグを持っているだけなので、15 バイトまでインラインで格納できる。

CoW の実装はアトミック変数を内部で使用した参照カウンタ方式をとっている。
アトミック変数を使用しているので、`Send` かつ `Sync` なのでスレッドを跨いだ CoW が可能である。

`EcoString` の構造は概念的には次のようになっている。

```rust
struct EcoString {
    pointer: *const u8,
    length: usize
}

struct Header {
    capacity: usize,
    reference_count: AtomicUsize,
}
```

`EcoString` の `pointer` フィールドの指し示す先は `String` ・ `CompactString` と同じく文字列バッファではあるのだが、そのバッファには `Header` がついている。
図にすると次のような感じである。

```
+-------------------+------------------+
| pointer (8 bytes) | length (8 bytes) |
+-------------------+------------------+
  |
  \-------------------\
                      ↓
  +-------------------+--------------------
  | Header (16 bytes) | String Buffer ....
  +-------------------+--------------------
```

このようにすることで `*(pointer - 16)` で `Header` へアクセスできる。

### EcoString と EcoVec\<T\>

先ほど `EcoString` はの概念的な構造を Rust コードで示したが、実際は内部では [`EcoVec<T>`](https://docs.rs/ecow/0.2.3/ecow/vec/struct.EcoVec.html) という CoW を実装した動的配列を使用している。
この `pointer` が指し示すバッファに Header を置くというのは、正しくは `EcoString` ではなく `EcoVec<T>` に実装されているものである。

文字列バッファの前に Header を置くと簡単に行っているが、実装する際はアライメントに気をつける必要がある。
`EcoVec<T>` の `T` にアライメントを合わせてしまうとアライメント違反になる可能性がある。
ポインタをアロケーションするときはアライメントを `max(align_of::<Header>(), align_of::<T>())` しなければいけない。

ちなみに Rust 標準ライブラリの `String` は内部で `Vec<T>` を使用している。
`EcoString` と `EcoVec<T>` の関係は `String` と `Vec<T>` によく似ている。

## 開発中の LeanString

現在僕が開発中の [`LeanString`](https://crates.io/crates/lean_string) は `EcoString` のような 16 バイト文字列でありながら `CompactString` のように UTF-8 の仕組みを利用したインライバッファを実装した SSO + CoW 文字列構造体である。
また、Rust 標準ライブラリの `String` とのインターフェース (メソッド) の互換性を高くしたり、`CompactString` で実装されている分岐最適化を一部取り入れたりもしている。

`LeanString` の実装には `unsafe` を多用する必要があったり、 `String` がもつメソッドの数が多かったりと時間がかかってしまっている。
ある程度の完成度になったら、その実装について記事を書こうと思う。

## 参考

- [Small String Optimization で Rust ライブラリ ratatui を最適化した話](https://rhysd.hatenablog.com/entry/2023/11/30/200857#compact_str)
- [多コピーの原罪](https://blog.ojisan.io/many-copies-original-sin/)
- [UTF-8ってそもそもどういう仕組み？](https://qiita.com/mume/items/8a12543cf9583849db62)
- [ParkMyCar/compact_str](https://github.com/ParkMyCar/compact_str)
- [typst/ecow](https://github.com/typst/ecow)
