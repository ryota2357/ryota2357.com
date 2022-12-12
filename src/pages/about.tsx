import { graphql, PageProps } from "gatsby";
import { Layout, Seo, ContentBlock } from "@/components";
import "@/style/pages/about.scss";

const About = ({ data }: PageProps<Queries.AboutPageQuery>) => (
  <Layout id="about-page">
    <h1>About</h1>
    <ContentBlock title="このサイトについて">
      <div>
        <p>
          React ベースの静的サイトジェネレータ
          <a href="https://www.gatsbyjs.com"> Gatsby.js </a>
          を用いて作成、
          <a href="https://pages.github.com/"> Github Pages </a>
          にてホスティングしています。
        </p>
        <p>
          このサイトの GitHub リポジトリは
          <a href={data.site?.siteMetadata.repository}>
            {` `}ryota2357/ryota2357-github-pages{` `}
          </a>
          に置いてあります。
        </p>
      </div>
    </ContentBlock>
    <ContentBlock title="問い合わせ/修正依頼">
      <div>
        <p>私の Twitter の DM にてご連絡ください。</p>
        <p>また、修正依頼については Github にて PR でも可能です。</p>
      </div>
    </ContentBlock>
  </Layout>
);

export const Head = () => <Seo title="About" type="website" image={["about"]} />;

export default About;

export const query = graphql`
  query AboutPage {
    site {
      siteMetadata {
        title
        repository
      }
    }
  }
`;
