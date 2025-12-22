---
title: "1.セットアップ (Gatsby-jsによるサイト構築記録)"
postdate: "2022-03-09T16:30"
update: "2022-03-09T16:30"
tags: ["Gatsby.js"]
---

> このサイトを作るまでの記録。(時系列順)  
> 実際に作業を行なったメモに追記、編集して投稿してるので投稿日と作業日は一致しない。
>
> スターターを `gatsby new` したのは 2022 年の 3 月上旬。
> `gatsby` のバージョンは 4.9
>
> [一覧はここ](../gatsby-site-create-log0/)

環境構築はパス。

## VSCode

を使って作業する。

Gatsby Extension Pack と GatsbyHub っての入れとく。(GatsbyHub はいらないかもしれない)

- [Gatsby Extension Pack](https://marketplace.visualstudio.com/items?itemName=nickytonline.gatsby-extension-pack)
- [GatsbyHub](https://marketplace.visualstudio.com/items?itemName=GatsbyHub.gatsbyhub)

## スターター入れる

gatsby-starter-blog。

```bash
$ gatsby new [YOUR_BLOG_NAME] https://github.com/gatsbyjs/gatsby-starter-blog
```

## プロフィール画像の変更

`src/images/profile-pic.png` を自分の画像に変更する。

ファイル名はなんでも良いが、僕は `profile-pic.jpg` にした。(png のプロフィール画像持ってなかったから jpg)  
ファイル名を変えた場合は `src/components/bio.js` の 33 行目を変更する必要がある。

```jsx
<StaticImage
  className="bio-avatar"
  layout="fixed"
  formats={["auto", "webp", "avif"]}
  src="../images/profile-pic.jpg" // <- ここ
  width={50}
  height={50}
  quality={95}
  alt="Profile picture"
/>
```

## siteMetadata の編集

`gatsby-config.js` の social の欄に github と unityroom を追加しておいた。  
siteUrl は後ほど設定する。有効な(存在する?)URL じゃないと `gatsby develop` とかした時に怒られるので今はデフォルトのままに。

```jsx
// gatsby-config.js
module.exports = {
  siteMetadata: {
    title: `2357の日記`,
    author: {
      name: `ryota2357`,
      summary: `高校3年`,
    },
    description: `開発での学び、発見を残すところ`,
    siteUrl: `https://gatsbystarterblogsource.gatsbyjs.io/`,
    social: {
      twitter: `95s7k84695a`,
      github: `ryota2357`,
      unityroom: `ryota2357`,
    },
  },

  plugins: [
    ...
  ],
}
```

追加したのを反映するため `src/components/bio.js` を編集していく。

GraphQL クエリに github、unityroom を追加。  
あと、リンクを設置。

```jsx
// src/components/bio.js
...
const Bio = () => {
  const data = useStaticQuery(graphql`
    query BioQuery {
      site {
        siteMetadata {
          author {
            name
            summary
          }
          social {
            twitter
            github     <- 追加
            unityroom  <- 追加
          }
        }
      }
    }
  `)
...

  return (
    ...
          Written by <strong>{author.name}</strong> {author?.summary || null}

          // you should follow .. とか書いてあったけど削除
          // あとで色々デザイン変えるだろうし雑にTwitterのところと同じ感じで追加。
          // ↓
          {` `}
          <br />
          <a href={`https://twitter.com/${social?.twitter || ``}`}>Twitter</a>
          <br />
          <a href={`https://github.com/${social?.github || ``}`}>GitHub</a>
          <br />
          <a href={`https://unityroom.com/users/${social?.unityroom || ``}`}>UnityRoom</a>
          // ↑まで
        </p>
      )}
    </div>
  )
}

export default Bio
```

`gatsby-node.js` では siteMetadata オブジェクトを明示的に定義してある。  
siteMetadata オブジェクトにプロパティを追加したので、これらも明示的に定義しておく。なお、必須ではない模様。

```jsx
// gatsby-node.js
...
exports.createSchemaCustomization = ({ actions }) => {
...
   type Social {
      twitter: String

    }
...
```

## 日付を YYYY/MM/DD に

`index.js` の frontmatter 内 date(formatString: )を編集。

```jsx
...
export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
      nodes {
        excerpt
        fields {
          slug
        }
        frontmatter {
          date(formatString: "YYYY/MM/DD") ←ここ
          title
          description
        }
      }
    }
  }
`
```

## Seo コンポーネント

components/seo.js のところ、lang が en になってるので ja にする。

```jsx
...
Seo.defaultProps = {
  lang: `ja`,
  meta: [],
  description: ``,
}
...
```

## plugin 調べ

`gatsby-config.js`

入ってるプラグインが何をやってるかを調べてコメントしとく。

```jsx
/*
- gatsby-plugin-image (https://www.gatsbyjs.com/plugins/gatsby-plugin-image/)
    画像のレスポンシブ化。複数の画像サイズを自動生成してくれる

gatsby-source-filesystem (https://www.gatsbyjs.com/plugins/gatsby-source-filesystem/)
    ローカルファイルをGatsbyで使えるノードに変換してくれる。

- gatsby-transformer-remark (https://www.gatsbyjs.com/plugins/gatsby-transformer-remark/)
    マークダウンパーサー。

    - gatsby-remark-images (https://www.gatsbyjs.com/plugins/gatsby-remark-images/)
        Markdown内での画像をいい感じに処理してくれる。レスポンシブ化とか

    - gatsby-remark-responsive-iframe (https://www.gatsbyjs.com/plugins/gatsby-remark-responsive-iframe/)
        iframeのサイズ調整してくれる

    - gatsby-remark-prismjs (https://www.gatsbyjs.com/plugins/gatsby-remark-prismjs/)
        PrismJSってのでコードのシンタックスハイライトするやつ

    - gatsby-remark-copy-linked-files (https://www.gatsbyjs.com/plugins/gatsby-remark-copy-linked-files/)
        Markdown内のローカルファイルをpublicに移動して、生成されたHTMLはそのpublicのファイルを指すようにしてくれる

- gatsby-transformer-sharp (https://www.gatsbyjs.com/plugins/gatsby-transformer-sharp/)
    ImageSharpでサポートされてる画像にサイズ調整、レスポンシブ対応とかしてくれる。
    あと、その画像のノードを作ってGraphQLで使えるようにも

- gatsby-plugin-sharp (https://www.gatsbyjs.com/plugins/gatsby-plugin-sharp/)
    画像処理の低レイヤのプラグイン

- gatsby-plugin-feed (https://www.gatsbyjs.com/plugins/gatsby-plugin-feed/)
    RSS feed を作ってくれる

- gatsby-plugin-manifest
    参考: https://takumon.com/2018/10/08/

- gatsby-plugin-react-helmet (https://www.gatsbyjs.com/plugins/gatsby-plugin-react-helmet/)
    Reactコンポーネントでドキュメントヘッダを編集できるようにしてくれるやつ
    src/components/seo.jsとかで使ってる。
*/
```
