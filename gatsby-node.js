const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)

exports.createPages = async ({ graphql, actions, reporter }) => {
  const createBlogPostPage = (posts) => {
    posts?.forEach((post, index) => {
      actions.createPage({
        path: post.fields.slug,
        component: path.resolve(`./src/templates/blog-post.js`),
        context: {
          id: post.id,
          previousPostId: (index === 0 ? null : posts[index - 1].id),
          nextPostId: (index === posts.length - 1 ? null : posts[index + 1].id),
        },
      })
    })
  }

  const createTagPage = (tags) => {
    tags?.forEach(tag => {
      actions.createPage({
        path: `blog/tag/${tag}`,
        component: path.resolve(`./src/templates/tagPage.js`),
        context: {
          tag: tag
        }
      })
    })
  }

  const result = await graphql(`
    {
      allMarkdownRemark(
        sort: { fields: [frontmatter___postdate], order: ASC }
        limit: 1000
      ) {
        nodes {
          id
          fields {
            slug
          }
          frontmatter {
            tags
          }
        }
      }
    }
  `)

  if (result.errors) {
    reporter.panicOnBuild(`There was an error loading your blog posts`, result.errors)
    return
  }

  createBlogPostPage(result.data.allMarkdownRemark.nodes)

  // タグの一覧をsetに取得する
  const set = new Set()
  result.data.allMarkdownRemark.nodes?.forEach(node => {
    node.frontmatter.tags?.forEach(tag => set.add(tag))
  })
  createTagPage(set)
}

exports.onCreateNode = ({ node, actions, getNode }) => {
  if (node.internal.type === `MarkdownRemark`) {
    // ファイルパスからurlを生成
    // https://www.gatsbyjs.com/plugins/gatsby-source-filesystem/#createfilepath
    const value = createFilePath({ node, getNode })

    // nodeに
    // "fields": {
    //   "slug": `"${value}"
    // `}
    // を追加する。
    // https://www.gatsbyjs.com/docs/reference/config-files/actions/#createNodeField
    actions.createNodeField({
      node,
      name: `slug`,
      value: `/blog${value}`,
    })
  }
}

exports.createSchemaCustomization = ({ actions }) => {
  // siteMetadata {} オブジェクトを明示的に定義します。
  // こうすることで、gatsby-config.jsから削除されても、常に定義されるようになります。

  // Markdown のフロントマターも明示的に定義します。
  // この方法により、"content/blog" 内にブログ記事が格納されていない場合でも、
  // "MarkdownRemark" クエリはエラーを返すのではなく、`null` を返すようになります。
  actions.createTypes(`
    type SiteSiteMetadata {
      author: Author
      siteUrl: String
      social: Social
    }

    type Author {
      name: String
      summary: String
    }

    type Social {
      atcoder: String
      github: String
      twitter: String
      unityroom: String
    }

    type MarkdownRemark implements Node {
      frontmatter: Frontmatter
      fields: Fields
    }

    type Frontmatter {
      title: String
      description: String
      postdate: Date @dateformat
      update: Date @dateformat
      tags: [String]
    }

    type Fields {
      slug: String
    }
  `)
}