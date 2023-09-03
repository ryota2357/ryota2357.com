import { z, defineCollection } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    postdate: z.coerce.date(),
    update: z.coerce.date(),
    tags: z.array(z.string())
  })
})

const worksCollection = defineCollection({
  type: 'data',
  schema: z.object({
    data: z.array(z.object({
      title: z.string(),
      description: z.string(),
      url: z.string().url(),
      image: z.string().startsWith("./"),
      created: z.coerce.date(),
      update: z.coerce.date(),
    }))
  })
})

export const collections = {
  'blog': blogCollection,
  'works': worksCollection
}
