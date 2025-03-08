import { defineConfig } from "astro/config";

import partytown from "@astrojs/partytown";
import tailwindcss from "@tailwindcss/vite";

// import remarkPrint from "./plugins/remark-print"
import remarkResolveRelativePageLink from "./plugins/remark-resolve-relative-page-link";

export default defineConfig({
  site: "https://ryota2357.com",
  integrations: [
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    }),
  ],
  markdown: {
    smartypants: false,
    remarkRehype: {
      footnoteLabel: " ",
      footnoteLabelTagName: "hr",
    },
    remarkPlugins: [
      // [remarkPrint, { node: true, vfile: false }],
      [remarkResolveRelativePageLink, { rootDirName: "blog" }],
    ],
  },
  vite: {
    plugins: [tailwindcss()],
  },
  redirects: {
    "/blog/2021/fatal-error-wchar.h-file-not-found/":
      "/blog/2021/fatal-error-wchar-h-file-not-found/",
    "/blog/2021/fatal-error-wcharh-file-not-found/":
      "/blog/2021/fatal-error-wchar-h-file-not-found/",
  },
});
