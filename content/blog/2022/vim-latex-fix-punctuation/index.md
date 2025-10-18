---
title: "[Vim] LaTeXで保存時に句読点をカンマ・ピリオドに修正する"
postdate: "2022-05-27T09:40"
update: "2022-05-27T09:40"
tags: ["Vim", "Neovim", "LaTeX"]
---

定期的に置換コマンドを実行するのが面倒だったので自動化した。

## 方法

次のスクリプトを `.vimrc` に追記すれば良い。

```vim
autocmd BufWritePre *.tex :call FixPunctuation()
function! FixPunctuation() abort
  let l:pos = getpos('.')
  silent! execute ':%s/。/. /g'
  silent! execute ':%s/、/, /g'
  silent! execute ':%s/\\\@<!\s\+$//'
  call setpos('.', l:pos)
endfunction
```

## 説明

### autocmd

`BufWritePre`、つまりバッファを保存する直前に置換コマンドを実行（FixPunctuation()を呼び出し）している。

### FixPunctuation()

置換をただ実行するだけだと、置換対象の文字列が見つからなかった時、

```
E486: パターンは見つかりませんでした
```

というエラーが出る。`silent!` をつけるとこれを表示させないようにできる。

また、置換はカーソルの位置を変更してしまう。これを防ぐためには `keepjumps` をつければ良いらしいのだが、なんかうまくいかなかったので、`getpos()`, `setpos()` を利用して制御した。

3 つ目の置換は、余分な空白を除去する置換である。  
この置換をしなかった場合、

```txt
置換前
ホゲホゲ、フガフガ。ぴよぴよ。

置換後
ホゲホゲ, フガフガ. ぴよぴよ.[余分な空白1つ]
```

となってしまう。この置換は[bronson/vim-trailing-whitespace](https://github.com/bronson/vim-trailing-whitespace)を参考にした。
