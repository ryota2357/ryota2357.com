import { graphql, PageProps, Link } from "gatsby";
import { Layout, Seo, BlogList } from "../components/mod";
import "../style/pages/blog.scss";

const Blog = ({ data }: PageProps<Queries.BlogPageQuery>) => (
  <Layout id="blog-page">
    <h1>Blog</h1>
    <p>
      <Link to="/blog/tag">タグの一覧</Link>
    </p>
    <BlogList
      data={data.allMarkdownRemark.nodes.map((post) => {
        return {
          title: post.frontmatter.title ?? "No title",
          date: post.frontmatter.postdate ?? "No date",
          tags: post.frontmatter.tags,
          slug: post.fields.slug,
        };
      })}
    />
  </Layout>
);

export const Head = () => <Seo title="Blog" type="website" />

export default Blog;

export const query = graphql`
  query BlogPage {
    allMarkdownRemark(sort: { order: DESC, fields: frontmatter___postdate }) {
      nodes {
        frontmatter {
          title
          postdate(formatString: "YYYY/MM/DD")
          update(formatString: "YYYY/MM/DD")
          tags
        }
        fields {
          slug
        }
      }
    }
  }
`;
