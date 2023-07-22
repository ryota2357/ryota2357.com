---
title: "シンプルなDFA型の正規表現エンジンをRustで作成する #1"
postdate: "2023-05-11T17:59"
update: "2023-05-26T10:08"
tags: ["Rust"]
---

書いてたら思いの他長くなったので分割した。

[シンプルな DFA 型の正規表現エンジンを Rust で作成する #0](../dfa-regex-with-rust-0)

このページでは Lexer と Parser を実装する。

## Lexer

Lexer では字句解析をする。具体的には与えられた正規表現を Token という単位で分割する。Token に分割することによって次に作る Parser での実装が楽になる。

今回使用する Token の種類は次のとおりである。

| 種類          | 説明                  |
| ------------- | --------------------- |
| Character     | 文字、'a' や 'あ'など |
| UnionOperator | 和集合演算子 '        |
| StarOperator  | 繰り返し演算子 '\*'   |
| LeftParen     | 左括弧 '('            |
| RightParen    | 右括弧 ')'            |
| EndOfFile     | 文末                  |

Token に変換する際注意することは「バックスラッシュを使ったエスケープ文字」である。エスケープ文字のため、Character である `'('` が存在することがある。

### 実装

実装は `src/lexer.rs` に行う。

まずは Token を表す enum を作成する。

```rust
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Token {
    Character(char),
    UnionOperator,
    StarOperator,
    LeftParen,
    RightParen,
    EndOfFile,
}
```

続いて Lexer を作成する。Lexer は字句解析する文字列を `Chars` として持つこととする。

```rust
pub struct Lexer<'a> {
    string: Chars<'a>,
}
```

続いて Lexer のメソッド(関連関数)を作成する。`new(string: &str)` で Lexer を構築し、`scan(&mut self)` でこのメソッドが呼ばれるたびに 1 文字目から順に 1 つずつ Token を返却する。

```rust
impl Lexer<'_> {
    pub fn new(string: &str) -> Lexer {
        Lexer {
            string: string.chars(),
        }
    }

    pub fn scan(&mut self) -> Token {
        let Some(char) = self.string.next() else {
            return Token::EndOfFile
        };
        match char {
            '\\' => Token::Character(self.string.next().unwrap()),
            '|' => Token::UnionOperator,
            '(' => Token::LeftParen,
            ')' => Token::RightParen,
            '*' => Token::StarOperator,
            _ => Token::Character(char),
        }
    }
}
```

Lexer が正しく動いていることを確認するためテストを作成する。

```rust
#[cfg(test)]
mod tests {
    use crate::lexer::*;

    #[test]
    fn scan() {
        let mut lexer = Lexer::new(r"a|(bc)*");
        assert_eq!(lexer.scan(), Token::Character('a'));
        assert_eq!(lexer.scan(), Token::UnionOperator);
        assert_eq!(lexer.scan(), Token::LeftParen);
        assert_eq!(lexer.scan(), Token::Character('b'));
        assert_eq!(lexer.scan(), Token::Character('c'));
        assert_eq!(lexer.scan(), Token::RightParen);
        assert_eq!(lexer.scan(), Token::StarOperator);
        assert_eq!(lexer.scan(), Token::EndOfFile);
    }

    #[test]
    fn scan_with_escape() {
        let mut lexer = Lexer::new(r"a|\|\\(\)");
        assert_eq!(lexer.scan(), Token::Character('a'));
        assert_eq!(lexer.scan(), Token::UnionOperator);
        assert_eq!(lexer.scan(), Token::Character('|'));
        assert_eq!(lexer.scan(), Token::Character('\\'));
        assert_eq!(lexer.scan(), Token::LeftParen);
        assert_eq!(lexer.scan(), Token::Character(')'));
        assert_eq!(lexer.scan(), Token::EndOfFile);
    }

    #[test]
    fn with_empty() {
        let mut lexer = Lexer::new(r#""#);
        assert_eq!(lexer.scan(), Token::EndOfFile);
    }
}
```

テストから正しく Token が返却されていることがわかる。エスケープ文字の処理も正しく動作している。

## Parser

Parser は Token を元に構文解析をして、構文木を生成するものである。次に文法規則を示す。

```bnf
<expression>     ::= <sub_expression> Token::EndOfFile
<sub_expression> ::= <sequence> '|' <sub_expression>
                 |   <sequence>
<sequence>       ::= <sub_sequence>
                 |    ''
<sub_sequence>   ::= <star sub_sequence>
                 |   <star>
<star>           ::= <factor> '*'
                 |   <factor>
<factor>         ::= '(' <sub_expression> ')'
                 |   Token::Character
```

次に参考記事よりこの規則についての補足説明を引用する。

> [https://codezine.jp/article/detail/3158?p=2](https://codezine.jp/article/detail/3158?p=2)
>
> 予言的パーサと左再帰
>
> 予言的パーサでは文法規則に左再帰があると無限ループに陥り、うまく処理ができません。「左再帰」とは、右辺の左端に左辺の変数自身が現れる規則のことです。つまり、「subseq -> star subseq」と言う規則は OK ですが、これを「subseq -> subseq star」と言う規則にはできません。後者の規則を予言的パーサとして組むと、subseq 関数内で「subseq star」のルールが選択された場合、状態を変化させる前にそのまま subseq 関数が呼び出されます。しかし状態が変わってないので、次の subseq 関数呼び出しでもまた「subseq star」のルールが選択され、このまま無限ループとなります。
>
> 「subseq -> star subseq」のように左再帰とならないルールとすれば無限ループは起きないのですが、この場合ルールが右結合の規則として評価されてしまいます。つまり、 文字列 abcd は実際は a(b(cd)) と連結処理されてるものと見なされます。しかし、正規表現の和集合演算と連結演算は結合順序が関係ないため、このように右結合文法として定義しても十分動作します。
>
> 以上のような理由から、今回は文法規則において全ての規則を右結合としました。なお、引き算、割り算等のような、5-3-2 が 5-(3-2)のように右結合になると結果が変わってしまう演算に予言的パーサを適用する場合は、工夫が必要です。

### 実装

Parser は次に示す通りの構造体である。

```rust
pub struct Parser<'a> {
    lexer: Lexer<'a>,
    look: Token,
}
```

Lexer のインスタンス `lexer` をもち、必要に応じて `scan()` を呼び出す。`look` は現在見ている Token である。`look` を用いて Parser 内部で処理を分岐させる。

Parser が外部に公開するメソッドは `parse()` のみで次のとおりである。

```rust
pub fn parse(&mut self) -> Result<Node> {
    self.expression()
}
```

`self.expression()` は後ですぐ実装するが、正規表現の文法規則の 1 つである。  
`Result<T>` は Parser の結果を表すものであり、ファイルスコープのエイリアスである。

```rust
type Result<T> = std::result::Result<T, String>;
```

続いて上で示した文法規則に基づいて Token を構文木に変換する処理を書いていくため、構文木の各頂点を表す enum である `Node` を作成する。

```rust
#[derive(Debug, PartialEq, Eq, Hash)]
pub enum Node {
    Character(char),
    Empty,
    Star(Box<Node>),
    Union(Box<Node>, Box<Node>),
    Concat(Box<Node>, Box<Node>),
}
```

この `Node` を用いて次のような変換ができるよう実装をしていく。

```rust

let mut parser = Parser::new(Lexer::new(r"a|(bc)*"));
assert_eq!(
    parser.expression(),
    Ok(Node::Union(
        Box::new(Node::Character('a')),
        Box::new(Node::Star(Box::new(Node::Concat(
            Box::new(Node::Character('b')),
            Box::new(Node::Character('c'))
        ))))
    ))
);
```

`parser.expression()` は文法規則の `<expression>` に対応する。文法規則の下の方(`<factor>`)から順に上(`<expression>`)に向かってボトムアップで実装していく。

#### 文法規則実装の準備

文法規則をプログラムとして実装する前に、2 つユーティリティ的な関数を実装しておく。

1 つ目は文法エラーの文字列を生成する関数である。`Err(error_msg(&[来るべきToken], 実際のToken)` のようにして使う。

```rust
fn error_msg(expected: &[Token], actual: Token) -> String {
    let expected = expected
        .iter()
        .map(|token| format!("'{}'", token))
        .collect::<Vec<_>>()
        .join(", ");
    let actual = match actual {
        Token::Character(char) => format!("'{}'", char),
        _ => format!("'{}'", actual),
    };
    format!("Expected one of [{}], found {}", expected, actual)
}

// ↓は lexer.rs に追加実装している。
impl Display for Token {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let str = match self {
            Token::Character(_) => "Character",
            Token::UnionOperator => "|",
            Token::StarOperator => "*",
            Token::LeftParen => "(",
            Token::RightParen => ")",
            Token::EndOfFile => "EOF",
        };
        write!(f, "{}", str)
    }
}
```

2 つ目は次に示す `match_next()` メソッドである。これはエラーチェック付きの Token 読み込みメソッドである。文法規則の実装で、Token を読み進めるのに直接 `self.lexer.scan()` を使うのではなく、`self.match_next()` を用いて読み進めることにする。

```rust
impl Parser<'_> {
    fn match_next(&mut self, token: Token) -> Result<()> {
        match &self.look {
            look if *look == token => {
                self.look = self.lexer.scan();
                Ok(())
            }
            other => Err(error_msg(&[token], *other)),
        }
    }
}
```

#### factor

ここからは文法規則を実装していく。

pub ではない関数 `factor(&mut self)` として実装する。

```rust
impl Parser<'_> {
    // <factor> ::= '(' <sub_expression> ')' | Character
    fn factor(&mut self) -> Result<Node> {
        match &self.look {
            Token::LeftParen => {
                self.match_next(Token::LeftParen)?;
                let node = self.sub_expression();
                self.match_next(Token::RightParen)?;
                node
            }
            Token::Character(char) => {
                let node = Node::Character(*char);
                self.match_next(Token::Character(*char))?;
                Ok(node)
            }
            other => Err(error_msg(
                &[Token::LeftParen, Token::Character('_')],
                *other,
            )),
        }
    }
}
```

`self.look` に従って処理を分岐する。文法規則に従い、現在見ている Token(`self.look`)が左括弧(`Token::LeftParen`)であれは左側(`'(' <subexpr> ')'`)のルールを適用し、文字(`Token::Character`)であれば右側(`Character`)を適用する。

(まだ `self.sub_expression()` は実装してないので、LS 等がエラーを出すと思うがスルーする。)

#### star

`<factor>` と同様に `<start>` も実装していく。

```rust
impl Parser<'_> {
    // <star> ::= <factor> '*' | <factor>
    fn star(&mut self) -> Result<Node> {
        let factor = self.factor();
        match &self.look {
            Token::StarOperator => {
                self.match_next(Token::StarOperator)?;
                Ok(Node::Star(Box::new(factor?)))
            }
            _ => factor,
        }
    }
}
```

`<start>` のルールは必ず `<factor>` から始まる。なので先に `self.factor()` を呼び factor を取得しておく。`self.look` を見て、右側のルールなら `Node::Start` として、そうでなければ factor をそのまま返却する。

#### sub_sequence

`<sub_sequence>` の実装は以下のとおりである。

```rust
impl Parser<'_> {
    // <sub_sequence> ::= <star> <sub_sequence> | <star>
    fn sub_sequence(&mut self) -> Result<Node> {
        let star = self.star();
        match &self.look {
            Token::LeftParen | Token::Character(_) => Ok(Node::Concat(
                Box::new(star?),
                Box::new(self.sub_sequence()?),
            )),
            _ => star,
        }
    }
}
```

まず、`<star>` と同様に `<sub_sequence>` は `<star>` から始まるので `self.star()` を呼び取得する。次の分岐は `<sub_sequence>` があるかないかで分岐する必要がある。`<sub_sequence>` は必ず `<star>` から始まる。そして `<star>` は必ず `<factor>` から始まる。さらに `<factor>` は `'('` か `Charactor` から始まる。つまり、`<sub_sequence>の` 分岐条件は `<star>` の次に `'('` か `Charactor` があるかどうかである。

#### sequence

```rust
impl Parser<'_> {
    // <sequence> ::= <sub_sequence> | ''
    fn sequence(&mut self) -> Result<Node> {
        match &self.look {
            Token::LeftParen | Token::Character(_) => self.sub_sequence(),
            _ => Ok(Node::Empty),
        }
    }
}
```

`<sub_sequence>` の時と同様に分岐を考える。そうすると右側のルールとなる条件は self.look が `'('` か `Charactor` である時である。

#### sub_expression

```rust
impl Parser<'_> {
    // <sub_expression> ::= <sequence> '|' <sub_expression> | <sequence>
    fn sub_expression(&mut self) -> Result<Node> {
        let sequence = self.sequence();
        match &self.look {
            Token::UnionOperator => {
                self.match_next(Token::UnionOperator)?;
                Ok(Node::Union(
                    Box::new(sequence?),
                    Box::new(self.sub_expression()?),
                ))
            }
            _ => sequence,
        }
    }
}
```

どのルールも `<sequence>` から始まっているので `self.sequence()` を呼び `sequence` を取得する。分岐は `'|'` があるかどうかで行う。

#### expression

```rust
impl Parser<'_> {
    // <expression> ::= <sub_expression> EOF
    fn expression(&mut self) -> Result<Node> {
        let expression = self.sub_expression();
        self.match_next(Token::EndOfFile)?;
        expression
    }
}
```

最後は分岐もない。ちゃんと `EOF` になっているか確認する。

## テスト

期待通り実装されていることを確認する。

```rust
#[cfg(test)]
mod tests {
    use crate::lexer::*;
    use crate::parser::*;

    #[test]
    fn expression() {
        let mut parser = Parser::new(Lexer::new(r"a|(bc)*"));
        assert_eq!(
            parser.expression(),
            Ok(Node::Union(
                Box::new(Node::Character('a')),
                Box::new(Node::Star(Box::new(Node::Concat(
                    Box::new(Node::Character('b')),
                    Box::new(Node::Character('c'))
                ))))
            ))
        );
    }

    #[test]
    fn expression2() {
        let mut parser = Parser::new(Lexer::new(r"a|"));
        assert_eq!(
            parser.expression(),
            Ok(Node::Union(
                Box::new(Node::Character('a')),
                Box::new(Node::Empty)
            ))
        );
    }

    #[test]
    fn fail() {
        let mut parser1 = Parser::new(Lexer::new(r"a("));
        let mut parser2 = Parser::new(Lexer::new(r"a)"));
        assert!(parser1.expression().is_err());
        assert!(parser2.expression().is_err());
    }
}
```

テストがとおり、無事期待通りパースされて、構文木が構築されていることがわかる。

上記テストでは `parser.expression()` をテストしているが、実際外部から使うのはそのラッパーの `parser.parse()` メソッドである。

```rust
pub fn parse(&mut self) -> Result<Node> {
    self.expression()
}
```

続いて、[#2 NFA と DFA を構築して Regex を作る](../dfa-regex-with-rust-2)。
