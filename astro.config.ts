import { defineConfig } from "astro/config";

import tailwind from "@astrojs/tailwind";
import partytown from "@astrojs/partytown";

// import remarkPrint from "./plugins/remark-print"
import remarkResolveRelativePageLink from "./plugins/remark-resolve-relative-page-link";

export default defineConfig({
  site: "https://ryota2357.com",
  integrations: [
    tailwind(),
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    }),
  ],
  markdown: {
    smartypants: false,
    remarkPlugins: [
      // [remarkPrint, { node: true, vfile: false }],
      [remarkResolveRelativePageLink, { rootDirName: "blog" }],
    ],
  },
});
