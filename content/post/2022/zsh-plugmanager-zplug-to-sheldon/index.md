---
title: "zplugからsheldonに乗り換えた"
postdate: "2022-05-30T00:06"
update: "2022-05-30T00:06"
tags: ["Zsh"]
---

zsh の起動が遅かったので調べたら zplug のロードに時間がかかってることがわかった。  
色々調べた結果 sheldon に乗り換えて、なかなかいい感じ。

## sheldon の特徴と感想

ロードは結構速いと思う。[参考にしたこの記事](https://ktrysmt.github.io/blog/migrate-zinit-to-sheldon/)では zinit より少しだけ速度が改善したらしい。  
僕は zinit を使ったことないのでわからないけど、ひとまず zplug よりは圧倒的に速い。

sheldon の特徴として、toml ファイルでのプラグイン管理がある。  
これがなかなか良い。プラグインの遅延ロードの設定とかもできるし、ローカルの設定ファイルとかをプラグインと同じ感覚でロード設定できる。  
もちろん、toml だから人間にも読みやすい。

こんな感じ、説明は後でする。

```toml
[plugins.zsh-syntax-highlighting]
github = 'zsh-users/zsh-syntax-highlighting'
apply = ['defer']

[plugins.dotfiles-sync]
local = '~/dotfiles/zsh/sync'
use = ['*.zsh']
apply = ['source']
```

## 導入手順と基本的な使い方

基本的には[公式 README](https://github.com/rossmacarthur/sheldon)読めば ok.  
Homebrew とかで sheldon 入れて、`sheldon init`を実行、`eval "$(sheldon source)"`を`~/.zshrc`とかに書けば終了。  
とても簡単。

設定は`~/.sheldon/plugins.toml`に記述する。`sheldon init`を実行すると勝手に作られる。

アップデートは次のコマンドで実行する。

```shell
sheldon lock --update
```

### toml ファイルの書き方。

[README のここ](https://github.com/rossmacarthur/sheldon#%EF%B8%8F-configuration)読んで、ざっと雰囲気は掴めると思う。

基本的には上の例で示したように

```toml
[plugins.ユニークな名前]
github = 'hogehoge/fugafuga'
```

で 1 つのプラグインを定義する。

```toml
[plugins.ユニークな名前]
```

## dotfiles で管理する

僕のやってる dotfiles での管理方法を書いておく。
