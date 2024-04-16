import type { APIContext } from "astro";
import rss from "@astrojs/rss";
import { allBlogCollection } from "@/content";
import path from "node:path";

export function GET(context: APIContext) {
  if (!context.site) {
    throw new Error("You need to set `site` in astro.config");
  }
  return rss({
    title: "ryota2357.com",
    description: "ryota2357's homepage and blog",
    site: context.site,
    items: allBlogCollection
      .map((post) => ({
        title: post.data.title,
        pubDate: post.data.postdate,
        link: new URL(path.join("/blog/", post.slug), context.site).pathname,
      }))
      .sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf()),
  });
}
