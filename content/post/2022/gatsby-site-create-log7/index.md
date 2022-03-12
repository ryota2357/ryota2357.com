---
title: "7.Markdown内の相対パスによるリンクが上手くできない (Gatsby-jsによるサイト構築記録)"
postdate: "2022-03-10T09:35"
tags: ["Gatsby"]
---

> このサイトを作るまでの記録。(時系列順)  
> 実際に作業を行なったメモに追記、編集して投稿してるので投稿日と作業日は一致しない。
>
> スターターを`gatsby new`したのは2022年の3月上旬。
> `gatsby-cli`のバージョンは4.9.0
>
> [一覧はここ](../gatsby-site-create-log0/)

ここまで、この投稿は全てnotionにメモしてただけだでまとめてなかった。  
メモがたくさんになった。  
メモ→記事にしてたところ少し問題が発生したのでそれを解決した記録。

## 問題

例えば次のようにMarkdownファイルがあるとする

```txt
content/
  └ post/
    ├ 2021/ 
    └ 2022/
      ├ hoge
      │ └ index.md
      └ fuga
        └ index.md
```

fuga/index.mdにて

```md
hugaへの相対パスによる[リンク](../huga/index.md)
```

にするとただのファイルへのリンクになって素のマークダウンにリンクされる。

```md
hugaへの相対パスによる[リンク](../huga/)
```

にすると、毎回外部ページリンクのようにページ全体がリロードされる。

## 解決

プラグインを入れると解決する。

```sh
$ npm i gatsby-plugin-catch-links
```

```js
plugins: [
  {
    resolve: `gatsby-transformer-remark`,
    options: {
      plugins: [
        ...
        `gatsby-plugin-catch-links`
      ]
...
```

### 参考

[雑記ブログ：内部リンクをリロードさせない](https://blog.qrac.jp/posts/add-gatsby-plugin-catch-links-not-reload/)

## GIFはみ出る

本題から逸れるけど、上記の問題が解決してレスポンシブ確認してたらGIF画像がはみ出る問題があった。  
GIFはgatsbyの方がいい感じの処理はしてくれず、ただimgで配置するだけになってるみたい。

`src/style/markdown.scss`に

```scss
.markdown {
  ...
  img {
    max-width: 100%;
  }
  ...
}
```

と追加した。
