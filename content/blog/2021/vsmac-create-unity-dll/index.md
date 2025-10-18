---
title: "VisualStudio for MacでUnity用のDLLを作成する"
postdate: "2021-01-31T08:25"
update: "2021-01-31T08:25"
tags: ["CSharp", "Unity", "VisualStudio"]
---

## 目標

- VisualStudio で UnityEngine 等の Unity 関連ライブラリを参照可能にする。
- DLL を作成し、Unity に読み込ませて利用可能にする。

## 作業

VisualStudio for Mac (バージョン 8.8.6) を使っています。

### プロジェクトの作成

**_スタートウィンドウ ＞ 新規 ＞ その他 ＞ .Net_**  
より「ライブラリ」というテンプレートがあるので、それを選択します。

プロジェクト名、ソリューション名は同じで OK です。

ディレクトリ構成は以下のようになっているかと思います。  
多少異なっていても問題ないです。

```txt
TestLibrary/
└ TestLibrary
    ├ 参照/
    │   └ System
    ├ パッケージ/
    ├ Properties/
    │   └ AssemblyInfo.cs
    └MyClass.cs
```

必要最小限のもの以外を削除しても構いません。  
削除したいものの上で「右クリック、削除」で削除できます。  
最小限のものだけにすると、以下のようになります。

```txt
TestLibrary/
└ TestLibrary
    ├ 参照/
    └ パッケージ/
```

### UnityEngine の参照を追加する

現在の状態で次のようにすると、エラーになります。

```cs
using UnityEngine;
```

なので、参照を追加します。

1. 「参照」ディレクトリの上で「右クリック、参照の追加...」を選択
1. 「.NET アセンブリ ＞ 参照...」
1. Finder にて「Shift + ⌘ ＋ G」
1. _/Applications/Unity/Unity.app/Contents/Managed_ と入力
1. 「UnityEngine.dll」を開く

無事に見つかって参照が追加できれば OK ですが、できなかった場合は次の方法で可能かと思われます。

1. UnityHub を開いて、右上の歯車マークから「一般 ＞ Unity エディタフォルダー」の場所を確認します。
1. VisualStudio「.NET アセンブリ ＞ 参照...」より 1 を参考に「Unity.app」を探します。
1. 「Shift + ⌘ ＋ G」を押して*hoge/Unity.app/Contents/Managed*と入力します。(hoge の部分は各自)
1. 「UnityEngine.dll」を開く

### コンパイラ設定

初期の設定では、DLL にすると XML コメントが表示されないので変更します。

```txt
TestLibrary/
└ TestLibrary ＜ー 右クリック、オプション
    ├ 参照/
    └ パッケージ/
```

オプション ＞ ビルド ＞ コンパイラ ＞ XML ドキュメントを生成する  
にチェックを入れます。  
他にも「オーバーフローチェック」や「最適化を有効」などのオプションがあるので必要に応じて有効にします。

### Unity で利用可能にする

1. ビルドします。「⌘ + K」または TestLibrary を右クリックで行います。
1. Finder からプロジェクトのディレクトリに移動します。
1. Unity のプロジェクトに「Plugins」フォルダを作成し、dll、pdb、xml を入れます。

```txt
TestLibrary/
├ bin/
│   └ Debug
│       ├ TestLibrary.dll
│       ├ TestLibrary.pdb
│       └ TestLibrary.xml
├ obj/
....
```

これで、Unity 側から自作の DLL を呼ぶことができます。  
以上で全ての目標を達成しました。

## 参考

- [Mac 版 Visual Studio で Unity 用の DLL を出力する方法](https://blog.ariari.biz/2018/03/17/post-72/)
- [Visual Studio ユーザーが Release ビルドをするときに必ずやってほしい 2 つの設定](https://qiita.com/lainzero/items/27681ddc96638e33758b)
