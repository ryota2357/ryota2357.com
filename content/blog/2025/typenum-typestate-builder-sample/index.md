---
title: "Rust で型レベル数 (typenum) を使った Typestate な Builder パターンの実装サンプル"
postdate: "2025-03-22T23:02"
update: "2025-03-22T23:02"
tags: ["Rust"]
---

この前、[Rust の型レベル数ライブラリ typenum の紹介](../intro-typenum-crate)という記事を書いた。
本記事では `typenum` の実践的な使用例として、Typestate パターンと Builder パターンを組み合わせた構造体の段階的な構築方法を紹介する。

## サンプル題材

今回は簡単のため、以下の `Artifact` に対して、Builder パターンを実装してみる。

```rust
struct Artifact {
    field1: u32,
    field2: f64,
    field3: String,
}
```

このサンプルでは、フィールドの設定に以下のような制約を設ける。

1. フィールドは必ず `field1` → `field2` → `field3` の順で設定する。
2. `field2` を設定する際には `field1` の値を読み取ることができる。
3. `field3` を設定する際には `field1` と `field2` の両方の値を読み取ることができる。

このような制約を**型システムによって**強制することで、不正な順序での設定や、設定されていない値の参照をコンパイル時に検出できる。

なお、サンプルとして理解しやすいよう意図的にシンプルな構造にしている点には注意してほしい。

## 実装

今回の実装では、Typestate パターンの考え方に基づいて、構造体の構築プロセスを型で表現される状態の遷移として扱う。

状態遷移の核となるアイデアは次の 3 点である。

1. 構造体の状態を型レベルの数で表現し、各状態で許可される操作を制限する。
2. フィールドごとに、どの状態で書き込み可能になるかを型レベルで定義する。
3. 現在の状態と各フィールドの許可状態を比較し、アクセス制御を行う。

以下、段階を追って実装していく。
実装した全体コードは本記事末尾に「実装コード全体」として折り畳んで掲載している。

### 基本構造の定義

```rust
struct Artifact {
    field1: u32,
    field2: f64,
    field3: String,
}

struct BuildStep<N: typenum::Unsigned>(PhantomData<N>);

struct ArtifactBuilder<S> {
    inner: Artifact,
    _step: PhantomData<S>,
}
```

まず、ビルド対象となる `Artifact` 構造体を定義する。
次に、`BuildStep` を用意して構造体の状態を型レベルで表現する。
これによって Typestate パターンの状態遷移を実現する。

最後に、`Artifact` のビルダーを定義する。
通常の Builder 実装では未設定フィールドを `Option<T>` で表現するが、このサンプルでは簡単のため、`inner` フィールドに直接値を持つ形にしている。

### フィールドと状態の関連付け

まず、フィールドを型として表現する。

```rust
struct Field1;
struct Field2;
struct Field3;
```

次に、各フィールドがどの状態で書き込み可能になるかを定義する必要がある。
これを実現するために、`WritableAt` トレイトを用意する。

```rust
trait WritableAt {
    type Step: typenum::Unsigned;
}

impl WritableAt for Field1 {
    type Step = typenum::U1;
}
impl WritableAt for Field2 {
    type Step = typenum::U2;
}
impl WritableAt for Field3 {
    type Step = typenum::U3;
}
```

`WritableAt` トレイトは、フィールドの書き込み可能な状態を型レベルで表現する。
例えば `Field1` は最初の状態（`U1`）で書き込み可能となる。

ここで重要な点は、`WritableAt` トレイトの関連型 `Step` が 1 つの型のみを指定できることである。
これは Rust のトレイト実装の仕様により、あるフィールドが複数の状態で書き込み可能になることを防いでいる。
つまり、各フィールドは高々 1 つの状態でのみ書き込み可能であるという制約がコンパイル時に保証される。

### アクセス制御システムの構築

フィールドの読み書きを制御するために、まず許可を表現するトレイトを定義する。

```rust
trait AllowWrite<F> {}
trait AllowRead<F> {}
```

これらのマーカートレイトは、特定の状態（`S`）が特定のフィールド（`F`）に対して読み書きの権限を持つことを表現する。

次に、これらのトレイトの実装を通じて、具体的な制御ルールを定義する。

```rust
impl<S: typenum::Unsigned, F: WritableAt> AllowWrite<F> for BuildStep<S>
where
    F::Step: typenum::IsEqual<S, Output = typenum::True>
{}

impl<S: typenum::Unsigned, F: WritableAt> AllowRead<F> for BuildStep<S>
where
    F::Step: typenum::IsLess<S, Output = typenum::True>
{}
```

ここでは、typenum の型演算を使用して 2 つのルールを実装している。

1. 書き込み許可（`AllowWrite`）
   - フィールドの指定状態と現在の状態が完全に一致する場合のみ許可
   - `IsEqual` 型演算子を使用して、状態の一致を型レベルで検証
2. 読み取り許可（`AllowRead`）
   - フィールドの指定状態が現在の状態より前の場合のみ許可
   - `IsLess` 型演算子を使用して、状態の順序関係を型レベルで検証

### ビルダーの実装

各フィールドに対して、状態に応じた読み書きメソッドを実装する。
メソッドの可用性は `where` 句による制約で制御される。
例えば `field1` は状態 1 でのみ書き込み可能で、状態 2 以降で読み取り可能となる。
これらの制約はコンパイル時に強制され、不正な操作はコンパイルエラーとなる。

```rust
impl<S> ArtifactBuilder<S> {
    fn field1(&self) -> u32
    where
        S: AllowRead<Field1>,    // field1の読み取りが許可された状態でのみ呼び出し可能
    {
        self.inner.field1
    }

    fn set_field1(&mut self, value: u32)
    where
        S: AllowWrite<Field1>,   // field1の書き込みが許可された状態でのみ呼び出し可能
    {
        self.inner.field1 = value;
    }
    // field2, field3も同様のパターンで実装
}
```

### 状態遷移システムの実装

最後に、状態を次のステップに進めるための機能を実装する。
`next_step` メソッドは、現在の状態 (`S`) から次の状態 (`S + 1`) へと遷移させる。

```rust
impl<S: typenum::Unsigned> ArtifactBuilder<BuildStep<S>> {
    pub fn next_step(self) -> ArtifactBuilder<BuildStep<typenum::Sum<S, typenum::U1>>>
    where
        S: std::ops::Add<typenum::U1>,
        typenum::Sum<S, typenum::U1>: typenum::Unsigned,
    {
        ArtifactBuilder {
            inner: self.inner,
            _step: PhantomData,
        }
    }
}
```

## 使用例と動作の確認

次に簡単な動作確認を載せた。

```rust
let mut builder = ArtifactBuilder::<BuildStep<typenum::U1>> { /* 初期化 */ };

// 状態1: field1の設定が可能
builder.set_field1(1);
// builder.set_field2(1.0);  // コンパイルエラー：別のフィールドは設定できない
// let _ = builder.field1(); // コンパイルエラー：同じ状態では読み取れない

let mut builder = builder.next_step();
// 状態2: field2の設定とfield1の読み取りが可能
builder.set_field2(2.0);
// builder.set_field1(1);    // コンパイルエラー：前のフィールドは設定できない
let _ = builder.field1();    // 前の状態のフィールドは読める
// let _ = builder.field2(); // コンパイルエラー：現在のフィールドは読めない
```

<details>
<summary>動作確認全体コード</summary>

```rust
let mut builder = ArtifactBuilder::<BuildStep<typenum::U1>> {
    inner: Artifact {
        field1: 0,
        field2: 0.0,
        field3: String::from("0"),
    },
    _step: PhantomData,
};

builder.set_field1(1);
// builder.set_field2(1.0);             // コンパイルエラー
// builder.set_field3("1".to_string()); // コンパイルエラー
// let _ = builder.field1();            // コンパイルエラー
// let _ = builder.field2();            // コンパイルエラー
// let _ = builder.field3();            // コンパイルエラー

let mut builder = builder.next_step();
// builder.set_field1(2);               // コンパイルエラー
builder.set_field2(2.0);
// builder.set_field3("2".to_string()); // コンパイルエラー
let _ = builder.field1();
// let _ = builder.field2();            // コンパイルエラー
// let _ = builder.field3();            // コンパイルエラー

let mut builder = builder.next_step();
// builder.set_field1(3);   // コンパイルエラー
// builder.set_field2(3.0); // コンパイルエラー
builder.set_field3("3".to_string());
let _ = builder.field1();
let _ = builder.field2();
// let _ = builder.field3(); // コンパイルエラー

let mut builder = builder.next_step();
// builder.set_field1(4);   // コンパイルエラー
// builder.set_field2(4.0); // コンパイルエラー
let _ = builder.field1();
let _ = builder.field2();
let _ = builder.field3();

assert_eq!(builder.field1(), 1);
assert_eq!(builder.field2(), 2.0);
assert_eq!(builder.field3(), "3");
```

</details>

上記のコードでは、フィールドの設定順序と読み取りタイミングが型システムによって厳密に制御されている。
不正な操作はすべてコンパイル時に検出され、実行時のチェックは一切不要となる。

## 最後に

この方法は自作の言語処理系のコンパイラ実装をしているときに出てきたものを単純化したものである。
サンプルでは、状態に順序関係を持たせ、それによって trait が実装される部分を強調したものになっている。

以下に実装コード全体を折りたたんで置いておく。

<details>
<summary>実装コード全体</summary>

```rust
use std::marker::PhantomData;

// 基本となるArtifact構造体
struct Artifact {
    field1: u32,
    field2: f64,
    field3: String,
}

// ビルドステップを表す型
struct BuildStep<N: typenum::Unsigned>(PhantomData<N>);

// フィールド定義
struct Field1;
struct Field2;
struct Field3;

// フィールドがどのステップで書き込まれるかを示すトレイト
trait WritableAt {
    type Step: typenum::Unsigned; // 書き込み可能なステップを関連型として定義
}

// 各フィールドが書き込まれるステップを一度だけ定義
impl WritableAt for Field1 {
    type Step = typenum::U1;
}

impl WritableAt for Field2 {
    type Step = typenum::U2;
}

impl WritableAt for Field3 {
    type Step = typenum::U3;
}

// フィールドの読み書き権限を表すトレイト
trait AllowWrite<F> {}
trait AllowRead<F> {}

// 書き込み権限：フィールドのステップと現在のステップが同じ場合のみ
impl<S: typenum::Unsigned, F: WritableAt> AllowWrite<F> for BuildStep<S> where
    F::Step: typenum::IsEqual<S, Output = typenum::True>
{
}

// 読み取り権限：フィールドのステップが現在のステップより前の場合
impl<S: typenum::Unsigned, F: WritableAt> AllowRead<F> for BuildStep<S> where
    F::Step: typenum::IsLess<S, Output = typenum::True>
{
}

struct ArtifactBuilder<S> {
    inner: Artifact,
    _step: PhantomData<S>,
}

impl<S> ArtifactBuilder<S> {
    fn field1(&self) -> u32
    where
        S: AllowRead<Field1>,
    {
        self.inner.field1
    }
    fn set_field1(&mut self, value: u32)
    where
        S: AllowWrite<Field1>,
    {
        self.inner.field1 = value;
    }

    fn field2(&self) -> f64
    where
        S: AllowRead<Field2>,
    {
        self.inner.field2
    }
    fn set_field2(&mut self, value: f64)
    where
        S: AllowWrite<Field2>,
    {
        self.inner.field2 = value;
    }

    fn field3(&self) -> &str
    where
        S: AllowRead<Field3>,
    {
        &self.inner.field3
    }
    fn set_field3(&mut self, value: String)
    where
        S: AllowWrite<Field3>,
    {
        self.inner.field3 = value;
    }
}

impl<S: typenum::Unsigned> ArtifactBuilder<BuildStep<S>> {
    pub fn next_step(self) -> ArtifactBuilder<BuildStep<typenum::Sum<S, typenum::U1>>>
    where
        S: std::ops::Add<typenum::U1>,
        typenum::Sum<S, typenum::U1>: typenum::Unsigned,
    {
        ArtifactBuilder {
            inner: self.inner,
            _step: PhantomData,
        }
    }
}

fn main() {
    let mut builder = ArtifactBuilder::<BuildStep<typenum::U1>> {
        inner: Artifact {
            field1: 0,
            field2: 0.0,
            field3: String::from("0"),
        },
        _step: PhantomData,
    };

    builder.set_field1(1);
    // builder.set_field2(1.0);             // コンパイルエラー
    // builder.set_field3("1".to_string()); // コンパイルエラー
    // let _ = builder.field1();            // コンパイルエラー
    // let _ = builder.field2();            // コンパイルエラー
    // let _ = builder.field3();            // コンパイルエラー

    let mut builder = builder.next_step();
    // builder.set_field1(2);               // コンパイルエラー
    builder.set_field2(2.0);
    // builder.set_field3("2".to_string()); // コンパイルエラー
    let _ = builder.field1();
    // let _ = builder.field2();            // コンパイルエラー
    // let _ = builder.field3();            // コンパイルエラー

    let mut builder = builder.next_step();
    // builder.set_field1(3);   // コンパイルエラー
    // builder.set_field2(3.0); // コンパイルエラー
    builder.set_field3("3".to_string());
    let _ = builder.field1();
    let _ = builder.field2();
    // let _ = builder.field3(); // コンパイルエラー

    let mut builder = builder.next_step();
    // builder.set_field1(4);   // コンパイルエラー
    // builder.set_field2(4.0); // コンパイルエラー
    let _ = builder.field1();
    let _ = builder.field2();
    let _ = builder.field3();

    assert_eq!(builder.field1(), 1);
    assert_eq!(builder.field2(), 2.0);
    assert_eq!(builder.field3(), "3");
}
```

</details>
