import { defineCollection, z } from "astro:content";

const blogCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    postdate: z.coerce.date(),
    update: z.coerce.date(),
    tags: z.array(z.string()),
    draft: z.boolean().optional().default(false),
  }),
});

const worksCollection = defineCollection({
  type: "data",
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      data: z.array(
        z.object({
          title: z.string(),
          description: z.string(),
          url: z.string().url(),
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
