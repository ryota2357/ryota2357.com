---
title: "Prattパーサを使って電卓を作ってみる"
postdate: "2023-12-18T00:00"
update: "2023-12-22T08:14"
tags: ["Rust"]
---

> これは [UEC Advent Calendar 2023](https://adventar.org/calendars/8704) の18日目の記事です。  
> 良い感じのネタがなかったので、普通に技術記事書きます。

「[Simple but Powerful Pratt Parsing](https://matklad.github.io/2020/04/13/simple-but-powerful-pratt-parsing.html)」にて Pratt パーサーの実装は意外と簡単だとわかった。
そこで Pratt パーサーの実装練習に次のような処理ができる電卓を実装してみる。

```txt
> 1 + 2 * 3
= 7
> a = 2 * 3 + 1 / 2
a = 6.5
> b = sqrt(6.5 + 2.5)
b = 3
> -(b - 1)^3!
= -64
```

## Prattパーサとは

Pratt パーサとは、演算子の優先順位を考慮して構文木を再帰下降法により構築するパーサである。
その実装は非常にシンプルで理解しやすい。

先に挙げた「[Simple but Powerful Pratt Parsing](https://matklad.github.io/2020/04/13/simple-but-powerful-pratt-parsing.html)」では Pratt パーサーのコンセプトと実装方法を順を追って丁寧に解説してくれている。
ざっくりとその内容をまとめる。（ほんとにざっくりとなので、天下りかつ色々省略して書く）

まず、演算子には次の 3 種類があることを確認する。

- 前置演算子 (`-1` の `-` など)
- 中置演算子 (`1 + 2` の `+` など)
- 後置演算子 (`2!` の `!` など)

そしてそれぞれの演算子に Binding Power (束縛力？)というものを定義する。
Binding Power とは、正の数または空である値 `x` と `y` を用いて、`(x, y)` のように表され、その演算子が左右にある項を結びつける力（引っ張る力）を意味する。

例として、`A + B * C` をパースすることを考える。この時、`+` の Binding Power を `(1, 2)`、`*` の Binding Power を `(3, 4)` と定義すると、

```txt
expr:  A   +   B   *   C
power:   1   2   3   4
```

のようになる。ここで、Binding Power に従い項を結合すると、

```txt
expr:  A   +   (B   *  C)
power:   1   2
↓
expr: (A   +   (B   *  C))
power:
```

となり、期待通りの結合される。

少し複雑な例を考えてみる。`A * B * C + D ^ E ^ F` をパースすることを考える (`X ^ Y` は「X の Y 乗」の意味)。
数式として自然に捉えるならば、`(((A * B) * C) + (D ^ (E ^ F)))` とパースされて欲しい。
`+` と `*` の Binding Power は先ほどと同様 `(1, 2)`、`(3, 4)` とし、新たに登場した `^` の Binding Power を `(6, 5)` とすると、

```txt
expr:    A   *   B   *   C   +   D   ^   E   ^   F
power:     3   4   3   4   1   2   6   5   6   5
↓
expr:   (A   *   B)  *   C   +   D   ^   E   ^   F
power:             3   4   1   2   6   5   6   5
↓
expr:  ((A   *   B)  *   C)  +   D   ^   E   ^   F
power:                     1   2   6   5   6   5
↓
expr:  ((A   *   B)  *   C)  +   D   ^  (E   ^   F)
power:                     1   2   6   5
↓
expr:  ((A   *   B)  *   C)  +  (D   ^  (E   ^   F))
power:                     1   2
```

ここで、`*` と `^` に注目する。
`*` が使用されている部分の `A * B * C` は正しく `((A * B) * C)` と左結合、`^` が使用されている `D ^ E ^ F` も正しく `(D ^ (E ^ F))` と右結合することがわかる。

ここまで中置演算子の例を見てきたが前置・後置演算子についても同様である。
例は省略するが、 Binding Power を `((), y)` や `(x, ())`（`()` は空な値）とすれば良い。

このような Binding Power を考慮したパースを行うプログラムは次の擬似コードのように実装すれば良い。
（実際には処理の切り出し方が異なっていたり、演算子によってさらなる処理が必要なこともあるが、処理の流れは変わらない。）

```python
def parse(input: トークン列) -> Expr | 数値:
    return expr_bp(tokens, 0)

def expr_bp(tokens: トークン列, min_bp: 数値) -> Expr | 数値:
    current = pop(tokens)  # tokensから先頭の1トークンをPop

    # 前置演算子 (prefix operator) の処理
    if current in PREFIX_OP:
        ((), r_bp) = prefix_binding_power(current)
        lhs = expr_bp(tokens, r_bp)
    else:
        lhs = current

    # lhs はこの時点で 数値 または Expr となっている
    assert(lhs == 数値 or Expr)

    while True:
        op = copy_top(tokens)  # tokensの先頭1トークンをCopy

        # 後置演算子 (postfix operator) の処理
        if op in POSTFIX_OP:
            (l_bp, ()) = postfix_binding_power(op)
            if l_bp < min_bp:
                break
            pop(tokens)
            lhs = Expr(op, lhs)
            continue

        # 中置演算子 (infix operator) の処理
        if op in INFIX_OP:
            (l_bp, r_bp) = infix_binding_power(op)
            if l_bp < min_bp:
                break
            pop(tokens)
            rhs = expr(tokens, r_bp)
            lhs = Expr(op, lhs, rhs)
            continue

        break

    return lhs
```

関数 `expr_bp()` の形は次のようになっていることがわかる。

```txt
function expr_bp(tokens, min_bp)
    前置演算子の処理
    loop
        後置演算子の処理
        中置演算子の処理
    endloop
endfunction
```

さらにこの `expr_bp()` では tokens の先読みは loop 内での 1 のみであることがわかる。
つまり Pratt パーサを用いることで、LL(1) という非常にシンプルな文法で「演算子の優先順位を考慮したパース」を実現可能なのである。

以降、Rust を使用して実際にコーディングしていく。

## 作成する電卓の仕様

今回作る電卓はこの記事の冒頭に示した通り、「1 行の入力を受け取り、それを処理する」ということを繰り返すものである。
もう少し具体化すると、

1. `> ` というプロンプトに続いて 1 行入力する。
1. 入力を評価する。
1. 評価した結果を次の行に表示する。

これを繰り返すプログラムである。

評価される入力の文法を定義する。
入力は 1 行であり、`Stmt` と呼ぶこととする。
`Stmt` の文法は次の通りである。

```bnf
Stmt   ::= Assign | Expr
Assign ::= Ident '=' Expr
Expr   ::= Num | Ident | Unary | Binary | Call | '(' Expr ')'
Unary  ::= Op Expr
Binary ::= Expr Op Expr
Call   ::= Ident '(' Expr ')'
Num    ::= [0-9]+ ('.' [0-9]*)?
Ident  ::= [a-zA-Z] [a-zA-Z0-9]*
Op     ::= '+' | '-' | '*' | '/' | '^' | '!'
```

単純な再起降下法では、この文法定義だと `Expr` で左再起による無限再起を発生させてしまい処理できない。
Pratt パーサを用いることで、`Unary`, `Binary`, `Call` を適切に処理できるようになり、`Op` の優先順位も考慮できる。

## 準備

Rust は 1.74.1 (12/17 現在の stable) を使用する。

パーサを書く前に、いつくか必要なものを実装する。  
<small>
注意: 実装を簡単にするため、実用には、パフォーマンス、利便性ともに適さない書き方をする。
</small>

### Token / Expr / Stmt

パーサにて入力を文字列で扱うのは面倒な為 `Token` 変換してから扱うこととする。
`Token::Op` は先ほどの文法定義で使用した `Op` とは異なり、`Op` に加えて `=`, `(`, `)` も `Token::Op` として扱う。

`Expr`、`Stmt` は先ほどの文法定義に従い定義する。

```rust
#[derive(Debug, Clone, PartialEq)]
enum Token {
    Num(f64),
    Op(char),
    Ident(String),
}

#[derive(Debug, Clone, PartialEq)]
enum Expr {
    Num(f64),
    Ident(String),
    Unary(char, Box<Expr>),
    Binary(char, Box<Expr>, Box<Expr>),
    Call(String, Box<Expr>),
}

#[derive(Debug, Clone, PartialEq)]
enum Stmt {
    Assign(String, Expr),
    Expr(Expr),
}
```

### main()

`question("> ")` で 1 行の入力を受け取り `lexer::parse()` で `Vec<Token>` を生成、それを `parser::parse()` に渡して `Stmt` を生成、さらにそれを `eval()` に渡して結果を得る。

```rust
fn main() {
    fn question(msg: &str) -> String {
        let mut stdout = stdout();
        stdout.write_all(msg.as_bytes()).unwrap();
        stdout.flush().unwrap();
        let mut input = String::new();
        stdin().read_line(&mut input).unwrap();
        input
    }

    let mut map = HashMap::new();
    loop {
        let line = question("> ");
        let tokens = lexer::parse(&line);
        let stmt = parser::parse(&tokens);
        let res = eval(&stmt, &mut map);
        match res {
            (Some(name), res) => println!("{} = {}", name, res),
            (None, res) => println!("= {}", res),
        }
    }
}
```

`eval()` で得られるのは `(Option<String>, f64)` である。`Stmt::Assign` の時にタプルの 0 番目に作成した変数名が格納されている。
引数に渡した `map` は変数のテーブルである。

`lexer::parse()` と `eval()` の実装は今回の本題である Pratt パーサとは関係がないし、単純な処理しかしていないので説明は省く。
なお、不正な入力に対しては `panic!()` するようになっている。本来 `Result` にした方が良いが、簡単のため `panic!()` することとした。

<details>
  <summary>lexer::parse()</summary>

```rust
mod lexer {
    use super::Token;

    pub fn parse(input: &str) -> Vec<Token> {
        let mut chars = input.chars().peekable();
        let mut tokens = Vec::new();
        while let Some(c) = chars.next() {
            if c.is_ascii_whitespace() {
                continue;
            }
            match c {
                '0'..='9' => {
                    let mut num = c.to_string();
                    loop {
                        match chars.peek() {
                            Some(c) if c.is_ascii_digit() || *c == '.' => {
                                num.push(*c);
                                chars.next();
                            }
                            _ => break,
                        }
                    }
                    tokens.push(Token::Num(num.parse().unwrap()))
                }
                '+' | '-' | '*' | '/' | '^' | '!' | '(' | ')' | '=' => tokens.push(Token::Op(c)),
                'a'..='z' | 'A'..='Z' => {
                    let mut name = c.to_string();
                    loop {
                        match chars.peek() {
                            Some(c) if c.is_ascii_alphanumeric() => {
                                name.push(*c);
                                chars.next();
                            }
                            _ => break,
                        }
                    }
                    tokens.push(Token::Ident(name));
                }
                _ => panic!("Unexpected char: {:?}", c),
            }
        }
        tokens
    }
}
```

</details>

<details>
  <summary>eval()</summary>

```rust
fn eval(stmt: &Stmt, map: &mut HashMap<String, f64>) -> (Option<String>, f64) {
    fn _eval(expr: &Expr, map: &HashMap<String, f64>) -> f64 {
        match expr {
            Expr::Num(x) => *x,
            Expr::Ident(name) => match map.get(name) {
                Some(x) => *x,
                None => panic!("Unknown variable: {}", name),
            },
            Expr::Unary(op, expr) => match op {
                '+' => _eval(expr, map),
                '-' => -_eval(expr, map),
                '!' => {
                    let expr = _eval(expr, map);
                    if (expr.abs() - expr) > 1e-8 || expr < 0.0 {
                        panic!("Invalid factorial: {}", expr);
                    }
                    let expr = expr.abs() as i64;
                    let res = (1..=expr).product::<i64>();
                    res as f64
                }
                _ => unimplemented!("op: '{}'", op),
            },
            Expr::Binary(op, lhs, rhs) => match op {
                '+' => _eval(lhs, map) + _eval(rhs, map),
                '-' => _eval(lhs, map) - _eval(rhs, map),
                '*' => _eval(lhs, map) * _eval(rhs, map),
                '/' => _eval(lhs, map) / _eval(rhs, map),
                '^' => {
                    let lhs = _eval(lhs, map);
                    let rhs = _eval(rhs, map);
                    if rhs < 0.0 {
                        panic!("Invalid exponent: {}", rhs);
                    }
                    lhs.powf(rhs)
                }
                _ => unimplemented!("op: '{}'", op),
            },
            Expr::Call(name, arg) => match name.as_str() {
                "sqrt" => _eval(arg, map).sqrt(),
                "abs" => _eval(arg, map).abs(),
                _ => unimplemented!("name: '{}'", name),
            },
        }
    }
    match stmt {
        Stmt::Assign(name, expr) => {
            let res = _eval(expr, map);
            map.insert(name.clone(), res);
            (Some(name.clone()), res)
        }
        Stmt::Expr(expr) => (None, _eval(expr, map)),
    }
}
```

</details>

`parser::parse()` は次のセクションから実装していく。

## Parser の実装

本題のパーサを実装していく。

実装手順を整理するために、文法（の一部）を再掲する。

```txt
Stmt   ::= Assign | Expr
Assign ::= Ident '=' Expr
Expr   ::= Num | Ident | Unary | Binary | Call | '(' Expr ')'
```

初めからこの全てをパースできるパーサを作るのは大変なので、簡単なところから作り、それに付け加えていく形で実装する。

まずは次の文法をパースできるようにする。

```txt
Stmt   ::= Expr
Expr   ::= Num | Ident | Unary | Binary
```

`Assign`, `Call`, `'(' Expr ')'` のパースを後から付け加えていく。

以降の実装では、parser モジュール内に関数を実装していく。
`mod parser {}` の記述は省略する。
また、`mod parser` 内では、次が `use` されているとして進める。

```rust
use super::{Expr, Stmt, Token};
use std::{iter::Peekable, slice::Iter};
```

### `Stmt ::= Expr`

`Stmt` を返す関数は `parser::parse()` 関数であった。まずはそれを定義する。

```rust
pub fn parse(tokens: &[Token]) -> Stmt {
    let mut tokens = tokens.iter().peekable();
    let expr = expr_bp(&mut tokens, 0);
    if tokens.next().is_some() {
        panic!("Expected EOI, got {:?}", tokens.peek());
    }
    Stmt::Expr(expr)
}
```

先ほど [Pratt パーサとは](#prattパーサとは)で少し書いた通り、`Expr` は LL(1) である。
これをわかりやすくするため、Rust の `Peekable` を用ることとする。

`parser::parse()` では `&[Token]` を `Peekable` にして `expr_bp()` に渡す。
今回作成する電卓の仕様より、入力は 1 行であるのだから、`Expr` のあとは EOI (End Of Input) であるはずである。
つまり、`expr_bp(&mut tokens, 0)` の後は `tokens` が空（要素数 0）になってなければならない。
`if tokens.next().is_some() { .. }` の部分でそれを検証している。

`expr_bp()` は次で作成していく。

### `Expr ::= Num | Ident | Unary | Binary`

`expr_bp()` は [Pratt パーサとは](#prattパーサとは)の疑似コードで示した `expr_bp()` と同じ処理をするもので、Pratt パーサの実装である。

```rust
fn expr_bp(tokens: &mut Peekable<Iter<'_, Token>>, min_bp: u8) -> Expr {
    let Some(current) = tokens.next() else {
        panic!("Unexpected EOI");
    };
    // 前置演算子の処理
    let lhs = ...;
    loop {
        let Some(current) = tokens.peek() else {
            break;
        };
        // 中置演算子の処理
        // 後置演算子の処理
        break;
    }
    lhs
}
```

これらの処理を実装する前に、ヘルパとなる関数を定義する。

```rust
// Priority: (0 is lowest)
//   0: +, -
//   1: *, /
//   2: unary +, unary -
//   3: ^
//   4: !
impl Token {
    fn prefix_op(&self) -> Option<(char, u8)> {
        match self {
            Token::Op(c @ ('+' | '-')) => Some((*c, 5)),
            _ => None,
        }
    }

    fn postfix_op(&self) -> Option<(char, u8)> {
        match self {
            Token::Op(c @ '!') => Some((*c, 9)),
            _ => None,
        }
    }

    fn infix_op(&self) -> Option<(char, u8, u8)> {
        match self {
            Token::Op(c @ ('+' | '-')) => Some((*c, 1, 2)),
            Token::Op(c @ ('*' | '/')) => Some((*c, 3, 4)),
            Token::Op(c @ '^') => Some((*c, 8, 7)),
            _ => None,
        }
    }
}
```

`Token` が前置/後置/中置演算子なのかを判定し、その演算子（`char`）と Binding Power を返す関数である。
疑似コードでは `if op in POSTFIX_OP:` などとしていた部分に相当する。
なお、Binding Power は `(x, y)` だと書いたが、前置・後置演算子は片方が `()` となるため、省略して片方だけ返すように実装している。(もちろん、`((), u8) ` などを返り値の型としても構わない)  
<small>
Binding Power の決め方は、演算子の優先度 (Priority) の値が x であったとしたら、2x + 1, 2x + 2 とすると良いと思われる。
演算子同士の整合性を取る時、 Binding Power は 2 つ値を持っているため、考えることが多くなってしまうので Priority から計算できるようにしておくとわかりやすい。
</small>

これらのヘルパ関数を利用して `expr_bp` を実装する。

```rust
fn expr_bp(tokens: &mut Peekable<Iter<'_, Token>>, min_bp: u8) -> Expr {
    let Some(current) = tokens.next() else {
        panic!("Unexpected EOI");
    };

    // 前置演算子の処理
    let mut lhs = match current.prefix_op() {
        Some((op, r_bp)) => {
            let rhs = expr_bp(tokens, r_bp);
            Expr::Unary(op, Box::new(rhs))
        }
        None => match current {
            Token::Num(x) => Expr::Num(*x),
            Token::Ident(x) => Expr::Ident(x.clone()),
            Token::Op(op) => panic!("Unexpected op: {:?}", op),
        },
    };

    loop {
        let Some(current) = tokens.peek() else {
            break;
        };

        // 後置演算子の処理
        if let Some((op, l_bp)) = current.postfix_op() {
            if l_bp < min_bp {
                break;
            }
            tokens.next();
            lhs = Expr::Unary(op, Box::new(lhs));
            continue;
        }

        // 中置演算子の処理
        if let Some((op, l_bp, r_bp)) = current.infix_op() {
            if l_bp < min_bp {
                break;
            }
            tokens.next();
            let rhs = expr_bp(tokens, r_bp);
            lhs = Expr::Binary(op, Box::new(lhs), Box::new(rhs));
            continue;
        }

        break;
    }
    lhs
}
```

ここまで実装すれば、基本となる文法は処理できるようになっている。  
<small>
変数定義や、カッコ、関数呼び出しが含まれるのはパースに失敗する。
</small>

```txt
> 1 + 2 * 3
= 7
> 1 ^ 2 ^ 3
= 1
> -2 * 3 * 4
= -24
> 3 * -2^4!
= -50331648
```

以降、`Assign`, `Call`, `'(' Expr ')'` のパースできるように拡張していく。

### Assign

これに対応するには `parser::parse()` を変更する。先頭 2 つのトークンを見て分岐すれば良い。

```diff
pub fn parse(tokens: &[Token]) -> Stmt {
-   let mut tokens = tokens.iter().peekable();
-   let expr = expr_bp(&mut tokens, 0);
-   if tokens.next().is_some() {
-       panic!("Expected EOI, got {:?}", tokens.peek());
+   match (tokens.get(0), tokens.get(1)) {
+       (None, _) => panic!("Unexpected EOI"),
+       (Some(Token::Ident(name)), Some(Token::Op('='))) => {
+           let mut tokens = tokens[2..].iter().peekable();
+           let expr = expr_bp(&mut tokens, 0);
+           if tokens.next().is_some() {
+               panic!("Expected EOI, got {:?}", tokens.peek());
+           }
+           Stmt::Assign(name.clone(), expr)
+       }
+       _ => {
+           let mut tokens = tokens.iter().peekable();
+           let expr = expr_bp(&mut tokens, 0);
+           if tokens.next().is_some() {
+               panic!("Expected EOI, got {:?}", tokens.peek());
+           }
+           Stmt::Expr(expr)
+       }
    }
-   Stmt::Expr(expr)
}
```

これで変数定義ができるようになった。

```txt
> a = 2 * 3
a = 6
> a^2
= 36
```

### `Call`

関数呼び出しは後置演算子として処理できる。

```diff
...
        // 後置演算子の処理
        if let Some((op, l_bp)) = current.postfix_op() {
            if l_bp < min_bp {
                break;
            }
            tokens.next();
-           lhs = Expr::Unary(op, Box::new(lhs));
+           if op == '(' {
+               let arg = expr_bp(tokens, 0);
+               match tokens.next() {
+                   Some(Token::Op(')')) => (),
+                   _ => panic!("Expected ')', got {:?}", tokens.peek()),
+               }
+               let name = match lhs {
+                   Expr::Ident(name) => name,
+                   _ => panic!("Expected ident, got {:?}", lhs),
+               };
+               lhs = Expr::Call(name, Box::new(arg));
+           } else {
+               lhs = Expr::Unary(op, Box::new(lhs));
+           }
            continue;
        }
...
impl Token {
    ...
    fn postfix_op(&self) -> Option<(char, u8)> {
        match self {
+           Token::Op(c @ ('!' | '(')) => Some((*c, 9)),
            _ => None,
        }
```

これで関数呼び出しが処理できるようになった。
呼び出せる関数は、`eval()` 内で定義した `abs()` と `sqrt()` である。

```txt
> abs(-5)
= 5
> sqrt(2)
= 1.4142135623730951
> 2 ^ sqrt(2^3 + 1)
= 8
```

### `'(' Expr ')'`

変更点は次の通りである。

```diff
fn expr_bp(tokens: &mut Peekable<Iter<'_, Token>>, min_bp: u8) -> Expr {
    ...
    // 前置演算子の処理
    let mut lhs = match current.prefix_op() {
        ...
        None => match current {
            Token::Num(x) => Expr::Num(*x),
            Token::Ident(x) => Expr::Ident(x.clone()),
+           Token::Op('(') => {
+               let res = expr_bp(tokens, 0);
+               match tokens.next() {
+                   Some(Token::Op(')')) => res,
+                   _ => panic!("Expected ')', got {:?}", tokens.peek()),
+               }
+           }
            Token::Op(op) => panic!("Unexpected op: {:?}", op),
        },
```

これで、カッコが含まれるものを処理できるようになった。

```txt
> (((0)))
= 0
> (-(2)*3)^4
= 1296
```

## 完成

これで本記事の冒頭に示した処理ができる電卓を作成できた。

<details>
<summary>コード全体</summary>

Repository: [https://github.com/ryota2357/learn-pratt-parser](https://github.com/ryota2357/learn-pratt-parser)

```rust
use std::{
    collections::HashMap,
    io::{stdin, stdout, Write},
};

#[derive(Debug, Clone, PartialEq)]
enum Token {
    Num(f64),
    Op(char),
    Ident(String),
}

#[derive(Debug, Clone, PartialEq)]
enum Expr {
    Num(f64),
    Ident(String),
    Unary(char, Box<Expr>),
    Binary(char, Box<Expr>, Box<Expr>),
    Call(String, Box<Expr>),
}

#[derive(Debug, Clone, PartialEq)]
enum Stmt {
    Assign(String, Expr),
    Expr(Expr),
}

fn eval(stmt: &Stmt, map: &mut HashMap<String, f64>) -> (Option<String>, f64) {
    fn _eval(expr: &Expr, map: &HashMap<String, f64>) -> f64 {
        match expr {
            Expr::Num(x) => *x,
            Expr::Ident(name) => match map.get(name) {
                Some(x) => *x,
                None => panic!("Unknown variable: {}", name),
            },
            Expr::Unary(op, expr) => match op {
                '+' => _eval(expr, map),
                '-' => -_eval(expr, map),
                '!' => {
                    let expr = _eval(expr, map);
                    if (expr.abs() - expr) > 1e-8 || expr < 0.0 {
                        panic!("Invalid factorial: {}", expr);
                    }
                    let expr = expr.abs() as i64;
                    let res = (1..=expr).product::<i64>();
                    res as f64
                }
                _ => unimplemented!("op: '{}'", op),
            },
            Expr::Binary(op, lhs, rhs) => match op {
                '+' => _eval(lhs, map) + _eval(rhs, map),
                '-' => _eval(lhs, map) - _eval(rhs, map),
                '*' => _eval(lhs, map) * _eval(rhs, map),
                '/' => _eval(lhs, map) / _eval(rhs, map),
                '^' => {
                    let lhs = _eval(lhs, map);
                    let rhs = _eval(rhs, map);
                    if rhs < 0.0 {
                        panic!("Invalid exponent: {}", rhs);
                    }
                    lhs.powf(rhs)
                }
                _ => unimplemented!("op: '{}'", op),
            },
            Expr::Call(name, arg) => match name.as_str() {
                "sqrt" => _eval(arg, map).sqrt(),
                "abs" => _eval(arg, map).abs(),
                _ => unimplemented!("name: '{}'", name),
            },
        }
    }
    match stmt {
        Stmt::Assign(name, expr) => {
            let res = _eval(expr, map);
            map.insert(name.clone(), res);
            (Some(name.clone()), res)
        }
        Stmt::Expr(expr) => (None, _eval(expr, map)),
    }
}

fn main() {
    fn question(msg: &str) -> String {
        let mut stdout = stdout();
        stdout.write_all(msg.as_bytes()).unwrap();
        stdout.flush().unwrap();
        let mut input = String::new();
        stdin().read_line(&mut input).unwrap();
        input
    }

    let mut map = HashMap::new();
    loop {
        let line = question("> ");
        let tokens = lexer::parse(&line);
        let stmt = parser::parse(&tokens);
        let res = eval(&stmt, &mut map);
        match res {
            (Some(name), res) => println!("{} = {}", name, res),
            (None, res) => println!("= {}", res),
        }
    }
}

mod lexer {
    use super::Token;

    pub fn parse(input: &str) -> Vec<Token> {
        let mut chars = input.chars().peekable();
        let mut tokens = Vec::new();
        while let Some(c) = chars.next() {
            if c.is_ascii_whitespace() {
                continue;
            }
            match c {
                '0'..='9' => {
                    let mut num = c.to_string();
                    loop {
                        match chars.peek() {
                            Some(c) if c.is_ascii_digit() || *c == '.' => {
                                num.push(*c);
                                chars.next();
                            }
                            _ => break,
                        }
                    }
                    tokens.push(Token::Num(num.parse().unwrap()))
                }
                '+' | '-' | '*' | '/' | '^' | '!' | '(' | ')' | '=' => tokens.push(Token::Op(c)),
                'a'..='z' | 'A'..='Z' => {
                    let mut name = c.to_string();
                    loop {
                        match chars.peek() {
                            Some(c) if c.is_ascii_alphanumeric() => {
                                name.push(*c);
                                chars.next();
                            }
                            _ => break,
                        }
                    }
                    tokens.push(Token::Ident(name));
                }
                _ => panic!("Unexpected char: {:?}", c),
            }
        }
        tokens
    }
}

mod parser {
    use super::{Expr, Stmt, Token};
    use std::{iter::Peekable, slice::Iter};

    pub fn parse(tokens: &[Token]) -> Stmt {
        match (tokens.get(0), tokens.get(1)) {
            (None, _) => panic!("Unexpected EOI"),
            (Some(Token::Ident(name)), Some(Token::Op('='))) => {
                let mut tokens = tokens[2..].iter().peekable();
                let expr = expr_bp(&mut tokens, 0);
                if tokens.next().is_some() {
                    panic!("Expected EOI, got {:?}", tokens.peek());
                }
                Stmt::Assign(name.clone(), expr)
            }
            _ => {
                let mut tokens = tokens.iter().peekable();
                let expr = expr_bp(&mut tokens, 0);
                if tokens.next().is_some() {
                    panic!("Expected EOI, got {:?}", tokens.peek());
                }
                Stmt::Expr(expr)
            }
        }
    }

    fn expr_bp(tokens: &mut Peekable<Iter<'_, Token>>, min_bp: u8) -> Expr {
        let Some(current) = tokens.next() else {
            panic!("Unexpected EOI");
        };

        // 前置演算子の処理
        let mut lhs = match current.prefix_op() {
            Some((op, r_bp)) => {
                let rhs = expr_bp(tokens, r_bp);
                Expr::Unary(op, Box::new(rhs))
            }
            None => match current {
                Token::Num(x) => Expr::Num(*x),
                Token::Ident(x) => Expr::Ident(x.clone()),
                Token::Op('(') => {
                    let res = expr_bp(tokens, 0);
                    match tokens.next() {
                        Some(Token::Op(')')) => res,
                        _ => panic!("Expected ')', got {:?}", tokens.peek()),
                    }
                }
                Token::Op(op) => panic!("Unexpected op: {:?}", op),
            },
        };

        loop {
            let Some(current) = tokens.peek() else {
                break;
            };

            // 後置演算子の処理
            if let Some((op, l_bp)) = current.postfix_op() {
                if l_bp < min_bp {
                    break;
                }
                tokens.next();
                if op == '(' {
                    let arg = expr_bp(tokens, 0);
                    match tokens.next() {
                        Some(Token::Op(')')) => (),
                        _ => panic!("Expected ')', got {:?}", tokens.peek()),
                    }
                    let name = match lhs {
                        Expr::Ident(name) => name,
                        _ => panic!("Expected ident, got {:?}", lhs),
                    };
                    lhs = Expr::Call(name, Box::new(arg));
                } else {
                    lhs = Expr::Unary(op, Box::new(lhs));
                }
                continue;
            }

            // 中置演算子の処理
            if let Some((op, l_bp, r_bp)) = current.infix_op() {
                if l_bp < min_bp {
                    break;
                }
                tokens.next();
                let rhs = expr_bp(tokens, r_bp);
                lhs = Expr::Binary(op, Box::new(lhs), Box::new(rhs));
                continue;
            }

            break;
        }
        lhs
    }

    // Priority: (0 is lowest)
    //   0: +, -
    //   1: *, /
    //   2: unary +, unary -
    //   3: ^
    //   4: !
    impl Token {
        fn prefix_op(&self) -> Option<(char, u8)> {
            match self {
                Token::Op(c @ ('+' | '-')) => Some((*c, 5)),
                _ => None,
            }
        }

        fn postfix_op(&self) -> Option<(char, u8)> {
            match self {
                Token::Op(c @ ('!' | '(')) => Some((*c, 9)),
                _ => None,
            }
        }

        fn infix_op(&self) -> Option<(char, u8, u8)> {
            match self {
                Token::Op(c @ ('+' | '-')) => Some((*c, 1, 2)),
                Token::Op(c @ ('*' | '/')) => Some((*c, 3, 4)),
                Token::Op(c @ '^') => Some((*c, 8, 7)),
                _ => None,
            }
        }
    }
}
```

</details>

本記事では実装しなかったが、Pratt パーサを用いることでインデックスアクセス（`a[1]`, 後置演算子として）や三項演算子（`a ? b : c`, 中置演算子として）などもパースできる。
単純な仕組みだが非常に強力で実用的だなと思った。

ちなみに、僕が Pratt パーサを知ったきっかけは [chumsky](https://github.com/zesterer/chumsky) という Rust のパーサーコンビネータである。
chumsky では Pratt パーサを抽象的に扱えるコンビネータが提供されている。([chumsky::pratt (1.0.0-alpha.6)](https://docs.rs/chumsky/1.0.0-alpha.6/chumsky/pratt/index.html))
