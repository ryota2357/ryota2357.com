import { Link } from "gatsby";
import "@/style/components/blogList.scss";

type Post = {
  title: string;
  date: string;
  tags: readonly string[] | null;
  slug: string;
};

type BlogListProp = {
  data: Post[];
};

const BlogList = ({ data }: BlogListProp) => (
  <div className="blog-list">
    <ul className="py-0 px-2 bg-white border border-solid rounded-md border-gray-600">
      {data.map((post) => (
        <li className="py-2 px-0" key={post.slug}>
          <div className="text-gray-500">{post.date}</div>
          <div className="text-[1.2rem] font-bold">
            <Link to={post.slug}>{post.title}</Link>
          </div>
          <div className="flex flex-row justify-end gap-2 text-[0.8rem]">
            {post.tags?.map((tag, index) => (
              <Link
                to={`/blog/tag/${tag}`}
                className="py-1 px-3 rounded text-white bg-gray-900"
                key={index}
              >
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
