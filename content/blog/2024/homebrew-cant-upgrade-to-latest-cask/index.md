---
title: "Homebrewで最新版のCaskをインストールできない (Core cask tap last commit が古い)"
postdate: "2024-04-13T14:58"
update: "2024-04-13T14:58"
tags: ["Homebrew"]
---

# 問題

`homebrew/homebrew-cask` には新しいバージョンの Cask が置いてあるのに、`brew update --force` 等を行っても手元の `brew upgrade` で更新されない。

`brew outdated` を実行すると、`homebrew/homebrew-cask` には新しいバージョンが追加されているので、更新情報が来るのを期待するが、何も出力されない(全て最新になっていると言われる)。

`brew config` の結果は次のように `Core cask tap last commit` が古い。

```
$ brew config
HOMEBREW_VERSION: 4.2.17-99-g17d5ab3
...省略
Core cask tap HEAD: 1b9a5024...63b9713e72c # <- 少し古い場所を指してる
Core cask tap last commit: 69 minutes ago  # <- 5 minutes ago とかになって欲しい
Core cask tap JSON: 13 Apr 05:24 UTC       # ここは更新されてる...
```

# 解決法

1. `homebrew/homebrew-cask` のインストール場所に移動 (ARM mac なら `/opt/homebrew/Library/Taps/homebrew/homebrew-cask`)
2. `git pull -f`
3. `export HOMEBREW_NO_INSTALL_FROM_API=1`

こうすれば、ひとまず `brew update` 等で更新できるようになる (もちろん `brew outdated` にも表示される)。

## 補足

`HOMEBREW_NO_INSTALL_FROM_API` は開発用のものらしいので、更新したかった Cask を更新できたら、`brew update-reset` などを実行した方が良さそう。

なぜ `brew update --force` で更新を入れられないのか不明だが、上記方法で更新できた。
数時間後に `brew update-reset && brew update --force` をしたら `brew config` の Core cask tap last commit も更新された。

リポジトリの更新を反映するには少し時間をおく必要があるのかもしれない。
