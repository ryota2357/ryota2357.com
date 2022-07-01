import { graphql, PageProps, Link } from "gatsby";
import { Layout, Seo } from "../components/mod";
import "../style/pages/blog.scss";

const Blog = ({ data }: PageProps<Queries.BlogPageQuery>) => (
  <Layout id="blog-page">
    <Seo title="Blog" />
    <h1>Blog</h1>
    <p>
      <Link to="/blog/tag">タグの一覧</Link>
    </p>
    <ul className="blog-list">
      {data.allMarkdownRemark.nodes.map((post) => (
        <li>
          <div className="item-date">{post.frontmatter.postdate}</div>
          <div className="item-title">
            <Link to={post.fields.slug}>{post.frontmatter.title}</Link>
          </div>
          <div className="item-tags">
            {post.frontmatter.tags?.map((tag) => (
              <Link to={`/blog/tag/${tag}`} className="item-tag">
                {tag}
              </Link>
            ))}
          </div>
        </li>
      ))}
    </ul>
  </Layout>
);

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
