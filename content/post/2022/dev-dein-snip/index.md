---
title: "dein.vimのluaラッパー -αなプラグイン作った(dein-snip)"
postdate: "2022-08-07T16:12"
update: "2022-08-14T18:21"
tags: ["Neovim"]
---

タイトルの通り、「+α」ではなく「-α」。  
dein の一般的な設定をまとめて lua でシンプルに記述できるようにした。そのため、そのままの dein.vim ほどの自由さはない。なので「-α」。

まあ、けど「α」程度なので、ほとんどの人が問題ないんじゃないかな？

**https://github.com/ryota2357/dein-snip.lua**

## Example

こんな感じで lua で設定できる。  
dein.vim のダウンロードとかも内部で勝手にやるのでこれだけ。

```lua
require('dein-snip').setup {
    load = {
        vim = {
            '~/dotfiles/vim/rc/option.rc.vim',
            '~/dotfiles/vim/rc/maping.rc.vim'
        },
        toml = {
            { '~/dotfiles/vim/rc/dein.toml' },
            { '~/dotfiles/vim/rc/dein-lazy.toml', { lazy = true } }
        },
        raw = {
            { 'vim-jp/vimdoc-ja', { hook_add = 'set helplang=ja,en' } }
        },
        check_install = true
    },
    notification = {
        enable = true,
        time = 3000
    },
    auto_recache = true
}
```

[help](https://github.com/ryota2357/dein-snip.lua/blob/main/doc/dein-snip.txt) にも書いてある通り、dein.vim のインストール場所変更やプラグインを入れる場所もちゃんと変えられる。

デフォルトでは dein.vim は`~/.cache/dein/repos/github.com/Shougo/dein.vim`に、プラグインたちは`~/.cache/dein`をルートに入る。ここに入れてる人が一番多いのではないかと思う。

## 内部でやってること

[/lua/dein-snip/init.lua](https://github.com/ryota2357/dein-snip.lua/blob/main/lua/dein-snip/init.lua) に setup 関数を定義してある。それの説明。

### dein のセットアップ

コード引用

```lua
-- プラグインをインストールする場所を作っとく。
if not vim.fn.isdirectory(config.path.plugins) then
    vim.fn.mkdir(config.path.plugins, 'p')
end

-- deinがrtpに入れる
-- deinがダウンロードされてなかったらgit cloneしてくる。
if not string.match(vim.o.runtimepath, '/dein.vim') then
    if vim.fn.isdirectory(config.path.dein) == 0 then
        os.execute('git clone https://github.com/Shougo/dein.vim ' .. config.path.dein)
    end
    vim.opt.runtimepath:prepend(config.path.dein)
end
```

### dein の変数設定

`g:dein#ほげほげ`も lua で設定できる。lua で書いた設定から`let g:dein#ほげほげ`して dein に反映していく。  
対応表は [README の Correspondence Table](https://github.com/ryota2357/dein-snip.lua#correspondence-table) に書いておいた。ほぼ全ての変数を lua で設定できるようにした。

実装は、こんな感じの関数`g`を作って

```lua
local g = function(variable, value)
    if value ~= nil then
        vim.g[variable] = value
    end
end
```

こんな感じでひたすら呼び出す。

```lua
g('dein#auto_recache', config.auto_recache)
```

### プラグインのロード

いろいろ省略した実装コードにコメントで説明すると、

```lua
-- if dein#load_state()
if dein.load_state(config.path.plugins) == 1 then

    -- load.vim に設定した vimrc ファイルを g:dein#inline_vimrcs に入れる
    g('dein#inline_vimrcs', inline_vim)

    -- call dein#begin()
    dein.begin(config.path.plugins, vimrcs)

    -- load.raw に設定したプラグインたちを call dein#add() する
    dein.add(value[1], value[2])

    -- load.toml に設定したtomlファイルを call dein#load_toml() する
    dein.load_toml(value[1], value[2])

    -- load.directory に設定したルールを call dein#loacl() して反映する
    dein.local0(config.load.directory.path, config.load.directory.options, config.load.directory.names)

    -- load.check_install に true が設定されてば、プラグインがインストールされてるかのチェックを行う
    if dein.check_install() == 1 then
        dein.install()
    end

    -- call dein#end()
    dein.end0()

    -- call dein#save_state()
    dein.save_state()
end
```

まあ、vim スクリプトで書いてることをそのまま実装した感じ。

## 最後に

作る必要あったか？って言われると微妙なところあるけど、dein-snip 使えば init.lua の行数は短くなるし他の lua プラグインっぽく設定できるから、コードの見た目は良くなったよね、って感じかな。

あと、toml パーサー lua で実装し直したら速くできるんじゃないか？とか思ってるので今後作るかもしれないです。面倒なのでやらない可能性高いけど。

何はともあれ、初の lua プラグイン作成、楽しかった。
