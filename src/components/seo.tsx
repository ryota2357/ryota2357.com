import { useStaticQuery, graphql } from "gatsby";

type SeoProp = {
  title: string;
  type: "website" | "article";
  image: string[] | "default"; // TODO: defaultなくす
  description?: string;
};

const Seo = ({ title, type, image, description = undefined }: SeoProp) => {
  const { site } = useStaticQuery<Queries.SeoComponentQuery>(graphql`
    query SeoComponent {
      site {
        siteMetadata {
          title
          description
          social {
            twitter {
              name
            }
          }
        }
      }
    }
  `);

  const metaDescription = description ?? site?.siteMetadata.description;
  const metaImage = (() => {
    const repo =
      "https://raw.githubusercontent.com/ryota2357/ryota2357-github-pages-images/og-image/";
    if (image == "default") {
      return "https://raw.githubusercontent.com/ryota2357/ryota2357-github-pages/main/src/images/profile-pic.jpg";
    }
    // "path" をインポートできない(エラー出る)ので
    return repo + image.join("/") + ".png";
  })();

  return (
    <>
      <meta charSet="utf-8" />
      <title>{title}</title>
      <meta name="description" content={metaDescription} />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, shrink-to-fit=no"
      />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={metaImage} />
      <meta property="twitter:card" content="summary" />
      <meta
        property="twitter:creator"
        content={site?.siteMetadata.social.twitter.name || ``}
      />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={metaDescription} />
    </>
  );
};

export default Seo;
