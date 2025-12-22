---
title: "C# で Linux, OSX のルートパス(~/)を解決したかった"
postdate: "2022-11-27T21:19"
update: "2022-11-27T21:19"
tags: ["C#"]
---

`Path.GetFullPath("~/hoge")` で `/User/your_name/hoge` のように展開してくれないのです。

どーすれば良いんだろう。

正解わかる人いたら教えてください。

なんか違う気がするけど、僕のやってみた解決方法を残しておきます。

## 解決方法(仮)

```cs
var path = 対象のパス

if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX) || RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
{
    if (path.StartsWith("~/"))
    {
        var home = Environment.GetEnvironmentVariable("HOME") ??
                   Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
        path = Path.Combine(home, path[2..]);
    }
}

Console.WriteLine(path);
```

## 説明

自動で解決してもらうのは諦めて、`~` の絶対パスを取得して、適当にパスを結合することにした。

### `~` の絶対パスを取得

2 種類の方法を組み合わせる。

#### 環境変数 `$HOME`

多分、へんな環境じゃなければ環境変数 `$HOME` って定義されてるよね、ってことで。

```cs
var home = Environment.GetEnvironmentVariable("HOME")
```

`GetEnvironmentVariable()` は存在しない環境変数を取得しようとすると、`null` を返してくる。

#### GetFolderPath

```cs
var home = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
```

`Environment.GetFolderPath()` でシステム特殊フォルダのパスを取得できる。引数として `UserProfile` を指定すると `~` の絶対パスが取れた。

ちなみに、引数に `UserProfile` 以外、例えば `Personal` でも `~` の絶対パスが取れた。ここら辺はよくわからない... [[C#] MacOS における Environment.GetFolderPath(Environment.SpecialFolder)](../cs-environment-special_folder-of-mac/)に僕の環境で取れた値の一覧を載せてる。

あと、`Environment.SpecialFolder` のドキュメントには `UserProfile` について、

> The user's profile folder. Applications should not create files or folders at this level; they should put their data under the locations referred to by ApplicationData.

って書いてある。「`UserProfile` ディレクトリにフォルダは作らないほうがいい」とのこと。Windows 前提の解説だと思うけど、よくわからない。

### パスの結合

`Path.Combine` か `Path.GetFullPath` の第二引数を使えばいいと思う。

ここでは、「結合」って意味を込めて `Path.Combine` を採用した。

`Path.GetFullPath` を使うならこんな感じ。

```cs
var path = Path.GetFullPath("." + path[1..], home);
```
