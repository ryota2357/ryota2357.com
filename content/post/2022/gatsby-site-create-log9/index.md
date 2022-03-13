---
title: "9.細かい変更 (Gatsby-jsによるサイト構築記録)"
postdate: "2022-03-11T18:30"
tags: ["Gatsby"]
---

> このサイトを作るまでの記録。(時系列順)  
> 実際に作業を行なったメモに追記、編集して投稿してるので投稿日と作業日は一致しない。
>
> スターターを`gatsby new`したのは 2022 年の 3 月上旬。
> `gatsby`のバージョンは 4.9
>
> [一覧はここ](../gatsby-site-create-log0/)

大きく追加するものは多分もうない。  
ちまちま変更したものをログとして残す。  
siteMetadata とか、about ページの変更は残さない。随時変わるから。

## 見出しに id をふる

gatsby-remark-autolink-headers を追加する。

```bash
$ npm i gatsby-remark-autolink-headers
```

[公式 docs](https://www.gatsbyjs.com/plugins/gatsby-remark-autolink-headers/)に注意があるのでそれに気をつけて`gatsby-config.js`の plugin に追加する。

```jsx
...
          {
            resolve: `gatsby-remark-autolink-headers`,
            options: {
              elements: [`h2`, `h3`],
            }
          }
...
```

## 名称変更

開発の時は適当に名前をつけていたので変更。

```txt
game -> gamedev
Game -> GameDev
2357の日記 -> 2357.記録
```

## css

気になってはいたたんだけど、そこまで問題じゃなかったから放置してたやつ。  
`style/style.scss`にするか`style/markdown.scss`にするか悩んだけど、`style/style.scss`に追加した。

```scss
.markdown {
  ... li {
    line-height: 1.5;
  }
}
```

もう 1 つ`style/markdown.scss`  
h2 タグの`margin-top`を 3rem にした。

```scss
.markdown {
  h2 {
    margin-top: 3rem;
    border-bottom: solid 2.5px #E3E3E3;
  }
...
```

## Safari 対応

safari で確認してたら about ページのプロフィール画像が円形になってなかった。  
調べたら`z-index`なるものを追加すると治るらしい。  
一応`position: relative`も添えた。

```jsx
const About = ({ data, location }) => {
...
    return (
      <div style={{ display: 'flex', margin: '30px 0' }}>
        <div style={{ width: '13.5rem', height: '13.5rem' }}>
          <StaticImage src="../images/profile-pic.jpg" alt="profile-pic" style={{
              position: 'relative',
              zIndex: '1',
              width: '100%',
              height: 'auto',
              borderRadius: '50%',
          }}/>
        </div>
...
```

## gatsby-plugin-manifes

よくわからないけど[ここ](https://takumon.com/2018/10/08/)を参考にして設定した。

```jsx
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `ryota2357`,
        short_name: `ryota2357`,
        start_url: `/`,
        background_color: `#f6f5f5`,
        theme_color: `#f6f5f5`,
        display: `minimal-ui`,
        icon: `src/images/profile-pic.jpg`, // This path is relative to the root of the site.
      },
    },
```
