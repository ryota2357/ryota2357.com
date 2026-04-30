import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
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

const projectsCollection = defineCollection({
  loader: file("./content/projects/data.yaml"),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      url: z.url(),
      github: z.string().optional(),
      lang: z.string(),
      status: z.enum(["active", "maintained", "wip", "done", "archived"]),
      image: image().optional(),
      created: z.coerce.date(),
      update: z.coerce.date(),
    }),
});

export const collections = {
  blog: blogCollection,
  projects: projectsCollection,
};
