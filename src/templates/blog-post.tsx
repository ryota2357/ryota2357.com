import { Link, graphql, PageProps } from "gatsby";
import dayjs from "dayjs";
import { Layout, Seo } from "../components/mod";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTags } from "@fortawesome/free-solid-svg-icons";
import "../style/templates/blog-post.scss";

const BlogPostTemplate = ({ data }: PageProps<Queries.BlogPostQuery>) => {
  const post = {
    postdate: data.markdownRemark?.frontmatter.postdate,
    update: data.markdownRemark?.frontmatter.update,
    title: data.markdownRemark?.frontmatter.title ?? "No title",
    tags: data.markdownRemark?.frontmatter.tags ?? [],
    description: data.markdownRemark?.excerpt ?? "",
  };

  const timeFmt = (time: string | null | undefined) =>
    time ? dayjs(new Date(time)).format("YYYY/MM/DD (HH:mm)") : "";

  return (
    <Layout id="blog-post">
      <Seo title={post.title} description={post.description} />
      <article itemScope itemType="http://schema.org/Article">
        <div className="post-front">
          <h1 itemProp="headline">{post.title}</h1>
          <div className="date">
            <p>
              投稿日:{" "}
              <time itemProp="datePublished">{timeFmt(post.postdate)}</time>
            </p>
            {post.update !== post.postdate && (
              <p>
                更新日:{" "}
                <time itemProp="dateModified">{timeFmt(post.update)}</time>
              </p>
            )}
          </div>
          <div>
            <FontAwesomeIcon
              icon={faTags as any}
              style={{ color: "#2E2E2E", marginRight: "5px" }}
            />
            {post.tags.map((tag, i) => {
              if (i < post.tags.length - 1) tag += ",";
              return <Link to={`/blog/tag/${tag}`}> {tag} </Link>;
            })}
          </div>
        </div>
        <div
          className="markdown"
          itemProp="articleBody"
          dangerouslySetInnerHTML={{ __html: data.markdownRemark?.html! }}
        />
      </article>
      <nav>
        <ul>
          <li>
            {data.previous && (
              <Link to={data.previous.fields.slug} rel="prev">
                ← {data.previous.frontmatter.title}
              </Link>
            )}
          </li>
          <li>
            {data.next && (
              <Link to={data.next.fields.slug} rel="next">
                {data.next.frontmatter.title} →
              </Link>
            )}
          </li>
        </ul>
      </nav>
    </Layout>
  );
};

export default BlogPostTemplate;

export const query = graphql`
  query BlogPost($id: String!, $previousPostId: String, $nextPostId: String) {
    markdownRemark(id: { eq: $id }) {
      id
      excerpt(pruneLength: 160)
      html
      frontmatter {
        title
        description
        postdate(formatString: "yyyy-MM-DDTHH:mm:ss")
        update(formatString: "yyyy-MM-DDTHH:mm:ss")
        tags
      }
    }
    previous: markdownRemark(id: { eq: $previousPostId }) {
      fields {
        slug
      }
      frontmatter {
        title
      }
    }
    next: markdownRemark(id: { eq: $nextPostId }) {
      fields {
        slug
      }
      frontmatter {
        title
      }
    }
  }
`;
