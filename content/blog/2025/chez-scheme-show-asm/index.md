---
title: "Chez Scheme のコンパイル結果 (アセンブリ) を見る方法 (scheme-show-asm)"
postdate: "2025-08-11T11:41"
update: "2025-08-11T11:41"
tags: ["Scheme", "Bash"]
---

Chez Scheme は、高度な最適化を行い、高速なネイティブコードを生成する Scheme 処理系である。
しかし、`scheme` コマンドはスクリプトを直接実行するため、コンパイラがどのような最適化を施し、いかなるアセンブリコードを生成したのかを直接確認する簡単な手段が提供されていない。

ここでは、Chez Scheme が生成するアセンブリコードを閲覧する方法を紹介する。
対象とする Chez Scheme のバージョンは、現在（2025 年 8 月 11 日）の最新版である 10.2.0 を想定している。

## compile-with-asm

Chez Scheme のコンパイラはセルフホストされており、そのソースコードは [cisco/ChezScheme](https://github.com/cisco/ChezScheme) リポジトリの s/ ディレクトリに格納されている。
この中の s/debug.ss ファイル内で定義されている `compile-with-asm` という関数がアセンブリコードを出力するためのユーティリティ関数である。

注意点として、`(load "s/debug.ss")` などのように直接 s/debug.ss を load することはでず、これはエラーになる。
これはおそらくコンパイラの開発環境など、特定のセットアップがなされた状態で利用されることを想定しているためだろう。

しかし、`compile-with-asm` 関数自体は自己完結しており、他のファイルに依存していない。
そのため、関数の定義をソースコードから抽出し、独立したファイルとして利用できる。

```scheme
(define compile-with-asm
  (lambda (ss so mach)
    (let ([file (format "~a.asm" (path-root so))])
      (parameterize ([#%$assembly-output (open-output-file file '(buffered replace))])
        (compile-file ss so mach)
        (close-output-port (#%$assembly-output))))))
```

このコードを compile-with-asm.ss のような名前で保存し、REPL から使用することで、任意の Scheme ファイルのアセンブリコードを生成できる。

```console
$ scheme
> (load "compile-with-asm.ss")
> (compile-with-asm "test.ss" "test.so" (machine-type))
compiling test.ss with output to test.so
>
```

これにより、コンパイル済みのオブジェクトファイル test.so と共に、目的のアセンブリコードが記述された test.asm が生成される。

## scheme-show-asm コマンドの作成

アセンブリを閲覧するたびに REPL を起動し、load と関数の呼び出しを手動で行うのは煩雑であるし、この方法では不要なオブジェクトファイル (.so) も残ってしまう。

そこで、これらの手間を解消し、指定した Scheme ファイルのアセンブリを直接標準出力へ書き出すコマンドラインツール `scheme-show-asm` をシェルスクリプト(bash)で作成した。

```bash
#!/usr/bin/env bash

set -eu

if [ $# -ne 1 ]; then
  echo "Usage: scheme-show-asm <scheme-file>" >&2
  exit 1
fi

SCHEME_FILE="$1"
if [ ! -f "$SCHEME_FILE" ]; then
  echo "File not found: $SCHEME_FILE" >&2
  exit 1
fi

if [[ "$SCHEME_FILE" =~ \.scm$ ]]; then
  BASENAME=$(basename "$SCHEME_FILE" .scm)
elif [[ "$SCHEME_FILE" =~ \.ss$ ]]; then
  BASENAME=$(basename "$SCHEME_FILE" .ss)
else
  echo "Unsupported file type: $SCHEME_FILE" >&2
  exit 1
fi

TEMPDIR=$(mktemp -d)
trap 'rm -rf "$TEMPDIR"' EXIT

COMPILE_SCRIPT="$TMPDIR/compile.ss"
cat > "$COMPILE_SCRIPT" << 'EOF'
(define compile-with-asm
  (lambda (ss so mach)
    (let ([file (format "~a.asm" (path-root so))])
      (parameterize ([#%$assembly-output (open-output-file file '(buffered replace))])
        (compile-file ss so mach)
        (close-output-port (#%$assembly-output))))))

(compile-with-asm (car (command-line-arguments))
                  (cadr (command-line-arguments))
                  (machine-type))
EOF

SO_FILE="$TEMPDIR/$BASENAME.so"
COMPILE_LOG="$TEMPDIR/compile-log.txt"
if ! scheme --script "$COMPILE_SCRIPT" "$SCHEME_FILE" "$SO_FILE" >& "$COMPILE_LOG"; then
  cat "$COMPILE_LOG" >&2
  exit 1
fi
cat "$COMPILE_LOG" >&2

ASM_FILE="$TEMPDIR/$BASENAME.asm"
if [ ! -f "$ASM_FILE" ]; then
  echo "Assembly file not found: $ASM_FILE" >&2
  exit 1
fi

cat "$ASM_FILE"

rm -rf "$TEMPDIR"
```

これを scheme-show-asm というファイルに保存し、実行権限を与えパスを通せば以下のように使用できる。

```console
$ cat test.ss
(display "Hello Scheme!")

$ scheme-show-asm test.ss > test.asm
compiling test.ss with output to /var/folders/9q/dvfvj1610rn4hj0tdf98pccr0000gn/T/tmp.zq0xftk4Pc/test.so

$ cat test.asm | tail -5
st.so
96:      mrv pt:        (0 1 continue)
mrvl.5:
104:     subi           %sfp, %sfp, 8, #f
108:     b              ej.0(-104)
112:     <end>
```

### Chez Scheme のアセンブリについて

ここで注意すべき点として、Chez Scheme は独自仕様のアセンブリ言語、アセンブラ、リンカを採用している点が挙げられる。
そのため、生成されるアセンブリは、一般的な x86-64 や AArch64 のそれとは異なる構文を持つ。
とはいっても、特殊な構文ではないので、RISC や MIPS などを含めた他のアセンブリを読んだ経験があれば、容易に読めると思う。

補足として、ChezScheme のリポジトリ内の [IMPLEMENTATION.md](https://github.com/cisco/ChezScheme/blob/6f80b4f2f8a6308ead9deeb5f6d0b514d40888e6/IMPLEMENTATION.md) にスタックフレームやレジスタの規約が書いてある。
これを読み、必要であれば s/x86_64.ss や s/arm64.ss、s/cmacros.ss など IMPLEMENTATION.md に示されていたソースコードを読めば十分だと思われる。

<small>
余談だが、今の時代生成AIがあるので、そこに IMPLEMENTATION.md などと一緒に asm ファイルを投げて「解説して」とお願いすれば、割としっかり解説してくれたので、多少アセンブリが読めなくても大丈夫だと思う...
</small>

### Nix で package にする

実行権限を与えたりパスを通したりするのは面倒なので、Nix (nixpkgs) の `writeShellApplication` を使えば簡単に bash スクリプトをパッケージにでき、devShell 等で導入できるコマンドとなる。

以下の Nix 式は、scheme-show-asm をパッケージとして定義するものである。

```nix
# scheme-show-asm.nix
{
  writeShellApplication,
  chez,
}:

writeShellApplication {
  name = "scheme-show-asm";
  runtimeInputs = [ chez ];
  text = ''
    # 上記のBashスクリプトの内容をここに記述
  '';
}
```

このファイルを flake.nix などで callPackage を用いて評価すれば、devShell などで簡単に利用可能なコマンドとして提供できる。

```nix
let
  scheme-show-asm = pkgs.callPackage ./scheme-show-asm.nix { }
in
...
```
