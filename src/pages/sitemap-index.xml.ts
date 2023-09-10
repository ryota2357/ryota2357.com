export function get() {
  return {
    body: `
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://ryota2357.com/sitemap-0.xml</loc>
  </sitemap>
  <sitemap>
    <loc>https://ryota2357.com/sitemap-1.xml</loc>
  </sitemap>
</sitemapindex>
`.trim(),
  };
}
