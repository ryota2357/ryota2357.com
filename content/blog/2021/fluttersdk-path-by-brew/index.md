---
title: "brew cask で入れた Flutter SDK のパスの取得方法"
postdate: "2021-05-22T13:26"
update: "2021-05-22T13:26"
tags: ["Flutter"]
---

flutter web やってようとした時のこと。

新規プロジェクトを作成しようとしたら、flutter sdk のパスを入れろと言われた。  
brew cask で flutter sdk 入れてたのでどこにあるのかわからなかった。

## 結論

```sh
$ flutter doctor -v
```

とすれば OK。

```txt
[✓]  Flutter (Channel stable, 2.0.6, on macOS 11.2.3 darwin-x64, locale ja-JP)
    • Flutter version 2.0.6 at /usr/local/Caskroom/flutter/2.0.6/flutter
    • Framework revision 1d9032c7e1 (3 weeks ago), 2021-04-29 17:37:58 -0700
    • Engine revision 05e680e202
    • Dart version 2.12.3
```

2 行目のこれ ↓

```txt
~~~ at /usr/local/Caskroom/flutter/2.0.6/flutter
```
