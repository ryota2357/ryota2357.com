---
title: "Pythonのforループでrangeを小数点刻み、かつ誤差を出さないようにする"
postdate: "2021-07-31T15:43"
tags: ["Python"]
---

rangeの第3引数で小数を指定したいと思ったので、いい感じになるように頑張った記録を残しておきます。

## どんなのができたか

区間[1, 5)を1.021刻みでループするコードは以下になります。  

```python
for i in Range(1, 5, "1.021"):
    print(i)

"""
1.0
2.021
3.042
4.063
"""
```

## Rangeの実装

先に実装を載せておきます。  
配列(list)を使わずに実装してます。  
次の「[説明](#toc_headline_3)」から読んだ方がいいかもです。

ちょっと長いですが、複数の引数パターンを作るためのただのif文です。  
あと、例外処理はしてないです。

```python
from collections.abc import Sequence

class Range(Sequence):
    def __init__(self, *args):
        if len(args) == 1:
            self._start = 0
            self._end = args[0]
            self._step = '1'
        elif len(args) == 2:
            if isinstance(args[1], int):
                self._start = args[0]
                self._end = args[1]
                self._step = '1'
            else:
                self._start = 0
                self._end = args[0]
                self._step = args[1]
        elif len(args) == 3:
            self._start = args[0]
            self._end = args[1]
            self._step = args[2]
        else:
            raise TypeError()

        dot = self._step.find('.')
        if dot != -1: dot = len(self._step) - (dot+1)
        else: dot = 0
        self._ep = 10**dot
        self._rp = int(self._step.replace('.',''))

    def __getitem__(self, index):
        if index < 0: index += len(self)
        ret = (self._start*self._ep)+(index*self._rp)
        ret /= self._ep
        if ret >= self._end: raise IndexError()
        return ret                                       
```

## 説明

第3引数を浮動小数点ではなく文字列にすることで分数のように扱い、誤差を減らしています。  
実行速度はrangeの4倍程度でした。(AtCoderのコードテストで測定)  
引数の取り方は4種類想定しています。

```python
Range(100)
Range(1, 100)
Range(100, "0.1")
Range(1, 100, "0.1")
```

### 内部処理について

#### &#095;&#095;init&#095;&#095;(self)

イニシャライザではまず、4つの引数パターンをカバーするための分岐をします。  
ここはコード読んでください。

続いて`step`を解析します。  
具体例から、

```txt
0.1 -> 1 / 10
0.25 -> 25 / 100
```

と言った感じで10の累乗の分数にしてそれぞれ分子の値を`_rp`、分母の値を`_ep`に保存します。

該当部分にコメントを追加して再掲

```python
# 小数点の位置を取得
dot = self._step.find('.')

# 未発見の場合は0に
# 発見したら小数点以下の桁数に変換する
if dot != -1: dot = len(self._step) - (dot+1)
else: dot = 0

# _epには分母(10^{小数点以下の桁数})
self._ep = 10**dot

# _rpには分子(小数点を取り除いてintに変換)
self._rp = int(self._step.replace('.',''))
```

#### &#095;&#095;getitem&#095;&#095;(self, index)

インデックスアクセスを定義します。  
例えば Range(1, 2, 0.2) の1番目は1.0、2番は1.2、3番目は1.4という感じです。

誤差を減らすために除算を最後に行います。

```python
def __getitem__(self, index):
    # 負のとき
    if index < 0: index += len(self)

    # 分子を計算
    ret = (self._start*self._ep)+(index*self._rp)

    # 分母で割る
    ret /= self._ep

    # 終了値以上であったらエラーを出すとforを抜ける
    if ret >= self._end: raise IndexError()
    return ret                                     
```

## 補足

本題はここまでです。ちょっとした補足をします。

### 速度計測

ACoderのコードテストを使いました。

<details>
  <summary>使用したコード[開く]</summary>

```python
from collections.abc import Sequence
import time

class Range(Sequence):
    def __init__(self, *args):
        if len(args) == 1:
            self._start = 0
            self._end = args[0]
            self._step = '1'
        elif len(args) == 2:
            if isinstance(args[1], int):
                self._start = args[0]
                self._end = args[1]
                self._step = '1'
            else:
                self._start = 0
                self._end = args[0]
                self._step = args[1]
        elif len(args) == 3:
            self._start = args[0]
            self._end = args[1]
            self._step = args[2]
        else:
            raise TypeError()

        dot = self._step.find('.')
        if dot != -1: dot = len(self._step) - (dot+1)
        else: dot = 0
        self._ep = 10**dot
        self._rp = int(self._step.replace('.',''))

    def __getitem__(self, index):
        if index < 0: index += len(self)
        ret = (self._start*self._ep)+(index*self._rp)
        ret /= self._ep
        if ret >= self._end: raise IndexError()
        return ret

    def __len__(self):
        d = (self._end-self._start)
        return round((d/float(self._step))+0.5)


start, end = map(int, input().split())
step = input()

sum = 0

s = time.time()


for i in Range(start, end, step):
    sum += i


elapsed_time = time.time() - s
print ("elapsed_time:{0}".format(elapsed_time) + "[sec]")

end *= int(round(1/float(step)))
sum = 0

s = time.time()


for i in range(start, end):
    sum += i

    
elapsed_time2 = time.time() - s
print ("elapsed_time:{0}".format(elapsed_time2) + "[sec]")  
```

</details>

標準入力には何十通りかやったところ大体速度差が4倍程度でした。

結果一例

```txt
標準入力
1 100000
0.021

標準出力
elapsed_time:2.1286604404449463[sec]
elapsed_time:0.5733368396759033[sec]
```

### 他の方法との比較

ネット検索するとよくでてくるやつとの違いです。  
NumPy使うやり方は[これ](https://snowtree-injune.com/2019/07/07/arange-linspace)見てください。誤差でます。

他にも`i`に何かを割るとか掛けるとかのやり方があるけど、そもそもスタートがずれるし、誤差でます。こんな感じです。

```python
for i in range(1, 5):
    i *= 1.021
    print(i)

"""
1.021
2.042
3.0629999999999997
4.084
"""
```

## 参考
[【Python】rangeを再実装し、計算量について学ぶ](https://qiita.com/tanuk1647/items/6051599e8eeff510a453)  
[【Python】処理にかかる時間を計測して表示](https://qiita.com/fantm21/items/3dc7fbf4e935311488bc)
