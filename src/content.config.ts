import { defineCollection } from "astro:content";
import { file, glob, type Loader } from "astro/loaders";
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

function projectsLoader(fileName: string): Loader {
  const base = file(fileName);
  return {
    name: "projects-loader",
    load: async (context) => {
      await base.load(context);
      // NOTE:
      // On data.yaml edits in dev, the file loader's own watcher reloads raw values and skips this rendering, so descriptions show raw Markdown.
      // Restart the dev server to re-render.
      const { store, renderMarkdown } = context;
      for (const entry of store.values()) {
        const description = z.string().parse(entry.data.description);
        const { html } = await renderMarkdown(description);
        store.set({ ...entry, data: { ...entry.data, description: html } });
      }
    },
  };
}

const projectsCollection = defineCollection({
  loader: projectsLoader("./content/projects/data.yaml"),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(), // rendered to HTML by projectsLoader
      url: z.url(),
      github: z.string().optional(),
      langs: z.array(z.string()),
      status: z.enum(["active", "maintained", "completed", "archived"]),
      image: image().optional(),
      created: z.coerce.date(),
      updated: z.coerce.date(),
    }),
});

export const collections = {
  blog: blogCollection,
  projects: projectsCollection,
};
