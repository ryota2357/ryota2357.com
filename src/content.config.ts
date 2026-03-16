import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blogCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./content/blog" }),
  schema: z.object({
    title: z.string(),
    postdate: z.coerce.date(),
    update: z.coerce.date(),
    tags: z.array(z.string()),
    draft: z.boolean().optional().default(false),
    vrt: z.boolean().optional().default(false),
  }),
});

const worksCollection = defineCollection({
  loader: glob({ pattern: "**/index.yaml", base: "./content/works" }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      data: z.array(
        z.object({
          title: z.string(),
          description: z.string(),
          url: z.url(),
          image: image(),
          created: z.coerce.date(),
          update: z.coerce.date(),
        }),
      ),
    }),
});

export const collections = {
  blog: blogCollection,
  works: worksCollection,
};
