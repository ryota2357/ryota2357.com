import { unified } from "@astrojs/markdown-remark";
import partytown from "@astrojs/partytown";
import { defineConfig } from "astro/config";

// import remarkPrint from "./plugins/remark-print"
import remarkResolveRelativePageLink from "./plugins/remark-resolve-relative-page-link";

export default defineConfig({
  site: "https://ryota2357.com",
  compressHTML: true,
  integrations: [
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    }),
  ],
  markdown: {
    processor: unified({
      smartypants: false,
      remarkRehype: {
        footnoteLabel: " ",
        footnoteLabelTagName: "hr",
      },
      remarkPlugins: [
        // [remarkPrint, { node: true, vfile: false }],
        [remarkResolveRelativePageLink, { rootDirName: "blog" }],
      ],
    }),
  },
  redirects: {
    "/blog/2021/fatal-error-wchar.h-file-not-found/":
      "/blog/2021/fatal-error-wchar-h-file-not-found/",
    "/blog/2021/fatal-error-wcharh-file-not-found/":
      "/blog/2021/fatal-error-wchar-h-file-not-found/",
    "/works/": "/projects/",
  },
});
