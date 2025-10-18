---
title: "Rust の型レベル数ライブラリ typenum の紹介"
postdate: "2025-03-17T16:31"
update: "2025-03-22T23:03"
tags: ["Rust"]
---

[`typenum`](https://crates.io/crates/typenum) は、コンパイル時に評価される型レベルの数を扱う crate である。

型レベル数の主な用途として次のようなものがある。

- 配列の長さを型として表現
- 単位（メートル、キログラムなど）を型として扱う際の数値計算
- Typestate パターンでの状態遷移の順序関係の表現

型レベル数の利点は、コンパイル時に計算が行われることにある。
これにより、実行時のオーバーヘッドを無くしつつ、型システムを通じた安全性の保証が得られる。

## 基本的な使い方

`typenum` では、次の 3 種類の型レベル数を提供している。

```rust
use typenum::{Sum, U2, P3, N2};

// U: 符号なし整数
type A = U2;    // 2

// P: 正の整数
type B = P3;    // +3

// N: 負の整数
type C = N2;    // -2
```

これらの型に対して様々な演算ができる。

```rust
use typenum::{Sum, Integer, U1, U2, N2, P3};

// 加算: 1 + 2 = 3
type X = Sum<U1, U2>;
assert_eq!(<X as Integer>::to_u32(), 3);

// 累乗: (-2)^3 = -8
type Y = Exp<N2, P3>;
assert_eq!(<Y as Integer>::to_i32(), -8);
```

## 型レベル数の実装

[`typenum` v1.18.0](https://github.com/paholg/typenum/tree/v1.18.0) の実装を見ていく。

### 型レベル数の表現方法

`typenum` では、全ての整数を型として 2 進数で表現している。
まずはその 2 進数を構成するビットを説明し、そのビットを組み合わせて数値を表している方法を見ていこう。

### ビット表現

2 進数の各桁は [src/bit.rs](https://github.com/paholg/typenum/blob/v1.18.0/src/bit.rs) に `B0` と `B1` という 2 つの型で表現される。

```rust
/// The type-level bit 0.
#[derive(Eq, PartialEq, Ord, PartialOrd, Clone, Copy, Hash, Debug, Default)]
pub struct B0;

impl Bit for B0 {
    const U8: u8 = 0;
    const BOOL: bool = false;
    // ...
}

/// The type-level bit 1.
#[derive(Eq, PartialEq, Ord, PartialOrd, Clone, Copy, Hash, Debug, Default)]
pub struct B1;

impl Bit for B0 {
    const U8: u8 = 0;
    const BOOL: bool = false;
    // ...
}
```

なお、ここで出てきた `Bit` トレイトは、[src/marker_traits.rs](https://github.com/paholg/typenum/blob/v1.18.0/src/marker_traits.rs) で宣言されているマーカートレイトである。

```rust
/// The **marker trait** for compile time bits.
pub trait Bit: Sealed + Copy + Default + 'static {
    const U8: u8;
    const BOOL: bool;
    fn new() -> Self;
    fn to_u8() -> u8;
    fn to_bool() -> bool;
}
```

### 符号なし整数型

[src/uint.rs](https://github.com/paholg/typenum/blob/v1.18.0/src/uint.rs) では、再帰的に定義される `UInt` 型が実装されている。

```rust
/// `UInt` is defined recursively, where `B` is the least significant bit and `U` is the rest
/// of the number.
pub struct UInt<U, B> {
    /// The more significant bits of `Self`.
    pub(crate) msb: U,
    /// The least significant bit of `Self`.
    pub(crate) lsb: B,
}
```

`UInt::msb` は、より上位のビットを表し、`UInt::lsb` は最下位ビットを表す。
これにより、任意の長さの 2 進数を型として表現できる。

例えば、`U2`（2 進数で 10）は次のように表現される。

```rust
type U2 = UInt<UInt<UTerm, B1>, B0>;
```

ここで、`UTerm` は数値表現の終端を表す型で、それ自体は 0 を表現する。
これは型が再帰的に定義されていることから必要となる型で、あらゆる `UInt` 型の最上位ビットの次に配置される。

```rust
/// The terminating type for `UInt`; it always comes after the most significant
/// bit. `UTerm` by itself represents zero, which is aliased to `U0`.
#[derive(Eq, PartialEq, Ord, PartialOrd, Clone, Copy, Hash, Debug, Default)]
pub struct UTerm;
```

## 型レベル演算の実装例：加算（Add）

加算について見ていく。
他の演算については (複雑さに違いはあれど) 同じように実装されているので、加算の流れがわかれば他も読めるはずである。

[src/uint.rs#L318-L397](https://github.com/paholg/typenum/blob/v1.18.0/src/uint.rs#L318-L397) に `Add` トレイトの実装がある。

```rust
/// `UTerm + U = U`
impl<U: Unsigned> Add<U> for UTerm {
    type Output = U;
}

/// `UInt<U, B> + UTerm = UInt<U, B>`
impl<U: Unsigned, B: Bit> Add<UTerm> for UInt<U, B> {
    type Output = UInt<U, B>;
}

/// `UInt<Ul, B0> + UInt<Ur, B0> = UInt<Ul + Ur, B0>`
impl<Ul: Unsigned, Ur: Unsigned> Add<UInt<Ur, B0>> for UInt<Ul, B0>
where
    Ul: Add<Ur>,
{
    type Output = UInt<Sum<Ul, Ur>, B0>;
}

/// `UInt<Ul, B0> + UInt<Ur, B1> = UInt<Ul + Ur, B1>`
impl<Ul: Unsigned, Ur: Unsigned> Add<UInt<Ur, B1>> for UInt<Ul, B0>
where
    Ul: Add<Ur>,
{
    type Output = UInt<Sum<Ul, Ur>, B1>;
}

/// `UInt<Ul, B1> + UInt<Ur, B0> = UInt<Ul + Ur, B1>`
impl<Ul: Unsigned, Ur: Unsigned> Add<UInt<Ur, B0>> for UInt<Ul, B1>
where
    Ul: Add<Ur>,
{
    type Output = UInt<Sum<Ul, Ur>, B1>;
}

/// `UInt<Ul, B1> + UInt<Ur, B1> = UInt<(Ul + Ur) + B1, B0>`
impl<Ul: Unsigned, Ur: Unsigned> Add<UInt<Ur, B1>> for UInt<Ul, B1>
where
    Ul: Add<Ur>,
    Sum<Ul, Ur>: Add<B1>,
{
    type Output = UInt<Add1<Sum<Ul, Ur>>, B0>;
}
```

加算の実装では、最下位ビット同士の演算結果と、それ以外の部分の演算結果を組み合わせて、最終的な結果を得る。
全てのパターンに対して実装が用意されている。

実際に型レベルでの加算がどのように解決されるのか、具体例を見ていこう。

### 例1: `Sum<U1, U2>`

`Sum<U1, U2>`（1 + 2）の計算過程を追ってみる。

まず、`Sum` はエイリアスで [src/operator_alias.rs#L38](https://github.com/paholg/typenum/blob/v1.18.0/src/operator_aliases.rs#L38) に定義されている。

```rust
pub type Sum<A, B> = <A as Add<B>>::Output
```

次に `U1` と `U2` の定義を思い出そう。

- `U1` = `UInt<UTerm, B1>` (2 進数: 1)
- `U2` = `UInt<UInt<UTerm, B1>, B0>` (2 進数: 10)

この状態で `U1 + U2` (`Sum<U1, U2>`) ではまず次の実装が適用される。

```rust
/// `UInt<Ul, B1> + UInt<Ur, B0> = UInt<Ul + Ur, B1>`
impl<Ul: Unsigned, Ur: Unsigned> Add<UInt<Ur, B0>> for UInt<Ul, B1>
where
    Ul: Add<Ur>,
{
    type Output = UInt<Sum<Ul, Ur>, B1>;
}
```

これにより型の解決は以下のように進む。

```rust
U1 + U2
=> UInt<UTerm, B1> + UInt<UInt<UTerm, B1>, B0>
=> UInt<(UTerm + UInt<UTerm, B1>), B1>
```

そして、ここで次が適用される。

```rust
/// `UTerm + U = U`
impl<U: Unsigned> Add<U> for UTerm {
    type Output = U;
}
```

すると型解決は以下のように進む。

```rust
U1 + U2
=> UInt<UTerm, B1> + UInt<UInt<UTerm, B1>, B0>
=> UInt<(UTerm + UInt<UTerm, B1>), B1>
=> UInt<UInt<UTerm, B1>, B1>
```

最後の `UInt<UInt<UTerm, B1>, B1>` は `U3` そのものであり、`Sum<U1, U2>` から `U3` が得られていることが確認できた。

### 例2: `Sum<U3, U2>`

より複雑な例として `Sum<U3, U2>`（3 + 2）の場合を見てみよう。

```rust
U3 + U2
=> UInt<UInt<UTerm, B1>, B1> + UInt<UInt<UTerm, B1>, B0>
=> UInt<(UInt<UTerm, B1> + UInt<UTerm, B1>), B1>
=> UInt<UInt<UInt<UTerm, B1>, B0>, B1>
= U5
```

`UInt<UTerm, B1> + UInt<UTerm, B1>` の部分で繰り上がりが発生し、`UInt<UInt<UTerm, B1>, B0>` という結果になっていることに注目しよう。

## 型レベル数の活用例

型レベル数をどのように活用しているかは、[`typenum` の逆依存](https://crates.io/crates/typenum/reverse_dependencies) crate を見れば多く知ることができる。

ここで 1 つ例を挙げるなら、Typestate パターンで状態遷移の制御を実装する際に有用である。
例えば、「状態 A は状態 B より前でなければならない」といった順序関係を、型レベル数を使って表現できる。

~~なお、別の記事にて、Typestate パターンと Builder パターンを組み合わせた実装例を解説する予定である。~~  
書きました：[Rust で型レベル数 (typenum) を使った Typestate な Builder パターンの実装サンプル](../typenum-typestate-builder-sample)
