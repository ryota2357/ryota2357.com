import { graphql, PageProps, Link } from "gatsby";
import { Layout, Seo, BlogList } from "@/components";
import "@/style/templates/tag-page.scss";

const TagPage = ({
  data,
  pageContext,
}: PageProps<Queries.TagPageTemplateQuery, { tag: string }>) => (
  <Layout id="tag-page-template">
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

export const Head = ({
  pageContext,
}: PageProps<Queries.TagPageTemplateQuery, { tag: string }>) => (
  <Seo
    title={`Tag: ${pageContext.tag}`}
    type="website"
    image="default"
    noindex={true}
  />
);

export default TagPage;

export const query = graphql`
  query TagPageTemplate($tag: String!) {
    allMarkdownRemark(
      filter: { frontmatter: { tags: { eq: $tag } } }
      sort: { frontmatter: { postdate: DESC } }
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
