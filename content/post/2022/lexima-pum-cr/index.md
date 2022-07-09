---
title: "lexima.vimとpum.vimと<CR>"
postdate: "2022-07-09T20:31"
update: "2022-07-09T20:31"
tags: ["Vim", "Neovim"]
---

lexima.vim と pum.vim での\<CR\>の挙動制御について

lexima.vim は内部でマッピング(`inoremap`)を生成する。そのため pum.vim で補完の確定を\<CR\>で行っている場合、このマッピングが衝突してしまい意図しない挙動が起きてしまう。

このことについて先日、lexima.vim でオプションを設定することで解決できるようにする PR を作成した。

https://github.com/cohama/lexima.vim/pull/13

作者の cohama さんからの返信は「他のプラグインに依存する機能をつけたくない」とのことで、マージはされなかった。各自\<CR\>を lexima.vim にも対応するようにマッピングしてくださいとのこと。

## lexima.vim 対応の pum#map#confirm()マッピング

僕のマッピングは次の通り。これをベースに自分にあったマッピングにするといいと思う。  
ただし、`lexima#expand('<CR>')` では意図するものにはならないことに注意である。`lexima#string#to_mappable('<CR>')`を通す必要がある。

```vim
execute printf("inoremap <expr><silent> <CR> pum#visible() ? pum#map#confirm() : lexima#expand(%s, 'i')",
              \ string(lexima#string#to_mappable('<CR>'))
              \ )
```

## 注意点

前提として lexima.vim は読み込まれた時にデフォルトのルールを設定する。この時に\<CR\>のマッピングが生成されるので上記のマッピングは必ず lexima.vim が読み込まれた後に設定する必要がある。  
(もしくは`let g:lexima_no_default_rules = v:false`や`call lexima#clear_rules()`を用いて lexima.vim のルール設定の制御を行った上で、設定する必要がある。)

dein.vim + toml を利用している場合マッピングを`hook_add`に書くことが多いかもしれないが、今回の場合は`hook_source`の最後に書く必要があるということである。
