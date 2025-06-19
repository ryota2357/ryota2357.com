import path from "node:path";
import type { APIContext } from "astro";
import { allBlogCollection, allBlogTagList, util } from "@/content";

const xmlHead = [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1" xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
].join("");

const xmlTail = "</urlset>";

type SitemapItem = {
  url: URL;
  lastmod?: Date;
  changefreq?:
    | "daily"
    | "monthly"
    | "always"
    | "hourly"
    | "weekly"
    | "yearly"
    | "never";
  priority?: number;
};

export function GET(context: APIContext) {
  const site = context.site?.origin; // Astro.site is not defined here.

  const blogPost: SitemapItem[] = allBlogCollection.map((post) => ({
    url: new URL(path.join("/blog/", post.id, "/"), site),
    lastmod: post.data.update,
    priority: 0.7,
  }));

  const blogTag: SitemapItem[] = allBlogTagList.map((tag) => ({
    url: new URL(path.join("/blog/tag/", tag.name, "/"), site),
    priority: 0.3,
  }));

  const blogYear: SitemapItem[] = allBlogCollection
    .map((post) => util.getYearFromSlug(post.id))
    .filter((year, index, self) => self.indexOf(year) === index)
    .map((year) => ({
      url: new URL(path.join("/blog/", year, "/"), site),
      priority: 0.3,
    }));

  const xmlString = `${xmlHead}\n${blogPost
    .concat(...blogTag)
    .concat(...blogYear)
    .map((item) =>
      [
        "<url>",
        `<loc>${item.url.toString()}</loc>`,
        item.lastmod
          ? `<lastmod>${item.lastmod.toISOString()}</lastmod>`
          : undefined,
        item.changefreq
          ? `<changefreq>${item.changefreq}</changefreq>`
          : undefined,
        item.priority ? `<priority>${item.priority}</priority>` : undefined,
        "</url>",
      ].filter((x) => x !== undefined),
    )
    .map((taggedItems) => taggedItems.join(""))
    .join("\n")}\n${xmlTail}`;

  return new Response(xmlString, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
