---
title: "[C#] 比較の定義 (IComparable, IComparer, Comparison, Comparer)"
postdate: "2021-02-11T11:00"
update: "2021-02-11T11:00"
tags: ["C#"]
---

<!-- textlint-disable ja-technical-writing/ja-no-mixed-period -->

C#にて、比較に関係する

<!-- textlint-enable ja-technical-writing/ja-no-mixed-period -->

- IComparable / IComparable\<T\>
- IComparer / IComparer\<T\>
- Comparison\<T\>
- Comparer\<T\>

について整理しました。

## まとめ

<!-- textlint-disable ja-technical-writing/ja-no-mixed-period  -->

ものすごく大雑把に

IComparable / IComparable\<T\> は「自身と他」の比較  
IComparer / IComparer\<T\> は「他と他」の比較  
Comparison\<T\> は比較のデリゲート  
Comparer\<T\> は比較の抽象クラス

<!-- textlint-enable ja-technical-writing/ja-no-mixed-period -->

1 つずつ見ていきます。

## IComparable / IComparable\<T\>

[IComparable](https://docs.microsoft.com/ja-jp/dotnet/api/system.icomparable?view=net-5.0)

> 値型またはクラスで実装する、インスタンスの並べ替えを目的とする型固有の汎用比較メソッドを定義します。

[IComparable\<T\>](https://docs.microsoft.com/ja-jp/dotnet/api/system.icomparable-1?view=net-5.0)

> インスタンスの並べ替えなどを目的とし、型固有の比較メソッドを作成するために値型またはクラスで実装する、汎用の比較メソッドを定義します。

「自身と他のオブジェクト」との比較を定義するインターフェースです。

また、[CompareTo(Object)](https://docs.microsoft.com/ja-jp/dotnet/api/system.icomparable.compareto?view=net-5.0) / [CompareTo(T)](https://docs.microsoft.com/ja-jp/dotnet/api/system.icomparable-1.compareto?view=net-5.0) メソッドを実装する必要があります。

### 使用例

TestComp というクラスを作り、昇順に並べ替えてみました。

<details>
  <summary>IComparableを使った場合</summary>

```cs
public class Program {
    public static void Main() {
        var t = new List<TestComp>() {
            new TestComp(10), new TestComp(1), new TestComp(5)
        };
        t.Sort();
        foreach(var x in t) Console.Write(x.x + " "); //<-  1 5 10
        Console.WriteLine();
    }
}

class TestComp : IComparable {
    public int x;
    public TestComp(int x) {
        this.x = x;
    }

    public int CompareTo(object obj) {
        if(obj == null) throw new ArgumentNullException();
        if(!(obj is TestComp)) throw new ArgumentException();

        var val = obj as TestComp;
        return this.x - val.x;
    }
}
```

</details>

ジェネリックインターフェースを使うと、例外処理やキャストをする必要が減って読みやすくなりました。

<details>
  <summary>IComparable&lt;T&gt;を使った場合</summary>

```cs
public class Program {
    public static void Main() {
        var t = new List<TestComp>() {
            new TestComp(10), new TestComp(1), new TestComp(5)
        };
        t.Sort();
        foreach(var x in t) Console.Write(x.x + " "); //<-  1 5 10
        Console.WriteLine();
    }
}

class TestComp : IComparable<TestComp> {
    public int x;
    public TestComp(int x) {
        this.x = x;
    }

    public int CompareTo(TestComp other) {
        if(other == null) throw new ArgumentNullException();
        return this.x - other.x;
    }
}
```

</details>

## IComparer / IComparer\<T\>

[IComparer](https://docs.microsoft.com/ja-jp/dotnet/api/system.collections.icomparer?view=net-5.0)

> 2 つのオブジェクトを比較するメソッドを公開します。

[IComparer\<T\>](https://docs.microsoft.com/ja-jp/dotnet/api/system.collections.generic.icomparer-1?view=net-5.0)

> 2 つのオブジェクトを比較するために型が実装するメソッドを定義します。

「他のオブジェクトと、他のオブジェクト」との比較を定義するインターフェースです。  
IComparable と名前が似ていますが全くの別物で「自身と」ではなく、「他と他」を比較します。

また、[Compare(Object, Object)](https://docs.microsoft.com/ja-jp/dotnet/api/system.collections.icomparer.compare?view=net-5.0) / [Compare\<T\>(T, T)](https://docs.microsoft.com/ja-jp/dotnet/api/system.collections.generic.icomparer-1.compare?view=net-5.0) メソッドを実装する必要があります。

### 使用例

int の配列を降順にソートしてみます。  
Array.Sort()を使います。  
(List\<T\>.Sort()は IComparer には対応していません。ジェネリックの方は対応しています。)

<details>
  <summary>IComparerを使った場合</summary>

```cs
public class Program {
    public static void Main() {
        var t = new List<int> { 10, 1, 5 };
        Array.Sort(t.ToArray(), new MyComp());
        foreach(var x in t) Console.Write(x + " "); // <-  10 5 1
        Console.WriteLine();
    }
}

class MyComp : IComparer {
    public int Compare(object x, object y) {
        var valx = (int)x;
        var valy = (int)y;
        return valy - valx;
    }
}
```

</details>

キャストが消えてスッキリです。  
また、List\<T\>.Sort()が使えるようになります。

<details>
  <summary>IComparer\<T\>を使った場合</summary>

```cs
public class Program {
    public static void Main() {
        var t = new List<int> { 10, 1, 5 };
        t.Sort(new MyComp());
        foreach(var x in t) Console.Write(x + " "); // <-  10 5 1
        Console.WriteLine();
    }
}

class MyComp : IComparer<int> {
    public int Compare(int x, int y) {
        return y - x;
    }
}
```

</details>

## Comparison\<T\>

[Comparison\<T\>](https://docs.microsoft.com/ja-jp/dotnet/api/system.comparison-1?view=net-5.0)

> 同じ型の 2 つのオブジェクトを比較するメソッドを表します。

他はインターフェースでしたが、これはデリゲートです。  
つまり関数であり、ラムダ式で表すことができます。

### 使用例

先ほどと同様に int の配列を降順ソートしてみます。  
かなり短いコードになりました。

<details>
  <summary>コードを見る</summary>

```cs
public class Program {
    public static void Main() {
        var t = new List<int> { 10, 1, 5 };
        t.Sort((x, y) => y-x);
        foreach(var x in t) Console.Write(x + " "); // <-  10 5 1
        Console.WriteLine();
    }
}
```

</details>

## Comparer\<T\>

[Comparer\<T\>](https://docs.microsoft.com/ja-jp/dotnet/api/system.collections.generic.comparer-1?view=net-5.0)

> IComparer\<T\> ジェネリック インターフェイスの実装のための基本クラスを提供します。
>
> ```cs
> public abstract class Comparer<T> : System.Collections.Generic.IComparer<T>, System.Collections.IComparer
> ```

IComparer と IComparer\<T\>の 2 つを継承するならば、このクラスを継承することでその 2 つの恩恵＋便利なメソッドがついてくる、という感じのものでしょうか。

### 使用例

これら 2 つの継承が必要な状況としては C++でいう比較関数のようなものを作成するのに良いかもしれません。  
非ジェネリックな ArrayList と、ジェネリックな List の両方へ対応できるようになります。  
(普通 ArrayList って使わないから...)

<details>
  <summary>いまいち必要な状況がわからないですが、比較関数のようなものを作ってみました。</summary>

```cs
public class Program {
    public static void Main() {
        ArrayList array = new ArrayList(new int[] {10, 1, 5});
        array.Sort(new Greater());
        foreach(var x in array) Console.Write(x + " "); // <-  10 5 1
        Console.WriteLine();
    }
}

class Greater: Comparer<int> {
  public override int Compare(int x, int y){
    return y - x;
  }
}
```

</details>

## その他

[StringComparer](https://docs.microsoft.com/ja-jp/dotnet/api/system.stringcomparer?view=net-5.0)

> 大文字と小文字の区別、およびカルチャ ベースまたは序数ベースの特定の比較規則を使用する文字列比較操作を表します。

## 参考記事

- [.NET API ブラウザー](https://docs.microsoft.com/ja-jp/dotnet/api/)
- [大小関係の定義と比較](https://smdn.jp/programming/netfx/comparison/0_comparison/)
- [例外処理 (++C++; // 未確認飛行 C)](https://ufcpp.net/study/csharp/oo_exception.html)
