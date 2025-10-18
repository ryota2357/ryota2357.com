---
title: "Vimにフォーカスを戻したときだけマウスを無効にする"
postdate: "2022-06-18T12:37"
update: "2022-06-18T12:37"
tags: ["Vim", "Neovim"]
---

`set mouse=a` にしているとき、

1. Vim で作業(ターミナル上で)
1. ブラウザとかに移動(ターミナルからフォーカスが外れる)
1. Vim へ戻るためにターミナルのウィンドウをクリック
1. クリックしたところにカーソルが移動してしまう

という感じになる。

スムーズに作業へ戻るために、「フォーカスを戻したときのみ移動しない」ようにしたい。

## 解決方法

次のスクリプトを `.vimrc` に追加すれば、おおよそ期待通りになる。

```vim
set mouse=a

augroup Mouse
  autocmd!
  autocmd FocusGained * call s:OnFocusGained()
  autocmd FocusLost * call s:OnFocusLost()
augroup END

function! s:OnFocusGained() abort
  autocmd CursorMoved,CursorMovedI,ModeChanged,WinScrolled * ++once call s:EnableLeftMouse()
  noremap  <LeftMouse> <Cmd>call <SID>EnableLeftMouse()<CR>
  inoremap <LeftMouse> <Cmd>call <SID>EnableLeftMouse()<CR>
endfunction

function! s:EnableLeftMouse() abort
  noremap  <LeftMouse> <LeftMouse>
  inoremap <LeftMouse> <LeftMouse>
endfunction

function! s:OnFocusLost() abort
  noremap  <LeftMouse> <nop>
  inoremap <LeftMouse> <nop>
endfunction
```

### 説明

まず、前提として僕の環境を載せておく。

- macOS (12.4)
- iTerm2 (3.4.15)
- tmux (3.3a)
- Neovim (0.7)

Vim には `FocusGained` と `FocusLost` というイベントが存在する。

```txt
							*FocusGained*
FocusGained			Vimが入力フォーカスを得たとき。GUI版と、入力
				フォーカスを認識できるいくつかのコンソール版で
				のみ有効。
							*FocusLost*
FocusLost			Vimが入力フォーカスを失ったとき。GUI版と、入力
				フォーカスを認識できるいくつかのコンソール版で
				のみ有効。
```

これを利用する。

単純に、

```vim
  autocmd FocusGained * set mouse=a
  autocmd FocusLost * set mouse=
```

でいいのでは？と思うかもしれないが、これではうまく動作しなかった。  
なので `<LeftMouse>` の有効・無効を切り替えることによって対応した。

`FocusLost` で `<LeftMouse>` を `<nop>` にしている。  
`FocusGained` では `<LeftMouse>` を有効にするタイミングを設定した。

有効にするタイミングは、その人のマウスの利用状況や好みによって変わると思うが僕は `<LeftMouse>` に加えて、

- カーソル移動 (CursorMoved,CursorMovedI)
- モードを変えたとき (ModeChanged)
- ウィンドウをスクロールしたとき (WinScrolled)

でも有効になるように設定した。

## 補足

この方法でうまく動作しない場合は tmux の設定で次のどちらか、または両方を設定してみると良いかもしれない。  
僕は `set -g mouse on` だけ設定している。(off でも問題ないことは確認している)

```
set -g mouse on
set -g focus-events on
```

最後に、 この「`<LeftMouse>` の有効無効を切り替える」という発想は Slack のグループ「vim-jp」にて教えていただきました。ありがとうございました。
