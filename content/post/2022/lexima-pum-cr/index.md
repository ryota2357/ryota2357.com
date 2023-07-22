---
title: "lexima.vimとpum.vimと<CR>"
postdate: "2022-07-09T20:31"
update: "2022-07-14T08:25"
tags: ["Vim", "Neovim"]
---

lexima.vim と pum.vim での\<CR\>の挙動制御について

lexima.vim は内部でマッピング(`inoremap`)を生成する。そのため pum.vim で補完の確定を\<CR\>で行っている場合、このマッピングが衝突してしまい意図しない挙動が起きてしまう。

このことについて先日、lexima.vim でオプションを設定することで解決できるようにする PR を作成した。

https://github.com/cohama/lexima.vim/pull/134

作者の cohama さんからの返信は「他のプラグインに依存する機能をつけたくない」とのことで、マージはされなかった。各自\<CR\>を lexima.vim にも対応するようにマッピングしてくださいとのこと。

## lexima.vim 対応の pum#map#confirm()マッピング

僕のマッピングは次の通り。これをベースに自分にあったマッピングにするといいと思う。  
ただし、`lexima#expand('<CR>')` では意図するものにはならないことに注意である。`lexima#string#to_mappable('<CR>')` を通す必要がある。

```vim
execute printf("inoremap <expr><silent> <CR> pum#visible() ? pum#map#confirm() : lexima#expand(%s, 'i')",
              \ string(lexima#string#to_mappable('<CR>'))
              \ )
```

## 注意点

前提として lexima.vim は読み込まれた時にデフォルトのルールを設定する。この時に\<CR\>のマッピングが生成されるので上記のマッピングは必ず lexima.vim が読み込まれた後に設定する必要がある。

lexima.vim には `g:lexima_no_default_rules` や `lexima#clear_rules()`、`lexima#set_default_rules()` と言ったルール定義を制御できる機能がついている。  
これらを利用して上に示した\<CR\>マッピングが一番最後になるようにすれば良い。
