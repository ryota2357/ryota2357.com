import { graphql, PageProps, Link } from "gatsby";
import { Layout, Seo } from "@/components";

const Tag = ({ data }: PageProps<Queries.TagPageQuery>) => {
  return (
    <Layout>
      <h1 className="text-[2.5rem]">Tag</h1>
      <ul className="list-inside list-disc mt-8">
        {(() => {
          const cnt = new Map<string, number>();
          data.allMarkdownRemark.nodes.map((post) =>
            post.frontmatter.tags?.map(
              (tag) => tag && cnt.set(tag, (cnt.get(tag) ?? 0) + 1)
            )
          );
          return [...cnt.entries()]
            .sort()
            .sort((a, b) => b[1] - a[1])
            .map((tag, index) => (
              <li key={index}>
                <Link to={`/blog/tag/${tag[0]}`}>{`${tag[0]}(${tag[1]})`}</Link>
              </li>
            ));
        })()}
      </ul>
    </Layout>
  );
};

export const Head = () => (
  <Seo title="Blog" type="website" image={["blog", "tag"]} noindex={true} />
);

export default Tag;

export const query = graphql`
  query TagPage {
    allMarkdownRemark {
      nodes {
        frontmatter {
          tags
        }
      }
    }
  }
`;
