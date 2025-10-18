---
title: "[C#] MacOSにおける Environment.GetFolderPath(Environment.SpecialFolder)"
postdate: "2022-08-08T20:05"
update: "2022-08-08T20:05"
tags: ["CSharp"]
---

[Environment.GetFolderPath Method](https://docs.microsoft.com/en-us/dotnet/api/system.environment.getfolderpath?view=net-6.0)というメソッドがある。

> Gets the path to the system special folder that is identified by the specified enumeration.

> 指定された列挙型で識別されるシステム特殊フォルダのパスを取得する。(DeepL)

このメソッドの引数は[Environment.SpecialFolder Enum](https://docs.microsoft.com/en-us/dotnet/api/system.environment.specialfolder?view=net-6.0)である。

「こいつら、MacOS だとどうなるのだろうか？」ってことで調べた(全部実行してみた)のでその結果。

## 環境

「実行したらこうなったよ」なので**環境依存の可能性大**。ドキュメントとしてどこかに書いてあるのだろうか？

- MacOS 12.5
- MacBook Pro (14 インチ、2021)
- チップ: Apple M1 Pro
- .Net: 6.0.302 (`dotnet --version`)

## 結果

以下のようなスクリプトを実行した結果。  
オプションに `DoNotVerify` を設定しているので、すでに存在するかどうかは考慮してない。

```cs
Console.WriteLine(Environment.GetFolderPath(Environment.SpecialFolder.Cookies, Environment.SpecialFolderOption.DoNotVerify));
```

出力に `$HOME` って書いてるけど、実際はそれも展開されて出力されてる。「ー」は空行が出力されたもの。

| SpecialFolder          | 出力                    |
| :--------------------- | :---------------------- |
| Cookies                | ー                      |
| Desktop                | $HOME/Desktop           |
| Favorites              | $HOME/Library/Favorites |
| Fonts                  | $HOME/Library/Fonts     |
| History                | ー                      |
| Personal               | $HOME                   |
| Programs               | ー                      |
| Recent                 | ー                      |
| Resources              | ー                      |
| Startup                | ー                      |
| System                 | /System                 |
| Templates              | $HOME/Templates         |
| Windows                | ー                      |
| AdminTools             | ー                      |
| ApplicationData        | $HOME/.config           |
| CommonDocuments        | ー                      |
| CommonMusic            | ー                      |
| CommonPictures         | ー                      |
| CommonPrograms         | ー                      |
| CommonStartup          | ー                      |
| CommonTemplates        | /usr/share/templates    |
| CommonVideos           | ー                      |
| DesktopDirectory       | $HOME/Desktop           |
| InternetCache          | $HOME/Library/Caches    |
| LocalizedResources     | ー                      |
| MyComputer             | ー                      |
| MyDocuments            | $HOME                   |
| MyMusic                | $HOME/Music             |
| MyPictures             | $HOME/Pictures          |
| MyVideos               | $HOME/Videos            |
| NetworkShortcuts       | ー                      |
| PrinterShortcuts       | ー                      |
| ProgramFiles           | /Applications           |
| SendTo                 | ー                      |
| StartMenu              | ー                      |
| SystemX86              | ー                      |
| UserProfile            | $HOME                   |
| CDBurning              | ー                      |
| CommonAdminTools       | ー                      |
| CommonApplicationData  | /usr/share              |
| CommonDesktopDirectory | ー                      |
| CommonOemLinks         | ー                      |
| CommonProgramFiles     | ー                      |
| CommonStartMenu        | ー                      |
| LocalApplicationData   | $HOME/.local/share      |
| ProgramFilesX86        | ー                      |
| CommonProgramFilesX86  | ー                      |
