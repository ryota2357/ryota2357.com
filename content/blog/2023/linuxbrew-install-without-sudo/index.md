---
title: "Linuxbrew (Homebrew) をsudoなしでインストールする"
postdate: "2023-10-06T22:55"
update: "2023-10-06T22:55"
tags: ["Homebrew"]
---

学校の Linux PC (ubuntu) に brew を入れようとしたら、`sudo` が使えないと怒られた。

Linuxbrew は `sudo` なしでも入れることはできる。ちょっと公式ドキュメントでの記載場所が見つけにくかったので、ここにメモしておく。

## 手順

`$HOME` (`~/`) 下にインストールする。  
`$HOME` は僕の学校の PC だと、`/home0/y2022/学籍番号/` みたいなのになってる。

まず、[Homebrew/brew](https://github.com/Homebrew/brew) を好きなディレクトリに clone する。
ここでは `~/.linuxbrew` に clone する。

```sh
git clone https://github.com/Homebrew/brew.git ~/.linuxbrew/

# git が使えない場合は次
mkdir ~/.linuxbrew/ && curl -L https://github.com/Homebrew/brew/tarball/master | tar xz --strip 1 -C ~/.linuxbrew/
```

clone できたら、brew のセットアップを実行する。

```sh
eval "$(~/.linuxbrew/bin/brew shellenv)"
brew update --force --quiet
chmod -R go-w "$(brew --prefix)/share/zsh"
```

これで brew が使えるようになっているはずである。

```sh
brew --help
# help の内容が表示される
```

最後に、シェル起動時に brew のセットアップが走るように rc ファイルに追記する。

```sh
$ echo "eval \"\$($(brew --prefix)/bin/brew shellenv)\"" >> ~/.profile
```

上記コマンドでは `.profile` に `eval "$(~/.linuxbrew/bin/brew shellenv)"` (`~/` は絶対パスに展開されたもの) を追記した。
bash を使ってるなら、`.bash_profile` とか、zsh なら `.zprofile` とかにも追記すれば良い。

## 参考

- [Homebrew/brew, docs/Homebrew-on-Linux#install](https://github.com/Homebrew/brew/blob/e0ac5459b3462852012371da9a0b2e085c3ba226/docs/Homebrew-on-Linux.md#install)
- [Homebrew/brew, docs/Installation.md#alternative-installs](https://github.com/Homebrew/brew/blob/e0ac5459b3462852012371da9a0b2e085c3ba226/docs/Installation.md#alternative-installs)
