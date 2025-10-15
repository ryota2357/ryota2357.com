---
title: "シェルの$PATHから特定のパスを取り除く方法"
postdate: "2025-10-16T10:53"
update: "2025-10-16T10:53"
tags: ["Bash", "Zsh"]
---

シェルの$PATH から特定のパスを取り除きたいと思い検索すると、次のような記事が見つかる。

- [\$PATH から特定のパスだけを削除する - Qiita](https://qiita.com/ironsand/items/10e28d7589298090ec23)
- [PATHから特定のパスを抜く - Shohei Yoshida's Diary](https://syohex.hatenablog.com/entry/20150304/1425481941)

が出てくる。

これらの記事を否定するわけではないが、紹介されている手法には、空白文字や特殊文字を含むパスをうまく扱えないといった問題点が存在する。

この記事では bash, zsh で動作する、より良い `path_remove` 関数を紹介し、その実装を解説する。

## path_remove

bash では次のように `path_remove` を実装する。

```bash
path_remove() {
  local path_i result target="$1"
  declare -a path_array results
  IFS=: read -ra path_array <<< "$PATH"
  for path_i in "${path_array[@]}"; do
    if [[ "$path_i" != "$target" ]]; then
      results+=("$path_i")
    fi
  done
  result=$(IFS=:; printf "${results[*]}")
  export PATH="$result"
}
```

これをどこかに定義しておけば、次のようにして使用できる。

```bash
path_remove '/path/you/want/to/remove'
```

zsh でこの関数を使うには、`read` コマンドのオプションを `-ra` から `-rA` に変更する必要がある。

```diff
  declare -a path_array results
- IFS=: read -ra path_array <<< "$PATH"
+ IFS=: read -rA path_array <<< "$PATH"
  for path_i in "${path_array[@]}"; do
```

<details>

<summary>補足: zsh の機能を使用した、より zshらしいコード</summary>

一応、zsh ならもう少しいい感じに書けるので、載せておく。

```zsh
path_remove() {
  local target="$1"
  local -a results
  local path_i
  for path_i in "${(@s/:/)PATH}"; do
    if [[ "$path_i" != "$target" ]]; then
      results+=("$path_i")
    fi
  done
  export PATH="${(j/:/)results}"
}
```

</details>

### 解説

最初の 2 行では、関数内で使用する変数を local 宣言している。
`for` で使う `path_i` のようなループ変数も、関数スコープにするためには `local` で宣言する必要がある点に注意したい。
(ちなみに zsh でも `declare -a` を使用できるのだが、zsh なら `local -a` と書くほうが一般的らしい。)

```bash
  local path_i result target="$1"
  declare -a path_array results
```

続く行では、`$PATH` をデリミタ:で分割し、配列 `path_array` に格納している。
bash の `read -a` は、zsh では `read -A` に相当するため、zsh ではオプションの変更が必要となる。

```bash
  IFS=: read -ra path_array <<< "$PATH"
```

`path_array` をループで処理し、引数で指定されたパスと一致しない要素だけを新しい配列 `results` に追加していく。
配列への要素の追加は `results=("${results[@]}" "$path_i")` とも書けるが、`+=` を使う方がシンプルだ。

```bash
  for path_i in "${path_array[@]}"; do
    if [[ "$path_i" != "$target" ]]; then
      results+=("$path_i")
    fi
  done
```

最後に、配列 `results` の各要素を `:` で連結して `$PATH` に再設定する。

```bash
  result=$(IFS=:; printf "${results[*]}")
  export PATH="$result"
```

細かいことだが、この `path_remove` の実装では、ループ変数に `path` ではなく `path_i` を使っていることに注目してほしい。

```bash
  for path_i in "${path_array[@]}"; do
```

スクリプトを書く際に忘れがちだが、zsh には `path` という特殊な配列変数が存在する。
この変数は `$PATH` と連動しており、配列変数 `path` を変更すると `$PATH` も自動的に更新される。
今回のスクリプトでは、最後に `export PATH` で上書きしているので、結果的に問題にはならない。
しかし、ループの途中で `$PATH` が書き換わるのは意図しない動作なので、これを回避するため `path_i` としている。

もちろん、この `path` の問題は bash では発生しないので、bash なら `path_i` とする必要はない。

## 他記事で提案されていたものの問題点

まず、「[$PATH から特定のパスだけを削除する - Qiita](https://qiita.com/ironsand/items/10e28d7589298090ec23)」のコードは次であった。

```bash
path_remove ()  { export PATH=`echo -n $PATH | awk -v RS=: -v ORS=: '$0 != "'$1'"' | sed 's/:$//'`; }
```

ワンライナーで実装されていて良いのだが、そのために `awk` と `sed` という外部プログラムを使用しているのが気になる。
ちなみに、shellcheck も落ちる。

他にも、この実装は空白やタブを含むパスがあると `awk` でエラーになるという致命的な問題を抱えている。
これは次の bash スクリプトで確かめられる。

```bash
#!/usr/bin/env bash

path_remove ()  { export PATH=`echo -n $PATH | awk -v RS=: -v ORS=: '$0 != "'$1'"' | sed 's/:$//'`; }

export PATH='/usr/bin:/path with spaces:/bin'

echo "$PATH"
path_remove '/path with spaces'
echo "$PATH"
```

これ ./test-path_remove として保存し実行すると、エラーが発生する。

```console
$ ./test-path_remove

/usr/bin:/path with spaces:/bin
awk: non-terminated string /path... at source line 1
 context is
        $0 != >>>  "/path <<<
awk: giving up
 source line number 1
```

さらに、バックスラッシュを含むパスがある場合は、期待通りに削除されない問題もある。

```bash
#!/usr/bin/env bash

path_remove ()  { export PATH=`echo -n $PATH | awk -v RS=: -v ORS=: '$0 != "'$1'"' | sed 's/:$//'`; }

export PATH='/usr/bin:/path\with\backslashes:/bin'

echo "$PATH"
path_remove '/path\with\backslashes'
echo "$PATH"
```

先ほどと同様に ./test-path_remove として保存し実行すると、削除したいパスが削除されていないことがわかる。

```console
$ ./test-path_remove
/usr/bin:/path\with\backslashes:/bin
/usr/bin:/path\with\backslashes:/bin
```

このバックスラッシュの問題はもう 1 つの記事「[PATHから特定のパスを抜く - Shohei Yoshida's Diary](https://syohex.hatenablog.com/entry/20150304/1425481941)」のコードでも発生する。
記事では次のコードが示されていた。

```bash
echo "orig="$PATH
IFS=':' read -a pathes <<< "$PATH"
declare -a tmp_pathes
for path in "${pathes[@]}"
do
  if [ "$path" != "$HOME/.plenv/bin" ]; then
    tmp_pathes=("${tmp_pathes[@]}" "$path")
  fi
done
TMP_PATH=$(printf ":%s" "${tmp_pathes[@]}")
PATH=${TMP_PATH:1:${#TMP_PATH}}

echo "after="$PATH
```

私が本記事で示した `path_remove` の実装に近い処理を行なっている。
注目したいのは、`read` コマンドのオプションが `-a` のみとなっており、 `-r` オプションが指定されていないという点だ。
このため、`$PATH` にバックスラッシュが含まれている際に問題が起きる。
これは次の bash スクリプトで確かめられる。

```bash
#!/usr/bin/env bash

path_remove() {
  local path_i result target="$1"
  declare -a path_array results
  # read -ra とすべきところを -a としている！！
  IFS=: read -a path_array <<< "$PATH"
  for path_i in "${path_array[@]}"; do
    if [[ "$path_i" != "$target" ]]; then
      results+=("$path_i")
    fi
  done
  result=$(IFS=:; printf "${results[*]}")
  export PATH="$result"
}

export PATH='/usr/bin:/path\with\backslashes:/bin'
echo "$PATH"
path_remove '/path\with\backslashes'
echo "$PATH"
```

これを ./test-path_remove として保存しを実行すると、

```console
$ ./test-path_remove
/usr/bin:/path\with\backslashes:/bin
/usr/bin:/pathwithbackslashes:/bin
```

となり、パスが壊れてしまうことが確認できる。

## 付録

`path_remove` の動作テストを行うスクリプトを Claude Sonnet 4.5 に作成してもらったので、折りたたんで乗せておく。
私の実装はこのスクリプトのテストを全てパスするが、他の記事の実装はパスしない。

なお、このスクリプトは zsh でも動作するので、1 行目の shebang を `#!/usr/bin/env zsh` にすれば zsh でのテストができる。

<details>
<summary>テストスクリプト</summary>

```bash
#!/usr/bin/env bash

# set -euo pipefail

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# path_remove 関数（実装例 - 実際の関数に置き換えてください）
path_remove() {
  echo "ERROR: path_remove 関数が未定義です" >&2
  return 1
}

test_case() {
  local test_name="$1"
  local initial_path="$2"
  local remove_target="$3"
  local expected_path="$4"

  echo -e "\n${YELLOW}Test: ${test_name}${NC}"
  echo "Initial PATH: $initial_path"
  echo "Remove target: $remove_target"
  echo "Expected: $expected_path"

  # PATH を一時的に設定
  local original_path="$PATH"
  export PATH="$initial_path"

  # path_remove を実行
  path_remove "$remove_target"

  # 結果を確認
  if [[ "$PATH" == "$expected_path" ]]; then
    echo -e "${GREEN}✓ PASS${NC}"
    echo "Result: $PATH"
  else
    echo -e "${RED}✗ FAIL${NC}"
    echo "Expected: $expected_path"
    echo "Got:      $PATH"
  fi

  # PATH を元に戻す
  export PATH="$original_path"
}

echo '========================================='
echo 'path_remove 関数テストスイート'
echo '========================================='

test_case \
  '基本: 先頭のパスを削除' \
  '/usr/bin:/usr/local/bin:/bin' \
  '/usr/bin' \
  '/usr/local/bin:/bin'

test_case \
  '基本: 中間のパスを削除' \
  '/usr/bin:/usr/local/bin:/bin' \
  '/usr/local/bin' \
  '/usr/bin:/bin'

test_case \
  '基本: 末尾のパスを削除' \
  '/usr/bin:/usr/local/bin:/bin' \
  '/bin' \
  '/usr/bin:/usr/local/bin'

test_case \
  '存在しないパスを削除' \
  '/usr/bin:/usr/local/bin:/bin' \
  '/nonexistent' \
  '/usr/bin:/usr/local/bin:/bin'

test_case \
  '空のPATHから削除' \
  '' \
  '/usr/bin' \
  ''

test_case \
  '単一要素のPATHを削除' \
  '/usr/bin' \
  '/usr/bin' \
  ''

test_case \
  '空白を含むパス（先頭）を削除' \
  '/path with spaces:/usr/bin:/bin' \
  '/path with spaces' \
  '/usr/bin:/bin'

test_case \
  '空白を含むパス（中間）を削除' \
  '/usr/bin:/path with spaces:/bin' \
  '/path with spaces' \
  '/usr/bin:/bin'

test_case \
  '空白を含むパス（末尾）を削除' \
  '/usr/bin:/bin:/path with spaces' \
  '/path with spaces' \
  '/usr/bin:/bin'

test_case \
  '重複パス: 全ての出現を削除' \
  '/usr/bin:/usr/local/bin:/usr/bin:/bin' \
  '/usr/bin' \
  '/usr/local/bin:/bin'

test_case \
  '部分一致は削除されない' \
  '/usr/bin:/usr/local/bin:/bin' \
  '/usr' \
  '/usr/bin:/usr/local/bin:/bin'

test_case \
  '末尾コロンがある場合' \
  '/usr/bin:/usr/local/bin:' \
  '/usr/local/bin' \
  '/usr/bin'

test_case \
  '先頭コロンがある場合' \
  ':/usr/bin:/usr/local/bin' \
  '/usr/bin' \
  ':/usr/local/bin'

test_case \
  '連続するコロン' \
  '/usr/bin::/usr/local/bin' \
  '/usr/bin' \
  ':/usr/local/bin'

test_case \
  'タブを含むパス' \
  '/usr/bin:/path	with	tab:/bin' \
  '/path	with	tab' \
  '/usr/bin:/bin'

test_case \
  '相対パス' \
  '/usr/bin:./local:../parent:/bin' \
  './local' \
  '/usr/bin:../parent:/bin'

test_case \
  'チルダを含むパス' \
  '/usr/bin:~/bin:/bin' \
  '~/bin' \
  '/usr/bin:/bin'

test_case \
  '非常に長いパス名' \
  '/usr/bin:/very/long/path/that/goes/on/and/on/and/on/and/on/and/on/and/on:/bin' \
  '/very/long/path/that/goes/on/and/on/and/on/and/on/and/on/and/on' \
  '/usr/bin:/bin'

test_case \
  '全て同じパス（1つ目のみ削除）' \
  '/usr/bin:/usr/bin:/usr/bin' \
  '/usr/bin' \
  ''

test_case \
  'バックスラッシュを含むパス' \
  '/usr/bin:/path\with\backslashes:/bin' \
  '/path\with\backslashes' \
  '/usr/bin:/bin'

echo ''
echo '========================================='
echo 'テスト完了'
echo '========================================='
```

</details>
