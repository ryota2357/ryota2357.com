import path from "node:path";
import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { allBlogCollection } from "@/content";

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
        link: new URL(path.join("/blog/", post.id), context.site).pathname,
      }))
      .sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf()),
  });
}
