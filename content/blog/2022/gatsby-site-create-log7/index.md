---
title: "7.Markdown内の相対パスによるリンクが上手くできない (Gatsby-jsによるサイト構築記録)"
postdate: "2022-03-10T09:35"
update: "2022-03-10T09:35"
tags: ["Gatsby.js"]
---

> このサイトを作るまでの記録。(時系列順)  
> 実際に作業を行なったメモに追記、編集して投稿してるので投稿日と作業日は一致しない。
>
> スターターを `gatsby new` したのは 2022 年の 3 月上旬。
> `gatsby` のバージョンは 4.9
>
> [一覧はここ](../gatsby-site-create-log0/)

ここまで、この投稿は全て notion にメモしてただけでまとめてなかった。  
メモがたくさんになった。  
メモ → 記事にしてたところ少し問題が発生したのでそれを解決した記録。

## 問題

例えば次のように Markdown ファイルがあるとする。

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

fuga/index.md にて、

```md
huga への相対パスによる[リンク](../huga/index.md)
```

にするとただのファイルへのリンクになって素のマークダウンにリンクされる。

```md
huga への相対パスによる[リンク](../huga/)
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

## GIF はみ出る

<!-- textlint-disable  ja-technical-writing/no-doubled-joshi -->

本題から逸れるけど、上記の問題が解決してレスポンシブ確認してたら GIF 画像がはみ出る問題があった。  
GIF は gatsby の方がいい感じの処理はしてくれず、ただ img で配置するだけになってるみたい。

<!-- textlint-enable  ja-technical-writing/no-doubled-joshi -->

`src/style/markdown.scss` に次を追加した。

```scss
.markdown {
  ...
  img {
    max-width: 100%;
  }
  ...
}
```
