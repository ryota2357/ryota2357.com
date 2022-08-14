import { graphql, PageProps, Link } from "gatsby";
import { StaticImage } from "gatsby-plugin-image";
import { Layout, Seo, ContentBlock } from "../components/mod";
import "../style/pages/index.scss";

const Index = ({ data }: PageProps<Queries.IndexPageQuery>) => (
  <Layout id="index-page">
    <Seo title="Home" />
    <div className="top-profile">
      <StaticImage
        src="../images/profile-pic.jpg"
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
          <li key={1}>電気通信大学 情報理工学域 1年</li>
          <li key={2}>電気通信大学MMA(サークル)</li>
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
                .map((tag, index) => (
                  <span style={{ padding: "0.2rem" }} key={index}>
                    <Link to={`/blog/tag/${tag[0]}`}>
                      {`${tag[0]}(${tag[1]})`}
                    </Link>
                  </span>
                ));
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
            <a href="https://twitter.com/95s7k84695a">Twitter (@95s7k84695a)</a>
          </li>
          <li>
            <a href="https://github.com/ryota2357">Github (ryota2357)</a>
          </li>
          <li>
            <a href="https://atcoder.jp/users/ryota2357">AtCoder (ryota2357)</a>
          </li>
          <li>
            <a href="https://unityroom.com/users/ryota2357">
              UnityRoom (ryota2357)
            </a>
          </li>
        </ul>
      </ContentBlock>
    </div>
  </Layout>
);

export default Index;

export const query = graphql`
  query IndexPage {
    site {
      siteMetadata {
        title
        description
      }
    }
    allMarkdownRemark(sort: { order: DESC, fields: frontmatter___update }) {
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
