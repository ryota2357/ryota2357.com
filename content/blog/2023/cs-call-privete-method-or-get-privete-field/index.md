---
title: "[C#] Privateなフィールドの取得とPrivateなメソッドの呼び出し (コピペ用)"
postdate: "2023-02-26T18:27"
update: "2023-02-26T18:27"
tags: ["CSharp"]
---

コピペ用。

.Net 7 で書いていたプロジェクトから切り出した。間違いがあるかもしれない。

## Private なフィールドを取得する

### 非 null なフィールド

```cs
public static T GetPrivateField<T>(object obj, string name)
{
    var ret = GetPrivateNullableField<T>(obj, name);
    return ret is null
        ? throw new Exception("Field value is null, You should use GetPrivateNullableField instead.")
        : ret;
}
```

### nullable なフィールド

```cs
public static T? GetPrivateNullableField<T>(object obj, string name)
{
    var type = obj.GetType();
    var field = type.GetField(name,
        BindingFlags.Public | BindingFlags.NonPublic | // All access levels
        BindingFlags.Static | BindingFlags.Instance | // No consideration for static or instance
        BindingFlags.GetField
    );

    if (field is null)
    {
        throw new Exception($"Failed to get private fields: {name} in {type}.");
    }

    return field.GetValue(obj) is T ret ? ret : default;
}
```

## Private なメソッドを呼び出す

### 返り値なし

```cs
public static void CallPrivateMethod(object obj, string name, params object[] args)
{
    var type = obj.GetType();
    var method = type.GetMethod(
        name,
        BindingFlags.Public | BindingFlags.NonPublic | // All access levels
        BindingFlags.Static | BindingFlags.Instance | // No consideration for static or instance
        BindingFlags.InvokeMethod,
        args.Select(a => a.GetType()).ToArray()
    );

    if (method is null)
    {
        throw new Exception($"Failed to call private method. {name} in {type} is not found.");
    }

    try
    {
        method.Invoke(obj, args);
    }
    catch (Exception e)
    {
        throw e.InnerException ?? e;
    }
}
```

### 返り値あり

```cs
public static T? CallPrivateMethod<T>(object obj, string name, params object[] args)
{
    var type = obj.GetType();
    var method = type.GetMethod(name,
        BindingFlags.Public | BindingFlags.NonPublic | // All access levels
        BindingFlags.Static | BindingFlags.Instance | // No consideration for static or instance
        BindingFlags.InvokeMethod,
        args.Select(a => a.GetType()).ToArray()
    );

    if (method is null)
    {
        throw new Exception($"Failed to call private method. {name} in {type} is not found.");
    }

    try
    {
        var ret = method.Invoke(obj, args);
        return ret is T t ? t : default;
    }
    catch (Exception e)
    {
        throw e.InnerException ?? e;
    }
}
```
