import fs from "node:fs";
import { expect, test } from "@playwright/test";
import { loadLazyImages, ogImagePath } from "./vrt-utils";

test.skip(() => !process.env.FULL_VRT, "Skipped unless FULL_VRT=1");

test("all pages from sitemap", async ({ page }) => {
  const indexResponse = await page.goto("/sitemap-index.xml");
  const indexXml = (await indexResponse?.text()) ?? "";
  const sitemapPaths = [...indexXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (m) => new URL(m[1]).pathname,
  );

  const urls: string[] = [];
  for (const sitemapPath of sitemapPaths) {
    const response = await page.goto(sitemapPath);
    const xml = (await response?.text()) ?? "";
    const pageUrls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (m) => new URL(m[1]).pathname,
    );
    urls.push(...pageUrls);
  }

  expect(urls.length).toBeGreaterThan(0);

  for (const url of urls) {
    await page.goto(url);
    await loadLazyImages(page);
    const name = url.replace(/\//g, "__").replace(/^__|__$/g, "");
    await expect(page).toHaveScreenshot(`full-${name || "root"}.png`, {
      fullPage: true,
      mask: await page.locator("[data-vrt-mask]").all(),
      animations: "disabled",
    });
    const ogPath = ogImagePath(url);
    if (fs.existsSync(ogPath)) {
      const png = fs.readFileSync(ogPath);
      expect(png).toMatchSnapshot(`og-full-${name || "root"}.png`);
    }
  }
});
