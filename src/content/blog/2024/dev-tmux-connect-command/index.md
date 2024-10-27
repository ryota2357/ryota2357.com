---
title: "tmuxへのattachをいい感じにするコマンドを作った (tmux-connect)"
postdate: "2024-10-27T15:58"
update: "2024-10-27T15:58"
tags: ["tmux", "Bash"]
---

tmux に既存のセッションが存在しない場合は `tmux new-session` で tmux を起動し、存在する場合はセッションを選択して起動する Bash スクリプト (`tmux-connect` コマンド)を書いた。

```console
# 既存のセッションがある場合
$ tmux-connect
Select a session:
1) denops
2) uec
3) lean
4) lico
5) Create New Session
Enter a number:
```

macOS 標準の bash (bash-3.2) でも動くようにしている。

## 説明

`tmux-connect` は先に書いた通り、

- 既存のセッションが存在しない場合: `tmux new-session` を実行
- 既存のセッションが存在する場合:
  1. セッションの選択プロンプトを表示
  2. ユーザが選択 (数字)
  3. 指定したセッションに `tmux attach-session` または、"Create New Session" を選んだ場合は `tmux new-session` する

オプションは 2 つある。

```console
$ tmux-connect -h
Usage: tmux-connect [options]

Options:
  -p, --paths      Comma-separated list of paths to the tmux command
  -h, --help       Display this help message
```

`-p` オプションは `$PATH` に `tmux` がない時に役に立つ。具体的にはターミナルエミュレータで起動時コマンドを指定する時に便利である。

私の Alacrity の起動時コマンド設定は次の通りである。

```toml
[terminal.shell]
program = "/bin/bash"
args = [
    "-c",
    '''
    tmux_connect="$HOME/.local/bin/tmux-connect"
    tmux_paths="$HOME/.nix-profile/bin/tmux"
    if [[ -x "$tmux_connect" ]]; then
      "$tmux_connect" --paths "$tmux_paths"
    else
      echo "Command not found: $tmux_connect"
      /bin/zsh
    fi
    '''
]
```

起動を 1ms でも速くするため、`/bin/bash` を `-c` のみで起動する。
この場合 `$PATH` にはデフォルトの値になっているので、自分でインストールした `tmux` にはパスが通ってない。(もちろん、`tmux-connect` にもパスは通ってない)
`--paths "$tmux_paths"` により、パスを通すことなく tmux を起動できる。

## 実装

コメントをそこそこ丁寧に書いたつもりなので、それを読んでほしい。

1 つ補足すると、`tmux new-session` などのコマンドは `exec` をつけて実行していることである。
これにより `tmux-connect` コマンドのプロセスが tmux のプロセスに置き換わり、プロセスツリーからは `tmux new-session` を直接実行したように見えるようにしている。

```bash
#!/usr/bin/env bash

set -eu

CMD_NAME=$(basename "$0")
readonly CMD_NAME

display_help() {
  echo "Usage: $CMD_NAME [options]"
  echo ""
  echo "Options:"
  echo "  -p, --paths      Comma-separated list of paths to the tmux command"
  echo "  -h, --help       Display this help message"
}

find_tmux_cmd() {
  local tmux_paths=("$@")

  if [[ ${#tmux_paths[@]} -gt 0 ]]; then
    for path in "${tmux_paths[@]}"; do
      if [[ -x "$path" ]]; then
        echo "$path"
        return
      fi
    done
  fi

  if type tmux >/dev/null; then
    echo "tmux"
    return
  else
    echo "Error: 'tmux' command not found." >&2
    echo "Please install tmux or specify the correct path using the -p option." >&2
    exit 1
  fi
}

select_session() {
  local tmux_cmd="$1"
  local session_list="$2"

  # Display a list of sessions to the user (`select` command like)
  echo "Select a session:"
  # Use an array (-a), not a associative array (-A). Because if the user choiced "01", it will be treated as octal number.
  # Note: The index of the array is no need to be continuous. (i.e. we can starts from 1)
  declare -a session_map
  local i=1 line session_name
  while IFS= read -r line; do
    session_name=$(echo "$line" | cut -d: -f1)
    echo "$i) $session_name"
    session_map["$i"]=$session_name
    ((i++))
  done <<< "$session_list"
  echo "$i) Create New Session"

  # Prompt the user to select a session, re-prompt if the selection is out of range
  local choice
  while true; do
    read -rp "Enter a number: " choice
    if [[ "$choice" -ge 1 && "$choice" -le "$i" ]]; then
      break
    else
      echo "Invalid selection. Please choose a valid number."
    fi
  done

  # Create a new session or attach to an existing one based on the user's choice
  if [[ "$choice" -eq "$i" ]]; then
    exec "$tmux_cmd" new-session
  else
    exec "$tmux_cmd" attach-session -t "${session_map[$choice]}"
  fi
}

create_or_attach_session() {
  local tmux_cmd="$1"

  # List all sessions name sorted by creation time
  local session_list
  session_list=$(                                                     \
    "$tmux_cmd" list-sessions -F '#{session_created} #{session_name}' \
      | sort                                                          \
      | awk -F ' ' '{ print $2 }'                                     \
  )

  # Create a new session if no sessions exist
  if [[ -z "$session_list" ]]; then
    exec "$tmux_cmd" new-session
  fi

  local session_count
  session_count=$(echo "$session_list" | wc -l)

  # If there is only one session, automatically attach to it
  if [[ "$session_count" -eq 1 ]]; then
    local session_name
    session_name=$(echo "$session_list" | cut -d: -f1)
    exec "$tmux_cmd" attach-session -t "$session_name"
  fi

  # If multiple sessions exist, prompt the user to select one
  select_session "$tmux_cmd" "$session_list"
}

main() {
  local tmux_paths=()
  while [[ $# -gt 0 ]]; do
    case $1 in
      -p|--paths)
        IFS=',' read -ra tmux_paths <<< "$2"
        shift 2
        ;;
      -h|--help)
        display_help
        exit 0
        ;;
      *)
        echo "Unknown option: $1" >&2
        display_help
        exit 1
        ;;
    esac
  done

  local tmux_cmd
  if [[ ${#tmux_paths[@]} -gt 0 ]]; then
    tmux_cmd=$(find_tmux_cmd "${tmux_paths[@]}")
  else
    tmux_cmd=$(find_tmux_cmd)
  fi

  create_or_attach_session "$tmux_cmd"
}

main "$@"
```
