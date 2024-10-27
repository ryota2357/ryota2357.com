---
title: "exec 先プログラムで osascript すると「osascriptにはキー操作の送信は許可されません」になる"
postdate: "2024-10-27T14:59"
update: "2024-10-27T14:59"
tags: ["macOS", "Bash"]
---

`exec` を利用していたことが原因で「osascript にはキー操作の送信は許可されません」になっていたので、その記録。

## 状況

macOS 15 > Alacritty > Tmux > Neovim で次のような `osascript` を実行する autocmd を書いていた。

```lua
vim.api.nvim_create_autocmd({ "CmdlineLeave" }, {
    desc = "検索コマンドからの離脱時にIMEをoffにする",
    pattern = { "/", "?" },
    callback = function()
        if vim.fn.has("nvim") then
            local res = vim.system({
                "osascript",
                "-e",
                'tell application "System Events" to key code 102', -- 102: EISU
            }):wait()
            if res.code ~= 0 or res.signal ~= 0 then
                error(vim.inspect(res))
            end
        end
    end,
})
```

この autocmd が実行されると、「osascript にはキー操作の送信は許可されません」のエラーが出た。
もちろん「プライバシーとセキュリティ > アクセシビリティ」で Alacritty は許可している。

![Alacritty の許可](./allow-alacritty.png)

## 原因と解決方法

Alacritty の起動時に実行するプログラムで次の設定していた。(説明のため簡略化している)

```toml
[terminal.shell]
program = "/bin/bash"
args = [
    "-c",
    '''
    if type tmux > /dev/null 2>&1; then
      exec tmux
    else
      echo "Command not found: tmux"
      exec /bin/zsh
    fi
    '''
]
```

<details>
<summary>実際の設定</summary>

`tmux-connect` コマンドは自作のコマンドで[このポスト](../dev-tmux-connect-command)にて解説した。

```toml
[terminal.shell]
program = "/bin/bash"
args = [
    "-c",
    '''
    tmux_connect="$HOME/.local/bin/tmux-connect"
    tmux_paths="$HOME/.nix-profile/bin/tmux"
    if [[ -x "$tmux_connect" ]]; then
      exec "$tmux_connect" --paths "$tmux_paths"
    else
      echo "Command not found: $tmux_connect"
      exec /bin/zsh
    fi
    '''
]
```

</details>

ここで、`exec tmux` のように `exec` を使用しているのが問題であった。次のように `exec` を除去すればエラーは出なくなる。

```diff
    if type tmux > /dev/null 2>&1; then
-     exec tmux
+     tmux
    else
      echo "Command not found: $tmux_connect"
-     exec /bin/zsh
+     /bin/zsh
    fi
```

`exec` コマンドは現在のプロセスを引数に与えられたコマンドへ置き換える。
これは推測だが、`exec` で tmux を起動すると、Alacritty で起動されたプロセスが tmux になってしまい、そのために `osascript` の実行権限がなくなってしまったのだと思われる。
