---
title: "Nix Home Manager をファイル配置ツールとして使用する"
postdate: "2024-12-04T08:53"
update: "2024-12-04T08:53"
tags: ["Nix"]
---

> この記事は [ryota2357 Advent Calendar 2024](https://adventar.org/calendars/10716) の 4 日目の記事です。

今年の 8 月 2 日から nix をパッケージマネージャとして使い始め、10 月 3 日、Home Manager と nix-darwin を使い始めた。

Home Manager の設定をしている人の記事を見ると、`programs.bash` や `programs.tmux` のようなアトリビュートに設定を記述しているものを多く見かける。
しかし僕はこれら `programs.<name>` を使用せず、タイトルの通り、僕は Home Manager を config ファイルを配置するツールとしてのみ使用している。
この運用の理由と方法について書いていく。

## `program.<name> = { ... }` の形式について

この形式は `<name>` で指定したツール・ソフトウェアを Nix で宣言的に書くというもので、例えば：

```nix
programs.git = {
  enable = true;
  userName = "ryota2357";
  extraConfig = {
    ...
  };
  ...
};
```

のような感じで色々設定できる。だが僕はこれがあまり好きではない。

この方式は、ツール間で共通した記法 (Nix 式) で宣言的に記述できるという利点がある。
しかし、Home Manager が Nix 式に基づいて「いい感じ」に各ツールの設定ファイルを生成しているので、実際に各ツールが読み込む設定は (実際に生成されたファイルを見ない限り) 直接確認できないという欠点がある。

各ツールが実際に読み込むファイルを直接確認できず、Home Manager が「いい感じに」生成するために、実際に次のような問題が issue に上がったりしている。

- [bug: tmux with 'sensibleOnTop' option no longer uses the correct shell](https://github.com/nix-community/home-manager/issues/5952)

issue タイトルの通り、Home Manager のバグであるのだが、このように各ツールのバグではなく Home Manager のバグや「いい感じ」が生み出す問題に付き合っていく必要が出てくる。

<small>個人的な意見を加えるならば、僕は「いい感じ」というのを「設定をする」という場面において信用していない。設定の「いい感じ」は人によって大きく異なると思っているからだ。</small>

そこで、僕は Home Mangaer を `xdg.configFile`, `home.packages`, `home.file` のみを使用して、各ツールの設定は各ツールの設定ファイルをちゃんと書くという方針で利用している。

## ファイル配置

先に書いた通り、Home Manager には [`xdg.configFile`](https://nix-community.github.io/home-manager/options.xhtml#opt-xdg.configFile), [`home.file`](https://nix-community.github.io/home-manager/options.xhtml#opt-home.file) というアトリビュートが存在する。
このアトリビュートは `programs.<name>` の内部でも使用されていて、それぞれ単純にユーザールート以下にファイルを配置するだけである。ドキュメントを次に引用する。

```
xdg.configFile
    Attribute set of files to link into the user’s XDG configuration home.
    Type: attribute set of (submodule)
    Default: { }

home.file
    Attribute set of files to link into the user home.
    Type: attribute set of (submodule)
    Default: { }
```

また、[`home.packages`](https://nix-community.github.io/home-manager/options.xhtml#opt-home.file) も `programs.<name>` 内部で使用されていて：

```
home.packages
    The set of packages to appear in the user environment.
    Type: list of package
    Default: [ ]
```

というものである。

なお、各 `programs.<name>` がどのような実装になっているかは、[modules/programs/](https://github.com/nix-community/home-manager/blob/bf23fe41082aa0289c209169302afd3397092f22/modules/programs/) ディレクトリで確認できる。

この 3 つのアトリビュートを使用して、僕は次のような感じで設定を書いている。例としてシェル周りの設定を次のように書いている。

```nix
# nix/home/modules/shell.nix
{ pkgs, ... }:
let
  s = name: { source = ../../../shell + "/${name}"; };
in
{
  home.packages = with pkgs; [
    bash
    # zsh   # システムのを使う
    fish
  ];
  home.file = {
    ".zshenv" = s "zsh/zshenv";
    ".zshrc" = s "zsh/zshrc";
  };
  xdg.configFile = builtins.foldl' (acc: name: acc // { ${name} = s name; }) { } [
    "zsh/alias.zsh"
    "zsh/completion.zsh"
    "zsh/option.zsh"
    "zsh/prompt.zsh"

    "fish/config.fish"
    "fish/conf.d"
    "fish/completions"
    "fish/functions"
    "fish/prompt.fish"
    "fish/shortcut.fish"
  ];
}
```

そして、これを次のように `home-mamager.lib.homeManagerConfiguration.modules` に与えている。

```nix
# nix/home/default.nix
home-manager.lib.homeManagerConfiguration {
  modules = [
    ./modules/shell.nix
    ...
  ];
  ...
}
```

`home-mamager.lib.homeManagerConfiguration.modules` を使うことで、簡単にアトリビュートセットを deep marge できる。

## 終わりに

このように `programs.<name>` を使わない Home Manager の使い方もある。
そのほか僕の dotfiles の Nix の設定の全体像については、[ryota2357/dotfiles](https://github.com/ryota2357/dotfiles/tree/b7c5d4b602cb396118a712220694cacd8de33761) を確認してもらいたい。
