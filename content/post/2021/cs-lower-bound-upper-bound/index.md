---
title: "[C#] LowerBoundとUpperBoundの実装と例外処理"
postdate: "2021-04-18T08:49"
update: "2021-04-18T08:49"
tags: ["CSharp"]
---

C++には STL として`lower_bound`と`upper_bound`があるに C#にはない。  
別に単純な二分探索だからその場で実装すれば良いんでだけどライブラリとして持っている方がジェネリック化できたり、例外処理をできたりとかするので作った。

## 要件設定

`lower_bound`、`upper_bound`実装内容については他にも解説している記事があるのでここでは書かない。

以下の要件を満たすものを作成する

- 拡張メソッドである。
- 無効な引数に対して例外が発生する。
- 部分的な探索も可能である。
- 使用する比較関数を定義できる。

具体化する。

- 引数には this List\<T\> を用いる。
- 引数チェックを行う。
- key 以外にも区間 [first, last) を指定できるよう引数を作る。
- IComparable\<T\> 制約を満たさなくても引数に IComparer\<T\> か Comparison\<T\> を渡せば探索できるようにする。

## 実装

以下が作成したものです。  
長いので折り畳んであります。

<details>
  <summary>LowerBound.cs</summary>

```cs
public static partial class ListExtension {
    /// <summary>
    /// [Extension] Returns the first index where a value greater than or equal to <i>key</i> appears for the entire list using the default comparer.
    /// </summary>
    public static int LowerBound<T>(this List<T> list, T key) where T : IComparable<T> {
        try {
            return list.LowerBound(0, list.Count, key);
        } catch (Exception e) {
            throw e; // あえてここで投げ直すことで呼び出し元を自然にする
        }
    }

    /// <summary>
    /// [Extension] Returns the first index where a value greater than or equal to <i>key</i> appears for the range [first, last) of the list using the default comparer.
    /// </summary>
    public static int LowerBound<T>(this List<T> list, int first, int last, T key) where T : IComparable<T> {
        if(list == null) throw new ArgumentNullException("This list is null.");
        if(first < 0 || list.Count <= first) throw new ArgumentOutOfRangeException("Parameter:first is outside the allowable range of list.");
        if(last <= 0 || list.Count < last) throw new ArgumentOutOfRangeException("Parameter:last is outside the allowable range of list.");
        if(first >= last) throw new ArgumentException("Parameter:first must be smaller than parameter:last.");

        last -= 1; // 閉区間に調整
        while(first - last < 1) {
            int center = ((last - first) >> 1) + first;
            if(list[center].CompareTo(key) < 0) {
                first = center + 1;
            } else {
                last = center - 1;
            }
        }
        return first;
    }

    /// <summary>
    /// [Extension] Returns the first index where a value greater than or equal to <i>key</i> appears for the entire list using the specified comparer.
    /// </summary>
    public static int LowerBound<T>(this List<T> list, T key, IComparer<T> comparer) {
        try {
            return list.LowerBound(0, list.Count, key, comparer);
        } catch (Exception e) {
            throw e; // あえてここで投げ直すことで呼び出し元を自然にする
        }
    }

    /// <summary>
    /// [Extension] Returns the first index where a value greater than or equal to <i>key</i> appears for the range [first, last) of the list using the specified comparer.
    /// </summary>
    public static int LowerBound<T>(this List<T> list, int first, int last, T key, IComparer<T> comparer) {
        if(list == null) throw new ArgumentNullException("This list is null.");
        if(first < 0 || list.Count <= first) throw new ArgumentOutOfRangeException("Parameter:first is outside the allowable range of list.");
        if(last <= 0 || list.Count < last) throw new ArgumentOutOfRangeException("Parameter:last is outside the allowable range of list.");
        if(first >= last) throw new ArgumentException("Parameter:first must be smaller than parameter:last.");

        last -= 1; // 閉区間に調整
        while(first - last < 1) {
            int center = ((last - first) >> 1) + first;
            if(comparer.Compare(list[center], key) < 0) {
                first = center + 1;
            } else {
                last = center - 1;
            }
        }
        return first;
    }

    /// <summary>
    /// [Extension] Returns the first index where a value greater than or equal to <i>key</i> appears for the entire list using the specified Comparison&lt;T&gt;.
    /// </summary>
    public static int LowerBound<T>(this List<T> list, T key, Comparison<T> comparison) {
        try {
            return list.LowerBound(0, list.Count, key, comparison);
        } catch (Exception e) {
            throw e; // あえてここで投げ直すことで呼び出し元を自然にする
        }
    }

    /// <summary>
    /// [Extension] Returns the first index where a value greater than or equal to <i>key</i> appears for the range [first, last) of the list using the specified Comparison&lt;T&gt;.
    /// </summary>
    public static int LowerBound<T>(this List<T> list, int first, int last, T key, Comparison<T> comparison) {
        if(list == null) throw new ArgumentNullException("This list is null.");
        if(first < 0 || list.Count <= first) throw new ArgumentOutOfRangeException("Parameter:first is outside the allowable range of list.");
        if(last <= 0 || list.Count < last) throw new ArgumentOutOfRangeException("Parameter:last is outside the allowable range of list.");
        if(first >= last) throw new ArgumentException("Parameter:first must be smaller than parameter:last.");

        last -= 1; // 閉区間に調整
        while(first - last < 1) {
            int center = ((last - first) >> 1) + first;
            if(comparison(list[center], key) < 0) {
                first = center + 1;
            } else {
                last = center - 1;
            }
        }
        return first;
    }
}
```

</details>

<details>
  <summary>UpperBound.cs</summary>

```cs
public static partial class ListExtension {

    /// <summary>
    /// [Extension] Returns the first index where a value greater than <i>key</i> appears for the entire list using the default comparer.
    /// </summary>
    public static int UpperBound<T>(this List<T> list, T key) where T : IComparable<T> {
        try {
            return list.UpperBound(0, list.Count, key);
        } catch (Exception e) {
            throw e; // あえてここで投げ直すことで呼び出し元を自然にする
        }
    }

    /// <summary>
    /// [Extension] Returns the first index where a value greater than <i>key</i> appears for the range [first, last) of the list using the default comparer.
    /// </summary>
    public static int UpperBound<T>(this List<T> list, int first, int last, T key) where T : IComparable<T> {
        if(list == null) throw new ArgumentNullException("This list is null.");
        if(first < 0 || list.Count <= first) throw new ArgumentOutOfRangeException("Parameter:first is outside the allowable range of list.");
        if(last <= 0 || list.Count < last) throw new ArgumentOutOfRangeException("Parameter:last is outside the allowable range of list.");
        if(first >= last) throw new ArgumentException("Parameter:first must be smaller than parameter:last.");

        last -= 1; // 閉区間に調整
        while(first - last < 1) {
            int center = ((last - first) >> 1) + first;
            if(list[center].CompareTo(key) <= 0) {
                first = center + 1;
            } else {
                last = center - 1;
            }
        }
        return first;
    }

    /// <summary>
    /// [Extension] Returns the first index where a value greater than <i>key</i> appears for the entire list using the specified comparer.
    /// </summary>
    public static int UpperBound<T>(this List<T> list, T key, IComparer<T> comparer) {
        try {
            return list.UpperBound(0, list.Count, key, comparer);
        } catch(Exception e) {
            throw e; // あえてここで投げ直すことで呼び出し元を自然にする
        }
    }

    /// <summary>
    /// [Extension] Returns the first index where a value greater than <i>key</i> appears for the range [first, last) of the list using the specified comparer.
    /// </summary>
    public static int UpperBound<T>(this List<T> list, int first, int last, T key, IComparer<T> comparer) {
        if(list == null) throw new ArgumentNullException("This list is null.");
        if(first < 0 || list.Count <= first) throw new ArgumentOutOfRangeException("Parameter:first is outside the allowable range of list.");
        if(last <= 0 || list.Count < last) throw new ArgumentOutOfRangeException("Parameter:last is outside the allowable range of list.");
        if(first >= last) throw new ArgumentException("Parameter:first must be smaller than parameter:last.");

        last -= 1; // 閉区間に調整
        while(first - last < 1) {
            int center = ((last - first) >> 1) + first;
            if(comparer.Compare(list[center], key) <= 0) {
                first = center + 1;
            } else {
                last = center - 1;
            }
        }
        return first;
    }

    /// <summary>
    /// [Extension] Returns the first index where a value greater than <i>key</i> appears for the entire list using the specified Comparison&lt;T&gt;.
    /// </summary>
    public static int UpperBound<T>(this List<T> list, T key, Comparison<T> comparison) {
        if(list == null) throw new ArgumentNullException();
        try {
            return list.UpperBound(0, list.Count, key, comparison);
        } catch(Exception e) {
            throw e; // あえてここで投げ直すことで呼び出し元を自然にする
        }
    }

    /// <summary>
    /// [Extension] Returns the first index where a value greater than <i>key</i> appears for the range [first, last) of the list using the specified Comparison&lt;T&gt;.
    /// </summary>
    public static int UpperBound<T>(this List<T> list, int first, int last, T key, Comparison<T> comparison) {
        if(list == null) throw new ArgumentNullException("This list is null.");
        if(first < 0 || list.Count <= first) throw new ArgumentOutOfRangeException("Parameter:first is outside the allowable range of list.");
        if(last <= 0 || list.Count < last) throw new ArgumentOutOfRangeException("Parameter:last is outside the allowable range of list.");
        if(first >= last) throw new ArgumentException("Parameter:first must be smaller than parameter:last.");
        last -= 1;
        while(first - last < 1) {
            int center = ((last - first) >> 1) + first;
            if(comparison(list[center], key) <= 0) {
                first = center + 1;
            } else {
                last = center - 1;
            }
        }
        return first;
    }
}
```

</details>
