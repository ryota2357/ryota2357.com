---
title: "Git Hooks は nix devShell の shellHook を使うと手軽だった"
postdate: "2025-11-05T16:50"
update: "2025-11-05T16:50"
tags: ["Nix", "Git"]
---

Git Hooks は `.git/hooks/` 以下に適切な名前の実行可能ファイル (hook script) を配置することで使用できますが、この手法では、配置した hook script が Git で管理できないという問題があります。

他の Git Hooks の導入手法として、Node.js プロジェクトなら [husky](https://github.com/typicode/husky) や、Nix なら [git-hooks.nix](https://github.com/cachix/git-hooks.nix) などのフレームワーク・ライブラリを使用する方法もある。

この記事では、devShell の shellHook を使った Git Hooks の導入方法と、その際の hook script のテンプレートを紹介する。

## shellHook

`.git/hooks/` が Git 管理対象外 (正確には `.git/` がデフォルトで Git 管理対象外) なので、hook script を `.githooks/` へ置くことにする。

Git の local config を書き換えれば、hook script の位置を `.git/hooks/` から `.githooks/` に変更可能である。
ただし、local config は `.git/config` なので Git 管理外のため、毎回初回セットアップで `git config --local` をする必要が生じて面倒である。

これは shellHook を使えば、自動化できる。

```nix
{
  devShells.default = pkgs.mkShellNoCC {
    packages = with pkgs; [
      # ...
    ];
    shellHook = ''
      currentHooksPath=$(git config --local --get core.hooksPath)
      if [ "$currentHooksPath" != ".githooks" ]; then
        echo "Setting Git hooksPath to .githooks..."
        git config --local core.hooksPath .githooks
      fi
    '';
  };
}
```

これでいつも通り、`nix develop` または direnv を使っているなら `direnv allow` だけで済むようになった。

## hook script

hooksPath を shellHook で設定できたなら、あとは `.githooks/pre-commit` などを用意すれば基本的には問題ないのだが、私が遭遇した問題と、その解決方法を紹介する。

私のワークフローとして、lazygit を使ってコミットやプッシュを行う。その際、その lazygit は tmux から floating window で以下のように立ち上げることがある。

```tmux
bind-key g popup -d "#{pane_current_path}" -w 95% -h 97% -y P -b rounded -E "lazygit"
```

この floating window で立ち上がった lazygit は devShell を経由しない。
そのため、例えば devShell で入れていた `pnpm` が使えず、hook script 内での `pnpm run check` が command not found: pnpm になる。

このように、hook script が devShell を経由せず実行されると、devShell で入れていたツール群を使えなくなる問題があった。

これを私は次のように解決した。

```bash
#!/usr/bin/env bash

# Ensure we are in the nix develop shell or direnv environment
if [[ -z "${IN_NIX_SHELL:-}" ]] && [[ -z "${DIRENV_DIR:-}" ]]; then
  SCRIPT_REENTRY_GUARD="__SCRIPT_$(basename "$0" | tr '-' '_')_ENTERED"
  if [[ -n "${!SCRIPT_REENTRY_GUARD:-}" ]]; then
    echo "Error: IN_NIX_SHELL and DIRENV_DIR are not set even after entering nix develop." >&2
    echo "Please check your flake.nix devShell configuration or use direnv." >&2
    exit 1
  fi
  export "$SCRIPT_REENTRY_GUARD"=1
  exec nix develop --command "$0" "$@"
fi

# 以降は devShell で入れたツールが使える
# 例: pnpm run check など
```

簡単に説明すると、devShell または direnv 環境内でなければ、`nix develop` をした上で hook script 自身を再度実行するようにしている。

ここでは、devShell 内判定のため `$IN_NIX_SHELL` を、direnv 内判定のため `$DIRENV_DIR` を使用した。(より適切な変数があるなら、それらを使う方が良い。)

<!-- textlint-disable ja-technical-writing/sentence-length -->

また、何らかの理由で devShell / direnv 環境に入っても `$IN_NIX_SHELL` や `$DIRENV_DIR` が設定されない場合に、スクリプトが無限に再実行 (`nix develop`) されるのを防ぐため、`"$SCRIPT_REENTRY_GUARD"` を使用したガードを設けている。

<!-- textlint-enable ja-technical-writing/sentence-length -->
