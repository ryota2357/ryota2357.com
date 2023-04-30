import { graphql, PageProps } from "gatsby";
import { Layout, Seo, BlogList } from "@/components";

const YearPage = ({
  data,
  pageContext,
}: PageProps<Queries.YearPageTemplateQuery, { begin: string }>) => (
  <Layout id="tag-page-template">
    <h1 className="text-[2.5rem]">Blog in {pageContext.begin.slice(0, 4)}</h1>
    <p>{data.allMarkdownRemark.totalCount}件</p>
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
}: PageProps<Queries.TagPageTemplateQuery, { begin: string }>) => {
  const year = pageContext.begin.slice(0, 4);

  return (
    <Seo
      title={`Blog in ${year}`}
      type="website"
      image="default"
      noindex={true}
    />
  );
};

export default YearPage;

export const query = graphql`
  query YearPageTemplate($begin: Date!, $end: Date!) {
    allMarkdownRemark(
      filter: { frontmatter: { postdate: { gte: $begin, lt: $end } } }
      sort: { frontmatter: { postdate: DESC } }
    ) {
      totalCount
      nodes {
        frontmatter {
          title
          tags
          postdate(formatString: "YYYY/MM/DD")
        }
        fields {
          slug
        }
      }
    }
  }
`;
