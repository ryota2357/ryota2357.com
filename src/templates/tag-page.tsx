import { graphql, PageProps, Link } from "gatsby";
import { Layout, Seo, BlogList } from "../components/mod";
import "../style/templates/tag-page.scss";

const TagPage = ({
  data,
  pageContext,
}: PageProps<Queries.TagPageQuery, { tag: string }>) => (
  <Layout id="tag-page">
    <Seo title={`Tag: ${pageContext.tag}`} />
    <h1>{pageContext.tag}</h1>
    <p>{data.allMarkdownRemark.totalCount}件</p>
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

export default TagPage;

export const query = graphql`
  query TagPage($tag: String!) {
    allMarkdownRemark(
      filter: { frontmatter: { tags: { eq: $tag } } }
      sort: { order: DESC, fields: frontmatter___postdate }
    ) {
      totalCount
      nodes {
        frontmatter {
          title
          postdate(formatString: "YYYY/MM/DD")
          tags
        }
        fields {
          slug
        }
      }
    }
  }
`;
