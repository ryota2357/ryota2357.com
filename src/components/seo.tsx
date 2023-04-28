import { useStaticQuery, graphql } from "gatsby";

type SeoProp = {
  title: string;
  type: "website" | "article";
  image: string[] | "default"; // TODO: defaultなくす
  description?: string;
  noindex?: boolean;
};

const Seo = ({
  title,
  type,
  image,
  description = undefined,
  noindex = false,
}: SeoProp) => {
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
    if (image === "default") {
      return "https://raw.githubusercontent.com/ryota2357/ryota2357-github-pages/main/src/images/profile-pic.jpg";
    }
    // "path" をインポートできない(エラー出る)ので
    return repo + image.join("/") + ".png";
  })();

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={metaDescription} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={metaImage} />
      <meta property="twitter:card" content="summary_large_image" />
      <meta
        property="twitter:creator"
        content={site?.siteMetadata.social.twitter.name || ``}
      />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={metaDescription} />
      {noindex ? <meta property="robots" content="noindex" /> : <></>}
    </>
  );
};

export default Seo;
