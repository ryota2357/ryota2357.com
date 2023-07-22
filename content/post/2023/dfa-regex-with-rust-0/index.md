---
title: "シンプルなDFA型の正規表現エンジンをRustで作成する #0"
postdate: "2023-05-11T17:43"
update: "2023-05-26T10:08"
tags: ["Rust"]
---

書いてたら思いの他長くなったので分割した。

- [#1 Lexer と Parser の実装](../dfa-regex-with-rust-1)
- [#2 NFA と DFA を構築して Regex を作る](../dfa-regex-with-rust-2)

作成したものは **[ryota2357/dfa-regex](https://github.com/ryota2357/dfa-regex)** に置いてある。

## 参考にしたところ

### オートマトンは正規表現の夢を見るか(見るし、夢というかそのものですらある)

[https://zenn.dev/canalun/articles/regexp_and_automaton](https://zenn.dev/canalun/articles/regexp_and_automaton)

NFA、DFA について基本的な知識はここで知った。  
オートマトンで正規表現を表現しようとした時、どうすればいいかのざっくりとしたイメージがわかるようになる。

### 正規表現エンジンを作ろう 1 ~ 6

[https://codezine.jp/article/detail/3039](https://codezine.jp/article/detail/3039)

Python を用いて DFA 型の正規表現エンジンを実装と解説をとても詳しく丁寧に行ってくれている。  
基本的にここのやり方に沿って行っているけど、一部実装方法が異なっていたりする。
NFA・DFA 周りの実装方法はだいぶ異なっている。
