---
title: "bash における配列/連想配列の動作の覚書"
postdate: "2024-10-10T22:33"
update: "2024-10-10T22:33"
tags: ["Bash"]
draft: true
---

Bash Reference Manual の Array セクションを読めば十分であるが、動作サンプルも添えておいておく。

実行環境は次のとおりである。

```
$ uname -ms
Darwin arm64

$ bash --version
GNU bash, version 5.2.32(1)-release (aarch64-apple-darwin23.6.0)
Copyright (C) 2022 Free Software Foundation, Inc.
License GPLv3+: GNU GPL version 3 or later <http://gnu.org/licenses/gpl.html>

This is free software; you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

```

前提として、bash では `declare -a` で配列を `declare -A` で連想配列を作れるのだが、`/bin/bash` は次のとおりバージョンが古すぎて `declare -A` が出来ないので、`/usr/bin/env bash` の方を主に使用する。

```
$ /bin/bash --version
GNU bash, version 3.2.57(1)-release (arm64-apple-darwin24)
Copyright (C) 2007 Free Software Foundation, Inc.

$ /bin/bash

bash-3.2$ declare -A array
bash: declare: -A: invalid option
declare: usage: declare [-afFirtx] [-p] [name[=value] ...]
```

## 配列

以下の特徴がある。

- 0-indexed
- 負のインデックスで後ろ側からアクセスできる
- インデックスは連続していなくて良い
- 添え字には数値として評価可能なものが使える

### 0-indexed

zsh では配列は 1-indexed であった。bash では異なることが次のスクリプトからも確認できる。

```shell
$ declare -a array

$ array=('a' 'b' 'c')

$ echo "${array[@]}"
a b c

$ echo "${array[0]} - ${array[1]} - ${array[2]}"
a - b - c
```

これを zsh で実行すると、最後の出力が ` - a - b` であることが確認できるはずである。

また、範囲外のアクセスについては (正のインデックスなら) 何も展開しない。

```
$ declare -a array=('a' 'b' 'c')

$ echo "${array[4]}"

```

### 負のインデックスで後ろ側からアクセスできる

Python や Ruby などと同じく、負のインデックスを使って配列の末尾からアクセスできる。

```shell
$ declare -a array=('a' 'b' 'c')

$ echo "${array[-1]}"
a

$ echo "${array[-2]}"
a

$ echo "${array[-4]}"
bash: array: bad array subscript
```

正のインデックスの時と異なり、エラーが表示されている。

このエラーの出力場所を調べるため次のようにしたが、次のようになり、わからなかった。(分かる方教えて欲しいです。)

```shell
$ echo "${array[-4]}" &> /dev/null
bash: array: bad array subscript
```


### インデックスは連続していなくて良い

配列への要素の末尾への追加 (append) は次のように `+=` を利用して行える。

```shell
$ echo "${array[@]}"
a b c

$ array+=('d')

$ echo "${array[@]}"

a b c d
```

`+=` を使わず次のようにもできる。

```shell
$ echo "${array[@]}"
a b c

$ array=("${array[@]}" 'd')

$ echo "${array[@]}"

a b c d
```

この方法であれば、先頭に追加 (prepend) も同様にして行えることがわかるだろう。

また、直接インデックスを指定して追加/書き換えが可能である。
指定したインデックスが配列に存在しなければ新たに作成され、割り当て(代入)が行われる。

```shell
$ echo "${array[@]}"
a b c

$ array[2]='3'

$ echo "${array[@]}"
a b 3

$ array[3]='append'

$ echo "${array[@]}"
a b 3 append
```

そのため、次のようにして歯抜けな配列を作成でき、`@` やループでもその配列を参照できる。

```shell
$ declare -a array=()

$ array[2]="tow"

$ echo "${array[2]}"
tow

$ array[5]="five"

$ echo "${array[2]}"
five

$ echo "${array[@]}"
tow file

$ for index in "${!array[@]}"; do echo "index=${index} value=${array[$index]}"; done
index=2 value=tow
index=5 value=five
```

### 添え字には数値として評価可能なものが使える


## 連想配列
