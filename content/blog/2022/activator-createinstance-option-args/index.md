---
title: "Activator.CreateInstanceでオプション引数を扱う"
postdate: "2022-09-23T12:45"
update: "2022-09-23T12:45"
tags: ["CSharp"]
---

`Activator.CreateInstance(typeof(T))` で `T` のコンストラクタがオプション引数を使っている場合、オプション引数を考慮したインスタンス生成をする方法。

## 問題

こんな感じの `Test` クラスがある時、

```cs
class Test {
    public int X;
    public Test(int x = 10) {
        this.X = x;
    }
}
```

次のようになってしまう。

```cs
// これはエラーになってしまう
var i = Activator.CreateInstance(typeof(Test));

// OK
var i = Activator.CreateInstance(typeof(Test), 5);
```

オプション引数を考慮してほしい。

## 解決

次のオーバーロードを使う。

```cs
public static object? CreateInstance (Type type, System.Reflection.BindingFlags bindingAttr, System.Reflection.Binder? binder, object?[]? args, System.Globalization.CultureInfo? culture);
```

<a href="https://learn.microsoft.com/en-us/dotnet/api/system.activator.createinstance?view=net-6.0#system-activator-createinstance(system-type-system-reflection-bindingflags-system-reflection-binder-system-object()-system-globalization-cultureinfo">ドキュメント</a>

それぞれの引数はこんな感じにすれば期待通りになる。

```cs
var instance = Activator.CreateInstance(
    type: typeof(T),
    bindingAttr: BindingFlags.CreateInstance | BindingFlags.Public | BindingFlags.Instance | BindingFlags.OptionalParamBinding,
    binder: null,
    args: args,
    culture: null
);
```

## サンプル

次のスクリプトを実行すると 10 が表示される。

```cs
using System;
using System.Reflection;

class Test {
    public int X;
    public Test(int x = 10) {
        this.X = x;
    }
}

public static class Program {
    public static void Main() {
        // ↓これはエラー
        // var i = Activator.CreateInstance(typeof(Test));

        var i = Activator.CreateInstance(
            typeof(Test),
            BindingFlags.CreateInstance | BindingFlags.Public | BindingFlags.Instance | BindingFlags.OptionalParamBinding,
            null,
            new object[]{}, // nullでもOK
            System.Globalization.CultureInfo.CurrentCulture
        );

        if (i is Test test) {
            Console.WriteLine(test.X);
        }
    }
}
```

## 参考

https://stackoverflow.com/questions/11002523/activator-createinstance-with-optional-parameters
