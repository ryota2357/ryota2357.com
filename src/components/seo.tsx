import { useStaticQuery, graphql } from "gatsby";

type SeoProp = {
  title: string;
  type: "website" | "article"
  description?: string;
};

const Seo = ({ title, type, description = undefined }: SeoProp) => {
  const { site } = useStaticQuery<Queries.SeoComponentQuery>(graphql`
    query SeoComponent {
      site {
        siteMetadata {
          title
          description
          social {
            twitter
          }
        }
      }
    }
  `);

  const metaDescription = description ?? site?.siteMetadata.description;

  return (
    <>
      <meta charSet="utf-8" />
      <title>{title}</title>
      <meta name="description" content={metaDescription} />
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content={type}/>
      <meta property="twitter:card" content="summary" />
      <meta property="twitter:creator" content={site?.siteMetadata.social.twitter || ``} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={metaDescription} />
    </>
  );
};

export default Seo;
