import type { GatsbyConfig } from "gatsby";
import { join } from "path";

const config: GatsbyConfig = {
  siteMetadata: {
    title: "ryota2357",
    author: {
      name: "ryota2357",
      affiliation: [
        "電気通信大学 情報理工学域I類 1年",
        "電気通信大学MMA(サークル)",
      ],
    },
    description: "namespace ryota2357;",
    siteUrl: "https://ryota2357.com",
    repository: "https://github.com/ryota2357/ryota2357.com",
    social: {
      atcoder: {
        url: "https://atcoder.jp/users/ryota2357",
        name: "ryota2357",
      },
      github: {
        url: "https://github.com/ryota2357",
        name: "ryota2357",
      },
      twitter: {
        url: "https://twitter.com/95s7k84695a",
        name: "@95s7k84695a",
      },
      unityroom: {
        url: "https://unityroom.com/users/ryota2357",
        name: "ryota2357",
      },
    },
  },
  graphqlTypegen: {
    typesOutputPath: "./src/types/gatsby-types.d.ts",
  },
  jsxRuntime: "automatic",
  /*{{{ 説明
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

  - gatsby-plugin-robots-txt (https://www.gatsbyjs.com/plugins/gatsby-plugin-robots-txt/)
      robots.txt を作ってくれる

  - gatsby-plugin-sass (https://www.gatsbyjs.com/plugins/gatsby-plugin-sass/)
      scss使えるように

  - gatsby-plugin-manifest
      参考: https://takumon.com/2018/10/08/
  }}}*/
  plugins: [
    `gatsby-plugin-image`,
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `blog`,
        path: join(__dirname, "content", "post"),
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: join(__dirname, "src", "images"),
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: join(__dirname, "content", "works", "images"),
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: join(__dirname, "content", "works", "data"),
      },
    },
    {
      resolve: `gatsby-transformer-yaml`,
      options: {
        typeName: `WorksDataYaml`,
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 760,
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
              extensions: ["dart-code", "viml", "toml", "latex-workshop"],
            },
          },
          `gatsby-remark-copy-linked-files`,
          `gatsby-plugin-catch-links`,
          {
            resolve: `gatsby-remark-autolink-headers`,
            options: {
              icon: `<svg aria-hidden="true" version="1.1" viewBox="0 0 16 16" height="16" width="16" style="vertical-align:baseline; fill: #57606a;"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg>`,
              elements: [`h2`, `h3`],
            },
          },
        ],
      },
    },
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
            serialize: ({ query: { site, allMarkdownRemark } }: any) => {
              return allMarkdownRemark.nodes.map((node: any) => {
                return Object.assign({}, node.frontmatter, {
                  description: node.excerpt,
                  date: node.frontmatter.postdate,
                  url: site.siteMetadata.siteUrl + node.fields.slug,
                  guid: site.siteMetadata.siteUrl + node.fields.slug,
                  custom_elements: [{ "content:encoded": node.html }],
                });
              });
            },
            query: `{
              allMarkdownRemark(sort: {frontmatter: {postdate: DESC}}) {
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
            }`,
            output: "/rss.xml",
            title: "ryota2357 RSS Feed",
          },
        ],
      },
    },
    `gatsby-plugin-sitemap`,
    `gatsby-plugin-robots-txt`,
    `gatsby-plugin-sass`,
    `gatsby-plugin-postcss`,
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
};

export default config;
