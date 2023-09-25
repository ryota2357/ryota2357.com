import { getCollection, type CollectionEntry } from "astro:content";

export const allBlogCollection = await getCollection("blog", ({ data }) =>
  import.meta.env.PROD ? data.draft !== true : true,
);
export const allWorksCollection = await getCollection("works");

export const allBlogTagList = (() => {
  const tagMap = allBlogCollection
    .flatMap((post) => post.data.tags)
    .reduce(
      (map, tag) => map.set(tag, (map.get(tag) ?? 0) + 1),
      new Map<string, number>(),
    );
  return [...tagMap].map(([name, count]) => ({ name, count }));
})();

export const util = {
  getYearFromSlug: (slug: CollectionEntry<"blog">["slug"]) => {
    const { year } = valitateBlogSlug(slug);
    return year;
  },
  stripYearFromSlug: (slug: CollectionEntry<"blog">["slug"]) => {
    const { slug: slugBody } = valitateBlogSlug(slug);
    return slugBody;
  },
};

type Year = `${number}${number}${number}${number}`;

function valitateBlogSlug(str: string) {
  const match = str.match(/^(\d{4})\/(.+)$/);
  if (!match) {
    throw new Error(`Invalid slug: ${str}`);
  }
  const [, year, slug] = match as [string, Year, string];
  if (slug.includes("/")) {
    throw new Error(`Invalid slug: ${str}, slug body cannot contain "/"`);
  }
  return { year, slug };
}
