---
title: "VSCodeでテーマを設定→拡張機能へ"
postdate: "2021-02-22T23:53"
update: "2021-02-22T23:53"
tags: ["VSCode"]
---

エディタはやはりカスタマイズしたいもの。  
VSCode は非常に豊富なカスタマイズが可能です。

まずは簡単にテーマを変更する方法を、そして簡単な拡張機能として利用可能にできる様にします。

## テーマのオーバーライド

現在使っているテーマをオーバーライドする方法です。  
SyntaxHighlight をオーバーライドするには現在のテーマの設定を読まないとできないかもです。

### はじめに

全ては[ここ](https://code.visualstudio.com/api/references/theme-color)に書いてあります。(英語です)

### スタート

`setting.json` を開いて以下を追記します。  
この中にオーバーライドする要素を追加、設定していきます。

```json
"workbench.colorCustomizations": {
}
```

### お試し

わかりやすいところを変えてみます。  
`setting.json` に以下を追記します。

```json
"workbench.colorCustomizations": {
  "activityBar.background": "#00AA00"
}
```

以下の様に緑色になります。

![VSCode_sample](./screenshot_VSCodeActivityBar_change.jpeg)

### 色々やる

[Theme Color](https://code.visualstudio.com/api/references/theme-color)から設定したいものを探して、プロパティを書いていけば OK です。  
色の設定は `#RGB`、`#RGBA`、`#RRGGBB`、`#RRGGBBAA` から指定できます。  
(プロパティによっては透明度が指定できないものもあります。)  
また、大文字小文字どちらでも OK です。

参考までに以下に僕の設定を載せておきます。

<details>
  <summary>開く</summary>

```json
"editor.background": "#1C1C1C",
"editor.foreground": "#FFFFD7",
"editor.lineHighlightBackground" : "#00105B",
"editorLineNumber.foreground" : "#949494",
"editorLineNumber.activeForeground" : "#FFFFFF",
"editor.inactiveSelectionBackground": "#3A3D41",
"editorIndentGuide.background": "#404040",
"editorIndentGuide.activeBackground": "#707070",
"editor.selectionHighlightBackground": "#ADD6FF26",

"list.dropBackground": "#383B3D",

"activityBar.background": "#000000",
"activityBar.foreground" : "#FFFFFF",
"activityBarBadge.background": "#007ACC",

"sideBar.background" : "#0F0F0F",
"sideBar.foreground" : "#FFFFF0",
"sideBarTitle.foreground": "#BBBBBB",
"sideBarSectionHeader.background": "#0000",
"sideBarSectionHeader.border": "#ccc3",

"input.placeholderForeground": "#A6A6A6",

"settings.textInputBackground": "#292929",
"settings.numberInputBackground": "#292929",

"menu.background": "#252526",
"menu.foreground": "#CCCCCC",

"statusBar.background" : "#878787",
"statusBar.foreground" : "#EEEEEE",
"statusBar.noFolderBackground" : "#878787",
"statusBar.noFolderForeground" : "#EEEEEE",
"statusBar.debuggingBackground": "#878787",
"statusBar.debuggingForeground" : "#EEEEEE",
"statusBarItem.remoteBackground" : "#878787",
"statusBarItem.remoteForeground" : "#EEEEEE",

"titleBar.activeBackground" : "#000000",
"titleBar.activeForeground" : "#FFFFFF",

"tab.activeBackground" : "#0F0F0F",
"tab.activeBorderTop": "#B7D590",

"notificationCenterHeader.foreground" : "#FFFFFF",
"notificationCenterHeader.background" : "#64646480",
```

</details>

## 拡張機能(?)にする

こんな感じにします。

![My-Theme](./screenshot_VSCodeMyTheme.jpeg)

### 基本ファイルを作成

以下のようなディレクトリを作成します。  
package.json 以外、名前は自由です。

```txt
My-theme/
  ├ package.json
  └ themes
    └ my-theme.json
```

次に package.json の内容を以下の様にします。
ディレクトリ名は各自のものに置き換えてください。

```json
{
  "name": "MyTheme-vscode",
  "version": "0.1.0",
  "publisher": "YOUR NAME",
  "engines": { "vscode": "*" },
  "contributes": {
    "themes": [
      {
        "label": "MyTheme-vscode",
        "uiTheme": "vs-dark",
        "path": "./themes/my-theme.json"
      }
    ]
  }
}
```

### テーマのテンプレート

現在使っているテーマプラグイン(ない場合は適当なもの)の GIthub リポジトリにアクセスしてテーマファイルの内容をコピーしてきます。

![VisualStudio2019Dark](./screenshot_VSCodeCs.jpeg)

僕は[Microsoft の C#拡張](https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.csharp)の[このファイル](https://github.com/OmniSharp/omnisharp-vscode/blob/master/themes/vs2019_dark.json)をコピペしました。

### 拡張機能の読み込み

作成したテーマプラグインのレンプレートを VSCode に読み込ませます。
VSCode の拡張機能は `.vscode/extensions` に格納されているのでシンボリックリンクを貼ります。

```sh
ln -s YOUR_PATH/My-theme ~/.vscode/extensions
```

VSCode を再起動すれば拡張機能のところに表示されるはずです。

**ここの段階で配色テーマを変更しておきましょう。**

### テーマの作成

作ってきます。  
コピペしてきたテンプレートをいじります。`color` プロパティには `workbench.colorCustomizations` で指定していたものを追記(重複した場合は置き換え)します。  
また、`tokenColors` には SyntaxHighlight が記述されています。これについて簡単に説明すると、

```json
...省略
    "tokenColors": [
        {
            "name": "~~~~~~~",    // 自由。なくてもよい
            "scope": [    // ハイライトの対象
                "~~~~~~",
                "~~~~~~~.~~~~~"
            ],
            "settings": {    // ハイライト設定
                "foreground": "#RRGGBB"
            }
        },
続く....
```

こんな感じになってます。
`settings` の `foreground` を `#FF0000` とかの目立つ色にして、どこが変わったか見て、編集していくのが良いのかなと思いました。
また、このテーマファイルの変更の反映は以下の様に「ウィンドウの再読み込み」が必要です。

![reloadVSCode](./screenshot_reloadSVCode.jpeg)

## 最後に

もっと簡単な方法があると思いますが自分はこれでやってます。  
VisualStudio みたいにテーマを UI で作成して自動でテーマコード作成してくれるツールないのかなぁ。

参考までに僕の `my-theme.json` を置いておきます。

<details>
  <summary>my-theme.json</summary>

```json
{
  "$schema": "vscode://schemas/color-theme",
  "name": "my-theme",
  "type": "dark",
  "colors": {
    "editor.background": "#1C1C1C",
    "editor.foreground": "#FFFFD7",
    "editor.lineHighlightBackground": "#00105B",
    "editorLineNumber.foreground": "#949494",
    "editorLineNumber.activeForeground": "#FFFFFF",
    "editor.inactiveSelectionBackground": "#3A3D41",
    "editorIndentGuide.background": "#404040",
    "editorIndentGuide.activeBackground": "#707070",
    "editor.selectionHighlightBackground": "#ADD6FF26",

    "list.dropBackground": "#383B3D",

    "activityBar.background": "#000000",
    "activityBar.foreground": "#FFFFFF",
    "activityBarBadge.background": "#007ACC",

    "sideBar.background": "#0F0F0F",
    "sideBar.foreground": "#FFFFF0",
    "sideBarTitle.foreground": "#BBBBBB",
    "sideBarSectionHeader.background": "#0000",
    "sideBarSectionHeader.border": "#ccc3",

    "input.placeholderForeground": "#A6A6A6",

    "settings.textInputBackground": "#292929",
    "settings.numberInputBackground": "#292929",

    "menu.background": "#252526",
    "menu.foreground": "#CCCCCC",

    "statusBar.background": "#878787",
    "statusBar.foreground": "#EEEEEE",
    "statusBar.noFolderBackground": "#878787",
    "statusBar.noFolderForeground": "#EEEEEE",
    "statusBar.debuggingBackground": "#878787",
    "statusBar.debuggingForeground": "#EEEEEE",
    "statusBarItem.remoteBackground": "#878787",
    "statusBarItem.remoteForeground": "#EEEEEE",

    "titleBar.activeBackground": "#000000",
    "titleBar.activeForeground": "#FFFFFF",

    "tab.activeBackground": "#0F0F0F",
    "tab.activeBorderTop": "#B7D590",

    "notificationCenterHeader.foreground": "#FFFFFF",
    "notificationCenterHeader.background": "#64646480"
  },
  "semanticHighlighting": true,
  "tokenColors": [
    {
      "scope": ["meta.embedded", "source.groovy.embedded"],
      "settings": {
        "foreground": "#D4D4D4"
      }
    },
    {
      "scope": "emphasis",
      "settings": {
        "fontStyle": "italic"
      }
    },
    {
      "scope": "strong",
      "settings": {
        "fontStyle": "bold"
      }
    },
    {
      "scope": "header",
      "settings": {
        "foreground": "#000080"
      }
    },
    {
      "scope": "comment",
      "settings": {
        "foreground": "#878787"
      }
    },
    {
      "scope": "constant.language",
      "settings": {
        "foreground": "#569cd6"
      }
    },
    {
      "scope": [
        "constant.numeric",
        "entity.name.operator.custom-literal.number",
        "variable.other.enummember",
        "keyword.operator.plus.exponent",
        "keyword.operator.minus.exponent"
      ],
      "settings": {
        "foreground": "#73F574"
      }
    },
    {
      "scope": "constant.regexp",
      "settings": {
        "foreground": "#646695"
      }
    },
    {
      "scope": "entity.name.tag",
      "settings": {
        "foreground": "#569cd6"
      }
    },
    {
      "scope": "entity.name.tag.css",
      "settings": {
        "foreground": "#d7ba7d"
      }
    },
    {
      "scope": "entity.other.attribute-name",
      "settings": {
        "foreground": "#9cdcfe"
      }
    },
    {
      "scope": [
        "entity.other.attribute-name.class.css",
        "entity.other.attribute-name.class.mixin.css",
        "entity.other.attribute-name.id.css",
        "entity.other.attribute-name.parent-selector.css",
        "entity.other.attribute-name.pseudo-class.css",
        "entity.other.attribute-name.pseudo-element.css",
        "source.css.less entity.other.attribute-name.id",
        "entity.other.attribute-name.attribute.scss",
        "entity.other.attribute-name.scss"
      ],
      "settings": {
        "foreground": "#d7ba7d"
      }
    },
    {
      "scope": "invalid",
      "settings": {
        "foreground": "#f44747"
      }
    },
    {
      "scope": "markup.underline",
      "settings": {
        "fontStyle": "underline"
      }
    },
    {
      "scope": "markup.bold",
      "settings": {
        "fontStyle": "bold",
        "foreground": "#569cd6"
      }
    },
    {
      "scope": "markup.heading",
      "settings": {
        "fontStyle": "bold",
        "foreground": "#569cd6"
      }
    },
    {
      "scope": "markup.italic",
      "settings": {
        "fontStyle": "italic"
      }
    },
    {
      "scope": "markup.inserted",
      "settings": {
        "foreground": "#b5cea8"
      }
    },
    {
      "scope": "markup.deleted",
      "settings": {
        "foreground": "#ce9178"
      }
    },
    {
      "scope": "markup.changed",
      "settings": {
        "foreground": "#569cd6"
      }
    },
    {
      "scope": "punctuation.definition.quote.begin.markdown",
      "settings": {
        "foreground": "#6A9955"
      }
    },
    {
      "scope": "punctuation.definition.list.begin.markdown",
      "settings": {
        "foreground": "#6796e6"
      }
    },
    {
      "scope": "markup.inline.raw",
      "settings": {
        "foreground": "#ce9178"
      }
    },
    {
      "name": "brackets of XML/HTML tags",
      "scope": "punctuation.definition.tag",
      "settings": {
        "foreground": "#878787"
      }
    },
    {
      "scope": ["meta.preprocessor", "entity.name.function.preprocessor"],
      "settings": {
        "foreground": "#569cd6"
      }
    },
    {
      "scope": "meta.preprocessor.string",
      "settings": {
        "foreground": "#ce9178"
      }
    },
    {
      "scope": "meta.preprocessor.numeric",
      "settings": {
        "foreground": "#b5cea8"
      }
    },
    {
      "scope": "meta.structure.dictionary.key.python",
      "settings": {
        "foreground": "#9cdcfe"
      }
    },
    {
      "scope": "meta.diff.header",
      "settings": {
        "foreground": "#569cd6"
      }
    },
    {
      "scope": "storage",
      "settings": {
        "foreground": "#569cd6"
      }
    },
    {
      "scope": "storage.type",
      "settings": {
        "foreground": "#569cd6"
      }
    },
    {
      "scope": ["storage.modifier", "keyword.operator.noexcept"],
      "settings": {
        "foreground": "#569cd6"
      }
    },
    {
      "scope": [
        "string",
        "entity.name.operator.custom-literal.string",
        "meta.embedded.assembly"
      ],
      "settings": {
        "foreground": "#F08C34"
      }
    },
    {
      "scope": "string.tag",
      "settings": {
        "foreground": "#F08C34"
      }
    },
    {
      "scope": "string.value",
      "settings": {
        "foreground": "#F08C34"
      }
    },
    {
      "scope": "string.regexp",
      "settings": {
        "foreground": "#d16969"
      }
    },
    {
      "name": "String interpolation",
      "scope": [
        "punctuation.definition.template-expression.begin",
        "punctuation.definition.template-expression.end",
        "punctuation.section.embedded"
      ],
      "settings": {
        "foreground": "#569cd6"
      }
    },
    {
      "name": "Reset JavaScript string interpolation expression",
      "scope": ["meta.template.expression"],
      "settings": {
        "foreground": "#d4d4d4"
      }
    },
    {
      "scope": [
        "support.type.vendored.property-name",
        "support.type.property-name",
        "variable.css",
        "variable.scss",
        "variable.other.less",
        "source.coffee.embedded"
      ],
      "settings": {
        "foreground": "#9cdcfe"
      }
    },
    {
      "scope": "keyword",
      "settings": {
        "foreground": "#3f7bfd"
      }
    },
    {
      "scope": "keyword.control",
      "settings": {
        "foreground": "#4BAEF8"
      }
    },
    {
      "scope": "keyword.operator",
      "settings": {
        "foreground": "#FFFFD7"
      }
    },
    {
      "scope": [
        "keyword.operator.new",
        "keyword.operator.expression",
        "keyword.operator.cast",
        "keyword.operator.sizeof",
        "keyword.operator.alignof",
        "keyword.operator.typeid",
        "keyword.operator.alignas",
        "keyword.operator.instanceof",
        "keyword.operator.logical.python",
        "keyword.operator.wordlike"
      ],
      "settings": {
        "foreground": "#4BAEF8"
      }
    },
    {
      "scope": "keyword.other.unit",
      "settings": {
        "foreground": "#b5cea8"
      }
    },
    {
      "scope": [
        "punctuation.section.embedded.begin.php",
        "punctuation.section.embedded.end.php"
      ],
      "settings": {
        "foreground": "#4BAEF8"
      }
    },
    {
      "scope": "support.function.git-rebase",
      "settings": {
        "foreground": "#9cdcfe"
      }
    },
    {
      "scope": "constant.sha.git-rebase",
      "settings": {
        "foreground": "#b5cea8"
      }
    },
    {
      "name": "coloring of the Java import and package identifiers",
      "scope": [
        "storage.modifier.import.java",
        "variable.language.wildcard.java",
        "storage.modifier.package.java"
      ],
      "settings": {
        "foreground": "#d4d4d4"
      }
    },
    {
      "name": "this.self",
      "scope": "variable.language",
      "settings": {
        "foreground": "#4BAEF8"
      }
    },
    {
      "name": "Function declarations",
      "scope": [
        "entity.name.function",
        "support.function",
        "support.constant.handlebars",
        "source.powershell variable.other.member",
        "entity.name.operator.custom-literal"
      ],
      "settings": {
        "foreground": "#FFFFD7"
      }
    },
    {
      "name": "Define Class ans import Namespace",
      "scope": [
        "support.class",
        "support.type",
        "meta.return-type",
        "entity.name.type",
        "entity.name.namespace",
        "entity.other.attribute",
        "entity.name.scope-resolution",
        "entity.name.class"
      ],
      "settings": {
        "foreground": "#FFFFD7"
      }
    },
    {
      "name": "extended or decare class",
      "scope": [
        "storage.type.cs",
        "storage.type.generic.cs",
        "storage.type.modifier.cs",
        "storage.type.variable.cs"
      ],
      "settings": {
        "foreground": "#FAD749"
      }
    },
    {
      "name": "Types declaration and references",
      "scope": [
        "storage.type.numeric.go",
        "storage.type.byte.go",
        "storage.type.boolean.go",
        "storage.type.string.go",
        "storage.type.uintptr.go",
        "storage.type.error.go",
        "storage.type.rune.go",
        "storage.type.annotation.java",
        "storage.type.generic.java",
        "storage.type.java",
        "storage.type.object.array.java",
        "storage.type.primitive.array.java",
        "storage.type.primitive.java",
        "storage.type.token.java",
        "storage.type.groovy",
        "storage.type.annotation.groovy",
        "storage.type.parameters.groovy",
        "storage.type.generic.groovy",
        "storage.type.object.array.groovy",
        "storage.type.primitive.array.groovy",
        "storage.type.primitive.groovy"
      ],
      "settings": {
        "foreground": "#4BAEF8"
      }
    },
    {
      "name": "Types declaration and references, TS grammar specific",
      "scope": [
        "meta.type.cast.expr",
        "meta.type.new.expr",
        "support.constant.math",
        "support.constant.dom",
        "support.constant.json",
        "entity.other.inherited-class"
      ],
      "settings": {
        "foreground": "#4EC9B0"
      }
    },
    {
      "name": "Control flow / Special keywords",
      "scope": [
        "keyword.control",
        "source.cpp keyword.operator.new",
        "keyword.operator.delete",
        "keyword.other.using",
        "keyword.other.operator",
        "entity.name.operator"
      ],
      "settings": {
        "foreground": "#F090F9"
      }
    },
    {
      "name": "Variable name",
      "scope": ["variable", "support.variable"],
      "settings": {
        "foreground": "#9CDCFE"
      }
    },
    {
      "name": "Parameter name",
      "scope": ["meta.definition.variable.name", "entity.name.variable"],
      "settings": {
        "foreground": "#FFFFD7"
      }
    },
    {
      "name": "Constants and enums",
      "scope": ["variable.other.constant", "variable.other.enummember"],
      "settings": {
        "foreground": "#51B6C4"
      }
    },
    {
      "name": "Object keys, TS grammar specific",
      "scope": ["meta.object-literal.key"],
      "settings": {
        "foreground": "#9CDCFE"
      }
    },
    {
      "name": "CSS property value",
      "scope": [
        "support.constant.property-value",
        "support.constant.font-name",
        "support.constant.media-type",
        "support.constant.media",
        "constant.other.color.rgb-value",
        "constant.other.rgb-value",
        "support.constant.color"
      ],
      "settings": {
        "foreground": "#CE9178"
      }
    },
    {
      "name": "Regular expression groups",
      "scope": [
        "punctuation.definition.group.regexp",
        "punctuation.definition.group.assertion.regexp",
        "punctuation.definition.character-class.regexp",
        "punctuation.character.set.begin.regexp",
        "punctuation.character.set.end.regexp",
        "keyword.operator.negation.regexp",
        "support.other.parenthesis.regexp"
      ],
      "settings": {
        "foreground": "#CE9178"
      }
    },
    {
      "scope": [
        "constant.character.character-class.regexp",
        "constant.other.character-class.set.regexp",
        "constant.other.character-class.regexp",
        "constant.character.set.regexp"
      ],
      "settings": {
        "foreground": "#d16969"
      }
    },
    {
      "scope": ["keyword.operator.or.regexp", "keyword.control.anchor.regexp"],
      "settings": {
        "foreground": "#DCDCAA"
      }
    },
    {
      "scope": "keyword.operator.quantifier.regexp",
      "settings": {
        "foreground": "#d7ba7d"
      }
    },
    {
      "scope": "constant.character",
      "settings": {
        "foreground": "#569cd6"
      }
    },
    {
      "scope": "constant.character.escape",
      "settings": {
        "foreground": "#d7ba7d"
      }
    },
    {
      "scope": "entity.name.label",
      "settings": {
        "foreground": "#C8C8C8"
      }
    },
    {
      "name": "Excluded Code",
      "scope": "support.other.excluded",
      "settings": {
        "foreground": "#808080"
      }
    },
    {
      "name": "Preprocessor Keyword",
      "scope": "keyword.preprocessor",
      "settings": {
        "foreground": "#808080"
      }
    },
    {
      "name": "Punctuation",
      "scope": "punctuation",
      "settings": {
        "foreground": "#D4D4D4"
      }
    },
    {
      "scope": "punctuation.definition.comment",
      "settings": {
        "foreground": "#878787"
      }
    },
    {
      "scope": "punctuation.definition.string",
      "settings": {
        "foreground": "#ce9178"
      }
    },
    {
      "name": "Namespace",
      "scope": "entity.name.namespace",
      "settings": {
        "foreground": "#D4D4D4"
      }
    },
    {
      "name": "Field",
      "scope": "entity.name.variable.field",
      "settings": {
        "foreground": "#FFFFD7"
      }
    },
    {
      "name": "Property",
      "scope": "variable.other.property",
      "settings": {
        "foreground": "#D4D4D4"
      }
    },
    {
      "name": "Constant",
      "scope": "variable.other.constant",
      "settings": {
        "foreground": "#D4D4D4"
      }
    },
    {
      "name": "Enum Member",
      "scope": "variable.other.enummember",
      "settings": {
        "foreground": "#D4D4D4"
      }
    },
    {
      "name": "Interface",
      "scope": "entity.name.type.interface",
      "settings": {
        "foreground": "#FFFFD7"
      }
    },
    {
      "name": "Enum",
      "scope": "entity.name.type.enum",
      "settings": {
        "foreground": "#b8d7a3"
      }
    },
    {
      "name": "Paramter",
      "scope": "entity.name.type.parameter",
      "settings": {
        "foreground": "#b8d7a3"
      }
    },
    {
      "name": "Struct",
      "scope": "entity.name.type.struct",
      "settings": {
        "foreground": "#86C691"
      }
    },
    {
      "name": "Extension Method",
      "scope": "entity.name.function.extension",
      "settings": {
        "foreground": "#DCDCAA"
      }
    },
    {
      "name": "Xml Documentation Comment",
      "scope": "comment.documentation",
      "settings": {
        "foreground": "#608B4E"
      }
    },
    {
      "name": "Xml Documentation Comment Attribute",
      "scope": "comment.documentation.attribute",
      "settings": {
        "foreground": "#C8C8C8"
      }
    },
    {
      "name": "Xml Documentation Comment CDATA",
      "scope": "comment.documentation.cdata",
      "settings": {
        "foreground": "#E9D585"
      }
    },
    {
      "name": "Xml Documentation Comment Delimiter",
      "scope": "comment.documentation.delimiter",
      "settings": {
        "foreground": "#808080"
      }
    },
    {
      "name": "Xml Documentation Comment Name",
      "scope": "comment.documentation.name",
      "settings": {
        "foreground": "#878787"
      }
    }
  ]
}
```

</details>
