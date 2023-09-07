import { defineConfig } from 'astro/config';

import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: 'https://ryota2357.com/',
  integrations: [tailwind(), sitemap()]
});
