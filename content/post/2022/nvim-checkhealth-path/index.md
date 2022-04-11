---
title: "[NeoVim] python,rubyのglobal変更されない問題はREADME読んでないだけだった件"
postdate: "2022-04-11T13:14"
tags: ["NeoVim"]
---

NeoVim の`:checkhealth`で python, ruby の global 切り替わらない問題の話。

## 反省

新しい Macbook を買って NeoVim 環境を再構築した。  
その時 python と ruby の設定に pyenv, rbenv を使ったけど、global が切り替わらない問題に遭遇した。

pyenv, rbenv の README の Installation を終わらせていないだけだった...

google で調べる前にまず公式の README なりリファレンスは読みましょう、ということ。

## 解決方法

google で「pyenv global 切り替わらない」とか検索すると、path を通せやら init しろやら出てくる。  
記事によって内容が若干違ってどれが正しいの？ってなるけど、README に正しい方法が書いてある。  
ちゃんと README に従おう。

### python

[README.md の Installation](https://github.com/pyenv/pyenv/blob/master/README.md#installation)に書いてあることを抜粋してるだけだが...

まず、pyenv のインストール

```sh
brew install pyenv
```

zsh の人は

```zsh
# ~/.zprofile
eval "$(pyenv init --path)"
```

```zsh
# ~/.zshrc
eval "$(pyenv init -)"
```

をそれぞれ追記する。

最後に python のインストール、global と NeoVim プラグインのインストール

```sh
# install できるバージョンの確認
pyenv install --list

# install
pyenv install 3.*.*

# global にする
pyenv global 3.*.*

# nvim で :checkhealth する。
# ヘルプを見ろと言われて、見に行くと
# 多分こんな感じのコマンドを実行しろと言われる
python3 -m pip install --user --upgrade pynvim
```

### ruby

python と似たような感じ。

[README.md の Installation](https://github.com/rbenv/rbenv/blob/master/README.md#installation)

まず brew

```sh
brew install rbenv ruby-build
```

続いて init を実行

```sh
rbenv init
```

指示が出るから、それに従う。

最後に ruby のインストール、global と NeoVim プラグインのインストール

```sh
# install できるバージョンの確認
rbenv install --list

# install
rbenv install 3.*.*

# global にする
pyenv global 3.*.*

# nvim で :checkhealth する。
# 多分こんな感じのコマンドを実行しろと言われる
gem install neovim
```

以上。  
README とかリファレンスをちゃんと読もう。
