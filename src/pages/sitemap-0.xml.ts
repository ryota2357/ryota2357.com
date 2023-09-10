export function get() {
  return {
    body: `
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://ryota2357.com/</loc>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://ryota2357.com/about/</loc>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://ryota2357.com/blog/</loc>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://ryota2357.com/blog/tag/</loc>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://ryota2357.com/works/</loc>
    <priority>0.5</priority>
  </url>
</urlset>
`.trim(),
  };
}
