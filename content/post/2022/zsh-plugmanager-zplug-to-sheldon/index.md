---
title: "zplugからsheldonに乗り換えた"
postdate: "2022-06-03T18:33"
update: "2022-06-04T00:18"
tags: ["Zsh"]
---

zsh の起動が遅かったので調べたら zplug のロードに時間がかかってることがわかった。  
色々調べた結果 sheldon に乗り換えて、なかなかいい感じ。

## sheldon の特徴と感想

ロードは結構速いと思う。[参考にしたこの記事](https://ktrysmt.github.io/blog/migrate-zinit-to-sheldon/)では zinit より少しだけ速度が改善したらしい。  
僕は zinit を使ったことないのでわからないけど、ひとまず zplug よりは圧倒的に速い。

sheldon の特徴として、toml ファイルでのプラグイン管理がある。  
これがなかなか良い。プラグインの遅延ロード設定も簡単にできるし、ローカルの設定ファイルもプラグインと同じ感覚でロードの設定ができる。  
もちろん、toml だから人間にも読みやすい。

## 導入手順と基本的な使い方

基本的には[公式 README](https://github.com/rossmacarthur/sheldon)読めば ok。  
Homebrew とかで sheldon 入れて、`sheldon init`を実行、`eval "$(sheldon source)"`を`~/.zshrc`とかに書けば終了。  
とても簡単。

設定は`~/.sheldon/plugins.toml`に記述する。`sheldon init`を実行すると勝手に作られる。

アップデートは次のコマンドで実行する。

```
$ sheldon lock --update
```

`plugin.toml`の書き方は[README のここ](https://github.com/rossmacarthur/sheldon#%EF%B8%8F-configuration)読めば、だいたいわかる。

## dotfiles で管理する

僕は zshrc とかの の管理は dotfiles で行っていて、ファイルの構成は次のようになっている。

```txt
dotfiles/zsh/
  ├ zshrc.zsh
  ├ zprofile.zsh
  ├ plugin.toml
  ├ defe/
  │ ├ alias.zsh
  │ ├ completion.zsh
  │ └ env-init.zsh
  └ sync/
    ├ alias.zsh
    ├ option.zsh
    └ prompt.zsh
```

zshrc.zsh には`eval "$(sheldon source)"`の 1 行しか書いてない。

`plugins.toml`は次のようになっている。

```toml
shell = 'zsh'

[plugins.zsh-defer]
github = 'romkatv/zsh-defer'
apply = ['source']

[templates]
defer = { value = 'zsh-defer source "{{ file }}"', each = true }

[plugins.compinit]
inline = 'autoload -Uz compinit && zsh-defer compinit'

[plugins.colors]
inline = 'autoload -Uz colors && zsh-defer colors'

[plugins.zsh-autosuggestions]
github = 'zsh-users/zsh-autosuggestions'
apply = ['defer']

[plugins.zsh-syntax-highlighting]
github = 'zsh-users/zsh-syntax-highlighting'
apply = ['defer']

[plugins.dotfiles-sync]
local = '~/dotfiles/zsh/sync'
use = ['*.zsh']
apply = ['source']

[plugins.dotfiles-defer]
local = '~/dotfiles/zsh/defer'
use = ['*.zsh']
apply = ['defer']
```

少し説明すると、

`apply = ['defer']` を指定したのは遅延読み込み、`apply = ['source']`を指定したものは zsh 起動時に読み込まれる。

`defer`は`[template]`によって定義されているもので、プラグイン`zsh-defer`を利用していることがわかる。

```toml
[templates]
defer = { value = 'zsh-defer source "{{ file }}"', each = true }
```

自分が書いてる設定ファイルは`[plugin-dotfiles-sync]`と`[plugin-dotfiles-defer]`で読み込んでいる。  
`sync`の方には起動に読み込んでおく必要があるもをおいて、それ以外は`defer`って感じにしてる。`option.zsh`は`defer`にしたかったのだけど、一部オプションは遅延読み込みが上手くいかないっぽい。だからと言って`alias.zsh`みたいに分離するのも面倒だったので全部`sync`にしている。

あと、`env-init.zsh`には`pyenv`と`rbenv`の init を行っている。最適化をしてない場合、zsh 起動時間で`○○env`の init は大きな時間を占めていると思う(もちろん僕も 1 人であった)。  
`defer`を指定するだけでそれが解消されるのは非常に手軽で嬉しい。

## 速度

手軽に次のコマンドで測定してみた。

```
$ time ( zsh -i -c exit )
```

`zplug`の時の速度を測りたかったのだけど「zplug コマンドが見つからない」エラーが出て、ちゃんと計測できなかったので、[ここの方法](https://qiita.com/vintersnow/items/7343b9bf60ea468a4180#%E3%83%97%E3%83%AD%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB)を参考にプロファイルをとってみた。その結果、`zplug`と名前のついた処理についてだけで 800ms を超える時間がかかっていた(2018 年 macbook pro)。

`sheldon`に乗り換えて、10 数回ほど計測した結果、2018 年 macbook pro では 50ms ほど、2021 年 macbook pro では 40ms ほどであった。

素晴らしい。

## 参考

- [zinit が不安なので sheldon へ移行したら zsh の起動が 50ms と更に速くなった](https://ktrysmt.github.io/blog/migrate-zinit-to-sheldon/)
- [sheldon docs](https://sheldon.cli.rs/Introduction.html)
- [rossmacarthur/sheldon (github)](https://github.com/rossmacarthur/sheldon)
- [zsh の起動が遅いのでなんとかしたい](https://qiita.com/vintersnow/items/7343b9bf60ea468a4180#%25E3%2583%2597%25)
