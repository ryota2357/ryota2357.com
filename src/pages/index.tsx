import { graphql, PageProps, Link } from "gatsby";
import { StaticImage } from "gatsby-plugin-image";
import { Layout, Seo, ContentBlock } from "@/components";
import "@/style/pages/index.scss";

const Index = ({ data }: PageProps<Queries.IndexPageQuery>) => (
  <Layout id="index-page">
    <div className="top-profile">
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
      <p className="name">ryota2357</p>
    </div>
    <div className="content-blocks">
      <ContentBlock title="Affiliation">
        <ul>
          {data.site?.siteMetadata.author.affiliation!.map((line, idx) => (
            <li key={idx}>{line}</li>
          ))}
        </ul>
      </ContentBlock>
      <ContentBlock title="Blog">
        <div className="align-horizontal">
          <h3>タグ</h3>
          <div className="item">
            {(() => {
              let cnt = new Map<string, number>();
              data.allMarkdownRemark.nodes.map((post) =>
                post.frontmatter.tags?.map(
                  (tag) => tag && cnt.set(tag, (cnt.get(tag) ?? 0) + 1)
                )
              );
              return [...cnt.entries()]
                .sort()
                .sort((a, b) => b[1] - a[1])
                .filter((a) => a[1] > 1)
                .map((tag, index) => {
                  const [tagName, count] = tag;
                  return (
                    <span style={{ padding: "0.3rem" }} key={index}>
                      <Link to={`/blog/tag/${tagName}`}>
                        {`${tagName}(${count})`}
                      </Link>
                    </span>
                  );
                })
                .concat(
                  <span style={{ padding: "0.3rem" }} key={1000}>
                    <Link to="/blog/tag/">一覧</Link>
                  </span>
                );
            })()}
          </div>
        </div>
        <div className="align-horizontal">
          <h3>更新</h3>
          <div className="item">
            <ul>
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
        <ul>
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
