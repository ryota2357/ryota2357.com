---
title: "Rustのよくわからない隙間最適化(Option-like enum?)を見つけた"
postdate: "2024-04-05T11:31"
update: "2024-04-05T11:31"
tags: ["Rust"]
---

Rust で自作言語を作っているときに、よくわからない隙間最適化を見つけたので、メモ。

次のコードのように、`Struct1` を enum `EnumNg` のバリアントとした場合の `EnumNg` のサイズは、24byte となる。

```rust
struct Struct1 {
    inner: Rc<String>,
    id: u8
}
impl Struct1 {
    fn new(string: String, id: u8) -> Self {
        Struct1 { inner: Rc::new(string), id }
    }
}
enum EnumNg {
    A(i64),
    B(Struct1),
    C(fn(EnumNg) -> Result<EnumNg, String>)
}
```

これは、`Struct1` が 16byte なのを考えると理解できる。

```
| 8byte (enumフラグ) | 16byte (各バリアントのデータ) |
```

`Struct1` の内部構造を見てみると `inner` フィールドは 8byte、`id` フィールドは 1byte なので、`Struct1` は完全に 16byte 使っているわけではなく、パディングが入っているとわかる。
`union` 等を用いて隙間最適化すれば、`EnumNg` は 16byte にできそうである。

`union` は unsafe なので使いたくないと思い、`union` を使わず隙間最適化をかける方法を探したところ、次のようにすると Rust コンパイラが最適化してくれた。

```rust
enum Struct2 {
    Dummy,
    Body { inner: Rc<String>, id: u8 }
}
impl Struct2 {
    fn new(string: String, id: u8) -> Self {
        Struct2::Body { inner: Rc::new(string), id }
    }
}
enum EnumOk {
    A(i64),
    B(Struct2),
    C(fn(EnumOk) -> Result<EnumOk, String>)
}
```

`EnumOk` のサイズは 16byte となる。

これについて、いくつか実験してみると、`Struct2` の Dummy バリアントを消すと 24byte になったり、`EnumNg` の A または C バリアントを消すと 16byte になったりすることがわかった。
これらの挙動が全く理解できなかったので、[rust-lang-jpに質問した。](https://rust-lang-jp.zulipchat.com/#narrow/stream/124300-questions/topic/.E2.9C.94.20.E6.A7.8B.E9.80.A0.E4.BD.93.E3.81.AE.E3.82.B5.E3.82.A4.E3.82.BA.E3.81.AB.E3.81.A4.E3.81.84.E3.81.A6)

> **ryota2357**  
> 次のコードについて質問です。  
> https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&gist=519de15709f436200bd869b1c3913dda  
> Struct1のような構造体をEnumのバリアントにしたいです。そのままバリアントとした場合(EnumNg)は24byteとなりました。内部構造を考えると16byteになるはずだと思い、Struct2とEnumOk のようにしたところ16byteになりました。  
> Struct1 をバリアントとして16byteのEnumを作る方法はありますか？または作ることができない理由はありますか？  
> よろしくお願いします。
>
> ---
>
> **termoshtt**  
> 正直良く分かっていないですが、おそらくStruct2の場合がコンパイラによってOption-like enumとして特別扱いされているためEnumOkは16byteになっていますね。  
> https://rust-lang.github.io/unsafe-code-guidelines/layout/enums.html#discriminant-elision-on-option-like-enums  
> https://users.rust-lang.org/t/niche-optimization-nonzero-and-improper-ctypes/41399/15
>
> ```rust
> #[repr(packed)]
> struct Struct1 {
>     inner: Rc<String>,
>     id: u8
> }
> ```
>
> https://doc.rust-lang.org/nomicon/other-reprs.html#reprpacked  
> とすれば Struct1 の u8 をpaddingしなくなるのでサイズは減りその結果EnumNgのサイズも小さくなりますが、これはレイアウトが変わるので多分望みのものではないですね
>
> ---
>
> **ryota2357**  
> ありがとうございます。  
> Option-like enumは隙間最適化の一例だと思っていたのですが、特別扱いされたものだったのですね。  
> Struct2のDummyを消すと24byteになってしまったり、EnumNgのAまたはCバリアントを消すと16byteになったりして、不思議に思っていたのですが、特殊ケース(Option-like enum)として強力な隙間最適化がかかっていると見ると理解できます。  
> #[repr(packed)] は知りませんでした。ありがとうございます。ですが、はい、望みのものではなかったです。  
> 僕が今実際に取り組んでいるコードでは、構造体のフィールドは全てprivateなので、Option-like enumの最適化を入れるため、Struct2のようにDummyバリアントを入る + 外からは構造体のように使えるようapiを生やすことで対応しようと思います。
>
> ---
>
> **Notification Bot**  
> ryota2357がこのトピックを解決済みにしました

...

Option-like enum というもので、これはコンパイラが特別扱いしているようである。それなら、構造体・Enum のサイズがよくわからない条件で最適化されるのも納得できた。

termoshtt さんがあげてくれたリンク先にある、Option-like enum の条件は、

> Definition. An option-like enum is a 2-variant enum where:
>
> - the `enum` has no explicit `#[repr(...)]`, and
> - one variant has a single field, and
> - the other variant has no fields (the "unit variant").

とあるが、RFC に書かれていないらしく、よくわからない。  
termoshtt さんがあげてくれた 2 つのリンクにもう少し色々書いてあるが、この Option-like enum の条件をちゃんと知るためにはコンパイラの実装を読むしかなさそうに思えた。

termoshtt さん、そして vim-jp の#lang-rust で、TH さん、skanehira さん、ありがとうございました。
