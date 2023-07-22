import type { GatsbyNode } from "gatsby";
import * as Path from "path";
import { createFilePath } from "gatsby-source-filesystem";
import { TsconfigPathsPlugin } from "tsconfig-paths-webpack-plugin";

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
        component: Path.resolve("./src/templates/blog-post.tsx"),
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
        path: Path.join("/", "blog", "tag", tag),
        component: Path.resolve("./src/templates/tag-page.tsx"),
        context: {
          tag,
        },
      });
    });
  };

  const createYearPage = (year: number) => {
    const begin = `${year}-01-01T00:00`;
    const end = `${year + 1}-01-01T00:00`;
    actions.createPage({
      path: Path.join("/", "blog", year.toString()),
      component: Path.resolve("./src/templates/year-page.tsx"),
      context: {
        begin,
        end,
      },
    });
  };

  const result = await graphql(`
    query CreatePages {
      allMarkdownRemark(sort: { frontmatter: { postdate: ASC } }, limit: 1000) {
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
  `);
  if (result.errors) {
    reporter.panicOnBuild(
      "There was an error loading your blog posts",
      result.errors,
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

  createYearPage(2021);
  createYearPage(2022);
  createYearPage(2023);
};

export const onCreateNode: GatsbyNode["onCreateNode"] = ({
  node,
  actions,
  getNode,
}) => {
  if (node.internal.type === "MarkdownRemark") {
    // node (MarkdownRemark)に
    // "fields": {
    //   "slug": `"/blog/~~"
    // `}
    // を追加する。
    actions.createNodeField({
      node,
      name: "slug",
      value: Path.join("/", "blog", createFilePath({ node, getNode })),
    });
  }
};

export const onCreateWebpackConfig: GatsbyNode["onCreateWebpackConfig"] = ({
  actions,
}) => {
  actions.setWebpackConfig({
    resolve: {
      plugins: [new TsconfigPathsPlugin()],
    },
  });
};

export const createSchemaCustomization: GatsbyNode["createSchemaCustomization"] =
  ({ actions }) => {
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
      affiliation : [String!]
    }

    type Social {
      atcoder: SocialData!
      github: SocialData!
      twitter: SocialData!
      unityroom: SocialData!
    }

    type SocialData {
      url: String!
      name: String!
    }

    type WorksDataYaml implements Node {
      name: String!
      data: [WorksDataYamlData!]!
    }

    type WorksDataYamlData {
      title: String!,
      description: String!,
      url: String!
      created: Date! @dateformat
      update: Date! @dateformat
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
