---
title: "[Dart] for, for-in, .foreach() のスピードテスト"
postdate: "2021-07-31T07:58"
update: "2021-07-31T07:58"
tags: ["Dart"]
---

benchmark_harness を使用してそれぞれの速度を測った。  
そこそこの長さの List を作って、その和を for で求めるだけのもの。

`dart run` と、`dart compile exe` の 2 つで複数回測定。

## 環境

```txt
MacOS BigSur 11.4
MacBook Pro (13-inch, 2018, Four Thunderbolt 3 Ports)
プロセッサ 2.3 GHz クアッドコアIntel Core i5
メモリ 8GB
```

## 結果

測定結果は 2 つ載せておく。

### dart run

`dart run` では for と for-in はほぼ同速度。for が速かったり、for-in の方が速かったり実行のたびに変わる。

|    for    |  for-in   |  foreach  |
| :-------: | :-------: | :-------: |
| 3150658us | 3492088us | 8578483us |
| 3406944us | 3226942us | 8003298us |

### dart compile

`dart compile exe` でコンパイルしたものを実行してみると、for-in が遅くなる。

|    for    |  for-in   |  foreach  |
| :-------: | :-------: | :-------: |
| 3178150us | 7413020us | 8062968us |
| 3311593us | 8556342us | 8061869us |

## 使用したコード

```dart
import 'dart:math';
import 'package:benchmark_harness/benchmark_harness.dart';

int _LENGTH = 100000000;

class ForBenchmark extends BenchmarkBase {
  ForBenchmark() : super('for');
  static void main() => ForBenchmark().report();

  final List<double> list = [];
  double sum = 0;

  @override
  void run() {
    for (int i = 0; i < list.length; i++) {
      sum += list[i];
    }
  }

  @override
  void setup() {
    for (int i = 0; i < _LENGTH; i++) {
      list.add(pow(-1.0, i) / (2.0 * i + 1.0));
    }
    sum = 0;
  }

  @override
  void teardown() {
    print(sum);
    list.clear();
  }
}

class ForInBenchmark extends BenchmarkBase {
  ForInBenchmark() : super('for-in');
  static void main() => ForInBenchmark().report();

  final List<double> list = [];
  double sum = 0;

  @override
  void run() {
    for (final x in list) {
      sum += x;
    }
  }

  @override
  void setup() {
    for (int i = 0; i < _LENGTH; i++) {
      list.add(pow(-1.0, i) / (2.0 * i + 1.0));
    }
    sum = 0;
  }

  @override
  void teardown() {
    print(sum);
    list.clear();
  }
}

class ForEachBenchmark extends BenchmarkBase {
  ForEachBenchmark() : super('foreach');
  static void main() => ForEachBenchmark().report();

  final List<double> list = [];
  double sum = 0;

  @override
  void run() {
    list.forEach((element) => sum += element);
  }

  @override
  void setup() {
    for (int i = 0; i < _LENGTH; i++) {
      list.add(pow(-1.0, i) / (2.0 * i + 1.0));
    }
    sum = 0;
  }

  @override
  void teardown() {
    print(sum);
    list.clear();
  }
}

void main() {
  ForBenchmark.main();
  ForInBenchmark.main();
  ForEachBenchmark.main();
}
```
