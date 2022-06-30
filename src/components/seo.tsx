import { Helmet } from "react-helmet";
import { useStaticQuery, graphql } from "gatsby";

type SeoProp = {
  description?: string;
  lang?: string;
  meta?: any[];
  title: string;
};

const Seo = ({ description = "", lang = "ja", meta = [], title }: SeoProp) => {
  const { site } = useStaticQuery<Queries.SeoComponentQuery>(graphql`
    query SeoComponent {
      site {
        siteMetadata {
          title
          description
          social {
            twitter
            github
            unityroom
          }
        }
      }
    }
  `);

  const metaDescription = description || site?.siteMetadata.description;
  const defaultTitle = site?.siteMetadata.title;

  return (
    <Helmet
      htmlAttributes={{
        lang,
      }}
      title={title}
      titleTemplate={defaultTitle ? `%s | ${defaultTitle}` : undefined}
      meta={[
        {
          name: `description`,
          content: metaDescription,
        },
        {
          property: `og:title`,
          content: title,
        },
        {
          property: `og:description`,
          content: metaDescription,
        },
        {
          property: `og:type`,
          content: `website`,
        },
        {
          name: `twitter:card`,
          content: `summary`,
        },
        {
          name: `twitter:creator`,
          content: site?.siteMetadata.social.twitter || ``,
        },
        {
          name: `twitter:title`,
          content: title,
        },
        {
          name: `twitter:description`,
          content: metaDescription,
        },
      ].concat(meta)}
    />
  );
};

export default Seo;
