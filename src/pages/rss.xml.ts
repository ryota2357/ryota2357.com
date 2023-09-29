import { APIContext } from "astro"
import rss from "@astrojs/rss"
import { allBlogCollection } from "@/content"
import path from "path"

export function GET(context: APIContext) {
  return rss({
    title: "ryota2357.com",
    description: "ryota2357's homepage and blog",
    site: context.site,
    items: allBlogCollection.map((post) => ({
      title: post.data.title,
      pubDate: post.data.postdate,
      link: new URL(path.join("/blog/", post.slug), context.site).pathname,
    })).sort((a, b) => b.pubDate - a.pubDate),
  })
}
