---
title: "treefmt-nix を flake.nix から使ってみる"
postdate: "2024-12-17T00:18"
update: "2025-01-07T00:24"
tags: ["Nix"]
---

> この記事は [ryota2357 Advent Calendar 2024](https://adventar.org/calendars/10716) の 17 日目の記事です。

いつからか `nix fmt` で nix ファイルをフォーマットしていたら、warning が出るようになった。

```console
$ nix fmt
Passing directories or non-Nix files (such as ".") is deprecated and will be unsupported soon, please use https://treefmt.com/ instead, e.g. via https://github.com/numtide/treefmt-nix
```

僕は flake.nix は次のようにして、`nixfmt-rfc-style` を直接指定していた。こうではなく、treefmt 等を使えとのことである。

```nix
{
  ..
  output = {
    ..
    formatter = nixpkgs.legacyPackages.${system}.nixfmt-rfc-style;
  };
}
```

せっかくなので、[treefmt-nix](https://github.com/numtide/treefmt-nix) を導入 + それ以外のフォーマッタも `nix fmt` でまとめてフォーマットしてみることにした。

導入にあたっては Flake-parts を使用しない方法をとった。
また、treefmt-nix の [README.md](https://github.com/numtide/treefmt-nix/blob/main/README.md) には treefmt.nix という別ファイルを作って設定する方法が書かれているが、そうではなく、flake.nix の 1 ファイルで設定した。

## inputs に treefmt-nix を追加

README.md では url を指定しているだけであったが、`inputs.nixpkgs.follows = "nixpkgs"` も指定した方が良い。

```nix
{
  inputs = {
    ..
    treefmt-nix = {
      url = "github:numtide/treefmt-nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };
}
```

この `inputs.nixpkgs.follows` の有無による変化は flake.lock を見るとわかりやすい。
`inputs.nixpkgs.follows = "nixpkgs"` を入れることによって、nixpkgs の依存がまとめられていることが確認できるはずである。

## outputs の書き方

続いて、`outputs.formatter.<system>` に treefmt-nix の設定を記述していく。
前提として、この `<system>` の部分を省略し、かつ複数 system 対応した記述をしたい。
僕個人は対象プロジェクトに応じて次の 2 つを使い分けているので紹介する。

1 つ目は [flake-utils](https://github.com/numtide/flake-utils) を使う。依存が増える代わりに `outputs.formatter` 以外も設定できるので便利である。

```nix
{
  inputs = { ..省略 };
  outputs = { treefmt-nix, .. }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        formatter = treefmt-nix.lib.mkWrapper pkgs {
          ..ここに設定を書く
        };
      };
    );
}
```

2 つ目は依存を増やしたくない場合である。この場合は `nixpkgs.lib.genAttrs` を使えば良い。

```nix
{
  inputs = { ..省略 };
  outputs = { treefmt-nix, .. }:
  let
    systems = ["aarch64-linux" "aarch64-darwin" "x86_64-darwin" "x86_64-linux"];
    eachSystem = f: nixpkgs.lib.genAttrs systems (system: f nixpkgs.legacyPackages.${system});
  in
  {
    formatter = eachSystem (pkgs: treefmt-nix.lib.mkWrapper pkgs {
      ..ここに設定を書く
    });
  };
}
```

続いて、上記 2 つの Nix 式で省略した `..ここに設定を書く` について書いていく。

## 設定記述

基本は [README.md](https://github.com/numtide/treefmt-nix/blob/main/README.md) に書いてある通りで、以下のような感じである。

```nix
{
  projectRootFile = "flake.nix";
  programs = {
    nixfmt.enable = true;
    taplo.enable = true;
    terraform.enable = true;
    ..
  };
  settings.formatter.terraform.excludes = [ "hello.tf" ];
}
```

この例の通り、フォーマットの対象外にしたいものは `settings.formatter.<name>.excludes` を使えばいい。

また、全てのフォーマッタに対して `excludes` したい、つまり global な excludes の設定の記述は次のようにしてできる。

```nix
{
  settings.global.excludes = [
    "dir/*"
    "some_file"
  ];
}
```

これは [treefmt-nix#171](https://github.com/numtide/treefmt-nix/issues/171) に書かれていた。(README にも書いておいてほしい...)

`excludes` 以外のオプションに関しては [treefmt-nix/programs/](https://github.com/numtide/treefmt-nix/tree/0ce9d149d99bc383d1f2d85f31f6ebd146e46085/programs) 以下に各フォーマッタのデフォルト構成・オプションが記述されているのでそれを見ながら設定すれば良さそうである。

例えば、`prettier` を markdown フォーマット専用として使いたい場合は次のようにする。
ここで注意なのは `programs.prettier.includes` に `[ "*.md" ]` を設定するという点である。
オプションを `settings.formatter.<name>` に設定するのか、`programs.<name>` に設定するのかは各フォーマッタの構成を見る必要がありそうだ。

```nix
{
  programs = {
    prettier = {
      enable = true;
      includes = [ "*.md" ];
    };
  };
}
```
