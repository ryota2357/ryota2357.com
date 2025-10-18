---
title: "zsh/fishで入力中のコマンドをvimで編集する方法とmacOSでの対応"
postdate: "2025-07-21T21:35"
update: "2025-07-21T21:48"
tags: ["Zsh", "fish", "Vim", "Neovim"]
---

[zshで入力中のコマンドをすぐにNeovimで編集する方法](https://dev.classmethod.jp/articles/eetann-zle-edit-command-line/) という記事があった。
zsh についてはこの記事に書いてある通りであるが、fish でも同じことができたのと、折り返し設定について macOS ではもう少しいい感じにする必要があったため、本記事ではその設定を紹介する。

## zsh での設定

`edit-command-line` を使用する。
このコマンドにより起動するエディタは環境変数 1. `VISUAL` 2. `EDITOR` の優先順位で参照する。

> ```zsh
>   local -a editor
>   zstyle -a :zle:$WIDGET editor editor
>   if (( ! $#editor )); then
>     editor=( "${(@Q)${(z)${VISUAL:-${EDITOR:-vi}}}}" )
>   fi
> ```
>
> From: [zsh-users/zsh/Functions/Zle/edit-command-line#L55](https://github.com/zsh-users/zsh/blob/33aafecc7e9e3224e0283fe8be098ede39f48f61/Functions/Zle/edit-command-line#L55)

以下のように書くと <key>Ctrl-x</key> + <key>Ctrl-e</key> で vim が開くようになる。

```zsh
export EDITOR='vim'
export VISUAL='vim'

autoload -Uz edit-command-line
zle -N edit-command-line
bindkey '^x^e' edit-command-line
```

## fish での設定

`edit_command_buffer` を使用する。
このコマンドにより起動するエディタは zsh と同じく、環境変数 1. `VISUAL` 2. `EDITOR` の優先順位で参照する。

> ```fish
>     set -l editor (__fish_anyeditor)
>     or return 1
> ```
>
> From: [fish-shell/fish-shell/share/functions/edit_command_buffer.fish#L18](https://github.com/fish-shell/fish-shell/blob/db0f9c1d53e64721251663fc513ccfb16fed4f13/share/functions/edit_command_buffer.fish#L18)
>
> ```fish
>    if set -q VISUAL
>        echo $VISUAL | read -at editor
>    else if set -q EDITOR
>        echo $EDITOR | read -at editor
>    else
> ```
>
> From: [fish-shell/fish-shell/share/functions/\_\_fish_anyeditor.fish](https://github.com/fish-shell/fish-shell/blob/db0f9c1d53e64721251663fc513ccfb16fed4f13/share/functions/__fish_anyeditor.fish)

以下のように書くと <key>Ctrl-x</key> + <key>Ctrl-e</key> で vim が開くようになる。

```fish
bind ctrl-x,ctrl-e 'edit_command_buffer'
```

## Vim の設定 (wrap設定)

普段、`nowrap` でコーディングしている。しかし、コマンド編集の時は `wrap` の方が (ワンライナーなどを編集する時とかで) 都合がいい。
つまり、`edit-command-line`, `edit_command_buffer` で開いた場合は `wrap` にしたいので、以下のようにする。

```vim
augroup vimrc_cmd_line_edit
  autocmd!
  " macOS では /var や /tmp は /private/var, /private/tmp への symlink
  execute 'autocmd BufRead ' .. (has("mac") ? '/private' : '') .. $TMPDIR .. '*' .. ' set wrap'
  execute 'autocmd BufRead ' .. (has("mac") ? '/private' : '') .. '/tmp/zsh*'    .. ' set wrap'
augroup END
```

コメントにも書いてあるが、macOS では / のいくつかのファイルは /private へのシンボリックリンクになっているので、その対応が必要である。

```console
$ ls -l /
...
lrwxr-xr-x  1 root wheel   11  5  4 14:39 etc -> private/etc/
drwxr-xr-x  6 root wheel  192  7 16 08:35 private/
lrwxr-xr-x  1 root wheel   15  7 16 08:35 run -> private/var/run/
lrwxr-xr-x  1 root wheel   11  5  4 14:39 tmp -> private/tmp/
lrwxr-xr-x  1 root wheel   11  5  4 14:39 var -> private/var/
```

また、`BufRead` のパターンの理由はソースコードを読むとわかる。

入力中のコマンドの内容が書かれたファイルは：

- zsh (`edit-command-line`) ではプロセス置換を使用してバッファの内容を渡しているので `/tmp/zsh*` のファイルに
- fish (`edit_command_buffer`) では `mktemp` を使用しているので、`$TMPDIR` 以下のファイルに

生成される。

> ```zsh
> } =(<<<"$prebuffer$buffer")
> ```
>
> From: [zsh-users/zsh/Functions/Zle/edit-command-line#L98](https://github.com/zsh-users/zsh/blob/33aafecc7e9e3224e0283fe8be098ede39f48f61/Functions/Zle/edit-command-line#L98)

> ```fish
> function edit_command_buffer --description 'Edit the command buffer in an external editor'
>     set -l f (mktemp)
>     or return 1
> ```
>
> From: [fish-shell/fish-shell/share/functions/edit_command_buffer.fish#L2](https://github.com/fish-shell/fish-shell/blob/db0f9c1d53e64721251663fc513ccfb16fed4f13/share/functions/edit_command_buffer.fish#L2)

なお、この Vim script は、Neovim でも動作するはずである (未検証)。
