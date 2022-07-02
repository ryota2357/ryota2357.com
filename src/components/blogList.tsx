import { Link } from "gatsby";
import "../style/components/blogList.scss";

type Post = {
  readonly title: string;
  readonly date: string;
  readonly tags: readonly string[] | null;
  readonly slug: string;
};

type BlogListProp = {
  readonly data: Post[];
};

const BlogList = ({ data }: BlogListProp) => (
  <div className="blog-list">
    <ul>
      {data.map((post) => (
        <li key={post.slug}>
          <div className="item-date">{post.date}</div>
          <div className="item-title">
            <Link to={post.slug}>{post.title}</Link>
          </div>
          <div className="item-tags">
            {post.tags?.map((tag, index) => (
              <Link to={`/blog/tag/${tag}`} className="item-tag" key={index}>
                {tag}
              </Link>
            ))}
          </div>
        </li>
      ))}
    </ul>
  </div>
);

export default BlogList;
