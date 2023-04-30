import { graphql, PageProps, Link } from "gatsby";
import { StaticImage } from "gatsby-plugin-image";
import { Layout, Seo, ContentBlock } from "@/components";

const Index = ({ data }: PageProps<Queries.IndexPageQuery>) => (
  <Layout>
    <div className="flex flex-col items-center gap-2">
      <StaticImage
        src="../images/profile-pic.png"
        alt="profile-pic"
        style={{
          position: "relative",
          zIndex: "1",
          width: "200px",
          height: "200px",
          borderRadius: "50%",
        }}
      />
      <p className="font-bold text-[1.6rem]">ryota2357</p>
    </div>
    <div className="flex flex-col gap-8 mt-8">
      <ContentBlock title="Affiliation">
        <ul className="list-inside list-disc [&>li]:py-0.5 [&>li]:px-0">
          {data.site?.siteMetadata.author.affiliation!.map((line, idx) => (
            <li key={idx}>{line}</li>
          ))}
        </ul>
      </ContentBlock>
      <ContentBlock title="Blog">
        <div className="flex flex-row items-start gap-4">
          <h3 className="flex-none m-0 text-[1.3rem] font-bold">タグ</h3>
          <div className="flex flex-wrap my-auto mx-0">
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
                .filter((a) => a[1] > 1)
                .map((tag) => {
                  const [tagName, count] = tag;
                  return (
                    <span className="p-[0.3rem]" key={tagName}>
                      <Link to={`/blog/tag/${tagName}`}>
                        {`${tagName}(${count})`}
                      </Link>
                    </span>
                  );
                })
                .concat(
                  <span className="p-[0.3rem]" key={"一覧"}>
                    <Link to="/blog/tag/">一覧</Link>
                  </span>
                );
            })()}
          </div>
        </div>
        <div className="flex flex-row items-start gap-4">
          <h3 className="flex-none m-0 text-[1.3rem] font-bold">更新</h3>
          <div className="flex flex-wrap my-auto mx-0">
            <ul className="list-inside list-disc [&>li]:py-0.5 [&>li]:px-0">
              {data.allMarkdownRemark.nodes.slice(0, 7).map((post, index) => (
                <li key={index}>
                  <Link to={post.fields.slug}>{post.frontmatter.title}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </ContentBlock>
      <ContentBlock title="Links">
        <ul className="list-inside list-disc [&>li]:py-0.5 [&>li]:px-0">
          <li>
            <a href={data.site?.siteMetadata.social.twitter.url}>
              Twitter ({data.site?.siteMetadata.social.twitter.name})
            </a>
          </li>
          <li>
            <a href={data.site?.siteMetadata.social.github.url}>
              Github ({data.site?.siteMetadata.social.github.name})
            </a>
          </li>
          <li>
            <a href={data.site?.siteMetadata.social.atcoder.url}>
              AtCoder ({data.site?.siteMetadata.social.atcoder.name})
            </a>
          </li>
          <li>
            <a href={data.site?.siteMetadata.social.unityroom.url}>
              UnityRoom ({data.site?.siteMetadata.social.unityroom.name})
            </a>
          </li>
        </ul>
      </ContentBlock>
    </div>
  </Layout>
);

export const Head = () => <Seo title="Home" type="website" image="default" />;

export default Index;

export const query = graphql`
  query IndexPage {
    site {
      siteMetadata {
        title
        author {
          affiliation
        }
        social {
          atcoder {
            url
            name
          }
          github {
            url
            name
          }
          twitter {
            url
            name
          }
          unityroom {
            url
            name
          }
        }
      }
    }
    allMarkdownRemark(sort: { frontmatter: { update: DESC } }) {
      nodes {
        frontmatter {
          title
          tags
        }
        fields {
          slug
        }
      }
    }
  }
`;
