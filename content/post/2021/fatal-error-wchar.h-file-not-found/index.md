---
title: fatal error- 'wchar.h' file not found の対処法
postdate: "2021-02-20T21:57"
tags: ["C++"]
---

コンテスト中に出てて大変だった。

## 解決策

Xcodeのコマンドラインツールを再度インストールする。  
[参考(StackOverflow)](https://stackoverflow.com/questions/26185978/macos-wchar-h-file-not-found)

```bash
$ xcode-select --install
```

最近Xcodeの更新をしたのが原因かと。  
Xcodeのアップデートでコマンドラインツールが消えてしまった(?)ようである。

## それでも解決しない

StackOverflowにて同様の質問がありましたので、それを参考に色々するのが良いかと思います。
↓
[https://stackoverflow.com/questions/46342411/wchar-h-file-not-found](https://stackoverflow.com/questions/46342411/wchar-h-file-not-found)
