module.exports = {
  siteMetadata: {
    title: `ryota2357`,
    author: {
      name: `ryota2357`,
      summary: `電気通信大学1年<br />
      Unity、C#、競プロなど。
      `,
    },
    description: `namespace ryota2357;`,
    siteUrl: `https://ryota2357.com`,
    repository: `ryota2357/ryota2357-github-pages`,
    social: {
      atcoder: `ryota2357`,
      github: `ryota2357`,
      twitter: `95s7k84695a`,
      unityroom: `ryota2357`,
    },
  },
  /*
  - gatsby-plugin-image (https://www.gatsbyjs.com/plugins/gatsby-plugin-image/)
      画像のレスポンシブ化。複数の画像サイズを自動生成してくれる

  - gatsby-source-filesystem (https://www.gatsbyjs.com/plugins/gatsby-source-filesystem/)
      ローカルファイルをGatsbyで使えるノードに変換してくれる。

  - gatsby-transformer-remark (https://www.gatsbyjs.com/plugins/gatsby-transformer-remark/)
      マークダウンパーサー。

      - gatsby-remark-images (https://www.gatsbyjs.com/plugins/gatsby-remark-images/)
          Markdown内での画像をいい感じに処理してくれる。レスポンシブ化とか

      - gatsby-remark-responsive-iframe (https://www.gatsbyjs.com/plugins/gatsby-remark-responsive-iframe/)
          iframeのサイズ調整してくれる

      - gatsby-remark-vscode (https://www.gatsbyjs.com/plugins/gatsby-remark-vscode/)
          コードのシンタックスハイライトするやつ

      - gatsby-remark-copy-linked-files (https://www.gatsbyjs.com/plugins/gatsby-remark-copy-linked-files/)
          Markdown内のローカルファイルをpublicに移動して、生成されたHTMLはそのpublicのファイルを指すようにしてくれる

      - gatsby-remark-autolink-headers (https://www.gatsbyjs.com/plugins/gatsby-remark-autolink-headers/)
          h2とかh3とかにidをつける

  - gatsby-transformer-sharp (https://www.gatsbyjs.com/plugins/gatsby-transformer-sharp/)
      ImageSharpでサポートされてる画像にサイズ調整、レスポンシブ対応とかしてくれる。
      あと、その画像のノードを作ってGraphQLで使えるようにも

  - gatsby-plugin-sharp (https://www.gatsbyjs.com/plugins/gatsby-plugin-sharp/)
      画像処理の低レイヤのプラグイン

  - gatsby-plugin-google-gtag (https://www.gatsbyjs.com/plugins/gatsby-plugin-google-gtag/)
      gtag

  - gatsby-plugin-feed (https://www.gatsbyjs.com/plugins/gatsby-plugin-feed/)
      RSS feed を作ってくれる

  - gatsby-plugin-react-helmet (https://www.gatsbyjs.com/plugins/gatsby-plugin-react-helmet/)
      Reactコンポーネントでドキュメントヘッダを編集できるようにしてくれるやつ
      src/components/seo.jsとかで使ってる。

  - gatsby-plugin-fontawesome-css (https://www.gatsbyjs.com/plugins/gatsby-plugin-fontawesome-css/)
      fontawesome使えるように

  - gatsby-plugin-sass (https://www.gatsbyjs.com/plugins/gatsby-plugin-sass/)
      scss使えるように

  - gatsby-plugin-manifest
      参考: https://takumon.com/2018/10/08/
  */
  plugins: [
    `gatsby-plugin-image`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/post`,
        name: `blog`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 630,
            },
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.0725rem`,
            },
          },
          {
            resolve: `gatsby-remark-vscode`,
            options: {
              theme: "Default Dark+",
              languageAliases: { txt: "ignore" },
              extensions: ["dart-code", "viml"],
            },
          },
          `gatsby-remark-copy-linked-files`,
          `gatsby-plugin-catch-links`,
          {
            resolve: `gatsby-remark-autolink-headers`,
            options: {
              elements: [`h2`, `h3`],
            },
          },
        ],
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: "gatsby-plugin-google-gtag",
      options: {
        trackingIds: ["G-PHXJBM615E"],
        pluginConfig: {
          head: true,
        },
      },
    },
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        query: `
          {
            site {
              siteMetadata {
                title
                description
                siteUrl
                site_url: siteUrl
              }
            }
          }
        `,
        feeds: [
          {
            serialize: ({ query: { site, allMarkdownRemark } }) => {
              return allMarkdownRemark.nodes.map(node => {
                return Object.assign({}, node.frontmatter, {
                  description: node.excerpt,
                  postdate: node.frontmatter.postdate,
                  url: site.siteMetadata.siteUrl + node.fields.slug,
                  guid: site.siteMetadata.siteUrl + node.fields.slug,
                  custom_elements: [{ "content:encoded": node.html }],
                })
              })
            },
            query: `
              {
                allMarkdownRemark(
                  sort: { order: DESC, fields: [frontmatter___postdate] },
                ) {
                  nodes {
                    excerpt
                    html
                    fields {
                      slug
                    }
                    frontmatter {
                      title
                      postdate
                    }
                  }
                }
              }
            `,
            output: "/rss.xml",
            title: "ryota2357 RSS Feed",
          },
        ],
      },
    },
    `gatsby-plugin-sitemap`,
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-fontawesome-css`,
    `gatsby-plugin-sass`,
    `gatsby-plugin-twitter`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `ryota2357`,
        short_name: `ryota2357`,
        start_url: `/`,
        background_color: `#f6f5f5`,
        theme_color: `#f6f5f5`,
        display: `minimal-ui`,
        icon: `src/images/profile-pic-circle.png`, // This path is relative to the root of the site.
      },
    },
  ],
}
