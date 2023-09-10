import { defineConfig } from "astro/config";

import tailwind from "@astrojs/tailwind";

// import remarkPrint from "./plugins/remark-print"
import remarkResolveRelativePageLink from "./plugins/remark-resolve-relative-page-link";

export default defineConfig({
  site: "https://ryota2357.com",
  integrations: [tailwind()],
  markdown: {
    smartypants: false,
    remarkPlugins: [
      // [remarkPrint, { node: true, vfile: false }],
      [remarkResolveRelativePageLink, { rootDirName: "blog" }],
    ],
  },
});
