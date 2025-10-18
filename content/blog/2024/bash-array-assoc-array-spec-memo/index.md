---
title: "Bash における配列/連想配列の動作の覚書"
postdate: "2024-10-18T22:46"
update: "2024-11-21T07:30"
tags: ["Bash"]
---

[Bash Reference Manual の Array](https://www.gnu.org/software/bash/manual/bash.html#Arrays) セクションを読めば十分であるが、動作サンプルも添えておく。

実行環境は次のとおりである。

```console
$ uname -ms
Darwin arm64

$ bash --version
GNU bash, version 5.2.32(1)-release (aarch64-apple-darwin23.6.0)
Copyright (C) 2022 Free Software Foundation, Inc.
License GPLv3+: GNU GPL version 3 or later <http://gnu.org/licenses/gpl.html>

This is free software; you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.
```

## 基本操作メモ

配列・連想配列に共通して行えることで、少し忘れがちなのでメモしておく。

### 要素数を取得する

Lua などのように `#` をつける。

```bash
echo "count: ${#variable[@]}"
```

### Keyを列挙する

配列の場合は、インデックス (数字) になる。

```bash
echo "keys: ${!variable[@]}"

for key in "${!variable[@]}"; do
  echo "$key"
done
```

### 指定した要素の削除

`unset` を使う。

```bash
unset variable["$key"]
```

## 配列

- 0-indexed
- 負のインデックスで後ろ側からアクセスできる
- インデックスは連続していなくて良い
- インデックスには数値として評価可能なものが使える

それぞれについてサンプルと簡単な説明を書いていく。

### 0-indexed

zsh や fish では配列は 1-indexed であった。bash では異なることが次のスクリプトからも確認できる。

```console
$ declare -a array

$ array=('a' 'b' 'c')

$ echo "${array[@]}"
a b c

$ echo "${array[0]} - ${array[1]} - ${array[2]}"
a - b - c
```

これを zsh で実行すると、最後の出力が ` - a - b` であることを確認できるはずである。

また、範囲外のアクセスについては (正のインデックスなら) 何も展開しない。

```console
$ declare -a array=('a' 'b' 'c')

$ echo "${array[4]}"

```

### 負のインデックスで後ろ側からアクセスできる

Python や Ruby などと同じく、負のインデックスを使って配列の末尾からアクセスできる。

```console
$ declare -a array=('a' 'b' 'c')

$ echo "${array[-1]}"
a

$ echo "${array[-2]}"
a

$ echo "${array[-4]}"
bash: array: bad array subscript
```

配列外参照については正のインデックスの時と異なり、エラーが表示されている。

このエラーの出力場所を調べるため次のようにしたが、次のようになり、わからなかった。(分かる方教えて欲しいです。)

```console
$ echo "${array[-4]}" &> /dev/null
bash: array: bad array subscript
```

### インデックスは連続していなくて良い

bash の配列は直接インデックスを指定して追加/書き換えが可能である。
指定したインデックスが配列に存在しなければ新たに作成され、割り当て(代入)が行われる。

```console
$ echo "${array[@]}"
a b c

$ array[2]='3'

$ echo "${array[@]}"
a b 3

$ array[3]='append'

$ echo "${array[@]}"
a b 3 append
```

そのため、次のようにして歯抜けな配列を作成でき、`@` やループでその配列を参照できる。

```console
$ declare -a array=()

$ array[2]="tow"

$ echo "${array[2]}"
tow

$ array[5]="five"

$ echo "${array[5]}"
five

$ echo "${array[@]}"
tow five

$ for index in "${!array[@]}"; do echo "index=${index} value=${array[$index]}"; done
index=2 value=tow
index=5 value=five
```

もちろん `unset` を使って要素を削除して歯抜けの配列を作ることもできる。

```console
$ array=('one' 'two' 'three')

$ unset array[1]

$ echo "${array[@]}"
one three
```

### インデックスには数値として評価可能なものが使える

数値だけでなく、数字な文字列を指定してもアクセスできる。

```console
$ echo "${array[@]}"
a b c

$ echo "${array["1"]}"
b

$ echo "${array["-1"]}"
3
```

次のように、余分な 0 がついている文字や、10 進数でない文字も正しく数値に解釈されるようである。

```console
$ array=(0 1)

$ echo "${array["001"]}"
1

$ array[31]="hex number 1f"

$ echo "${array["0x1F"]}"
hex number 1f
```

## 連想配列

- Bash version 4 以上で使用可能
- 順序は保持されない

それぞれについてサンプルと簡単な説明を書いていく。

### Bash version 4 以上で使用可能

macOS (Sequoia 15.0.1) の `/bin/bash` は次のとおりバージョンが古すぎて `declare -A` が出来ない。

```console
$ /bin/bash --version
GNU bash, version 3.2.57(1)-release (arm64-apple-darwin24)
Copyright (C) 2007 Free Software Foundation, Inc.

$ /bin/bash
bash-3.2$ declare -A map
bash: declare: -A: invalid option
declare: usage: declare [-afFirtx] [-p] [name[=value] ...]
```

macOS ユーザは Homebrew や Nix 等で bash を新たに入れることを勧める。

このようにシステムの bash バージョンが古い可能性もあるため、シェルスクリプトの Shebang には `#!/bin/bash` ではなく、 `#!/usr/bin/env bash` の方を使用した方がいいのかもしれない。

### 順序は保持されない

Bash の連想配列がどのような実装であるのかの記述を見つけることができなかったので、次のスクリプトで動作を確かめた。

```bash
declare -A map
# map=(
#   ['orange']='fruit'
#   ['carrot']='vegetable'
#   ['banana']='fruit'
#   ['tomato']='vegetable'
# )
keys=(  'orange' 'carrot'    'banana' 'tomato')
values=('fruit'  'vegetable' 'fruit'  'vegetable')
for i in "${!keys[@]}"; do
  map["${keys[$i]}"]="${values[$i]}"
done

echo 'Iterated key-value pairs:'
for key in "${!map[@]}"; do
  echo "$key -> ${map[$key]}"
done
```

これを実行すると次の出力が得られた。

```
Iterated key-value pairs:
orange -> fruit
tomato -> vegetable
carrot -> vegetable
banana -> fruit
```

推測であるが、HashMap のようになっていると思われる。
