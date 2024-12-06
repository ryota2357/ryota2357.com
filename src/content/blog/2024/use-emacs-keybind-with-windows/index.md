---
title: "Windows で Emacs キーバインドがしたかった"
postdate: "2024-12-06T15:24"
update: "2024-12-06T15:24"
tags: ["Windows", "Emacs"]
---

> この記事は [ryota2357 Advent Calendar 2024](https://adventar.org/calendars/10716) の 6 日目の記事です。

今年の夏のインターンでは初の Windows での開発だった。

僕は普段 macOS で開発しているため、標準で使える Emacs キーバインド重宝している。
メインのテキストエディタである Neovim 内でも使用しているほどである。

Windows 開発初日、CapsLock と Control の位置が Windows と macbook で異なることもあり、無駄に CapsLock を打つため、まともにタイピングができず、かなりストレスだった。

幸いインターン先は Change Key と Auto Hot Key をインストールしても良いところであったため、この 2 つを使用して Emacs キーバインドを再現した。
その方法をここに残しておく。

## インストール

Change Key は `winget` で入手できなかった。次のリンクからインストールした。

[Change Key - 窓の杜: https://forest.watch.impress.co.jp/library/software/changekey/](https://forest.watch.impress.co.jp/library/software/changekey/)

Auto Hot Key は `winget` で：

```powershell
winget install --id=AutoHotkey.AutoHotkey -e
```

## 設定

CapsLock と Control を入れ替える方法が最初に思いつくが、それは Control + a などの便利なショートカットを潰すことにもなるし、Auto Hot Key でうまく動作しないこともあるので、やめた方がいいのかもしれない。

今回僕は、Change Key で CapsLock を F22 に割り当て、Auto Hot key で F21 + ... を各種 Emacs キーバインドに割り当てた。
この方法だと Control + a などは引き続き元のキーの場所を押すことで使用できる。
(CapsLock は使えなくなるが元々使ってないので問題ない。)

Auto Hot Key の設定は次である。

```ahk
F21 & b::Send "{Left}"
F21 & f::Send "{Right}"
F21 & n::Send "{Down}"
F21 & p::Send "{Up}"
F21 & a::Send "{Home}"
F21 & e::Send "{End}"
F21 & d::Send "{Del}"
F21 & h::Send "{BS}"
F21 & m::Send "{Enter}"
F21 & k::{
  Send "{ShiftDown}{END}{ShiftUp}"
  Sleep 20 ;[ms] this value depends on your environment
  Send "{Del}"
  return
}

F21 & o::^o
F21 & s::^s
F21 & c::^c
F21 & i::^i
F21 & r::^r
F21 & l::^l
F21 & v::^v
F21 & w::^w
```

前半は Emacs キーバインドである。後半は Neovim や tmux へのフォールバックで必要なので設定した。

Control + k (F21 \& k) の動作が実際の Emacs キーバインドとは異なるが、近い挙動はするものになっている。同じ動作をさせる方法はわからなかった。
