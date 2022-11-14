import type { GatsbyNode } from "gatsby";
import { resolve } from "path";
import { createFilePath } from "gatsby-source-filesystem";

export const createPages: GatsbyNode["createPages"] = async ({
  graphql,
  actions,
  reporter,
}) => {
  const createBlogPostPage = (query: Queries.CreatePagesQuery) => {
    const posts = query.allMarkdownRemark.nodes;
    posts.forEach((post, index) => {
      actions.createPage({
        path: post.fields.slug,
        component: resolve(`./src/templates/blog-post.tsx`),
        context: {
          id: post.id,
          previousPostId: index === 0 ? null : posts[index - 1].id,
          nextPostId: index === posts.length - 1 ? null : posts[index + 1].id,
        },
      });
    });
  };

  const createTagPage = (tags: Set<string>) => {
    tags.forEach((tag) => {
      actions.createPage({
        path: `blog/tag/${tag}`,
        component: resolve(`./src/templates/tag-page.tsx`),
        context: {
          tag: tag,
        },
      });
    });
  };

  const result = await graphql(`query CreatePages {
  allMarkdownRemark(sort: {frontmatter: {postdate: ASC}}, limit: 1000) {
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
}`);
  if (result.errors) {
    reporter.panicOnBuild(
      `There was an error loading your blog posts`,
      result.errors
    );
    return;
  }
  const data = result.data as Queries.CreatePagesQuery;

  createBlogPostPage(data);

  const set = new Set<string>();
  data.allMarkdownRemark.nodes.forEach((node) => {
    node.frontmatter?.tags?.forEach((tag) => (tag ? set.add(tag) : 0));
  });
  createTagPage(set);
};

export const onCreateNode: GatsbyNode["onCreateNode"] = ({
  node,
  actions,
  getNode,
}) => {
  if (node.internal.type === "MarkdownRemark") {
    // ファイルパスからurlを生成
    // https://www.gatsbyjs.com/plugins/gatsby-source-filesystem/#createfilepath
    const value = createFilePath({ node, getNode });

    // nodeに
    // "fields": {
    //   "slug": `"/blog${value}"
    // `}
    // を追加する。
    // https://www.gatsbyjs.com/docs/reference/config-files/actions/#createNodeField
    actions.createNodeField({
      node,
      name: `slug`,
      value: `/blog${value}`,
    });
  }
};

export const createSchemaCustomization: GatsbyNode["createSchemaCustomization"] =
  ({ actions }) => {
    // siteMetadata {} オブジェクトを明示的に定義します。
    // こうすることで、gatsby-config.jsから削除されても、常に定義されるようになります。

    // Markdown のフロントマターも明示的に定義します。
    // この方法により、"content/blog" 内にブログ記事が格納されていない場合でも、
    // "MarkdownRemark" クエリはエラーを返すのではなく、`null` を返すようになります。
    actions.createTypes(`
    type Site {
      siteMetadata: SiteMetadata!
    }

    type SiteMetadata {
      title: String!
      author: Author!
      description: String!
      siteUrl: String
      social: Social!
      repository: String!
    }

    type Author {
      name: String!
      summary: String!
    }

    type Social {
      atcoder: String!
      github: String!
      twitter: String!
      unityroom: String!
    }

    type MarkdownRemark implements Node {
      frontmatter: Frontmatter!
      fields: Fields!
    }

    type Frontmatter {
      title: String
      description: String
      postdate: Date @dateformat
      update: Date @dateformat
      tags: [String!]
    }

    type Fields {
      slug: String!
    }
  `);
  };
