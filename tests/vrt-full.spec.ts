import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { loadLazyImages, ogImagePath } from "./vrt-utils";

test.skip(() => !process.env.FULL_VRT, "Skipped unless FULL_VRT=1");

// All pages were originally tested in a single test, which caused timeouts
// (especially with --update-snapshots). Splitting into per-page tests requires
// the URL list at module load time (Playwright defines tests synchronously).
// Alternatives considered:
//   - globalSetup: runs before webServer, so can't fetch via HTTP
//   - project dependencies (setup project writes JSON): too much ceremony for this
// Reading dist/ directly is simplest — it must already exist for the preview server.
function collectUrlsFromDist(): string[] {
  const distDir = path.resolve(import.meta.dirname, "../dist");
  const indexXml = fs.readFileSync(
    path.join(distDir, "sitemap-index.xml"),
    "utf-8",
  );
  const sitemapFiles = [...indexXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
    new URL(m[1]).pathname.replace(/^\//, ""),
  );

  const urls: string[] = [];
  for (const file of sitemapFiles) {
    const xml = fs.readFileSync(path.join(distDir, file), "utf-8");
    const pageUrls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (m) => new URL(m[1]).pathname,
    );
    urls.push(...pageUrls);
  }
  return urls;
}

// GIF animations can't be frozen by Playwright's `animations: "disabled"` (CSS-only),
// so pages containing GIFs produce non-deterministic screenshots.
const skipPages = new Set([
  "/blog/2022/gatsby-site-create-log3/",
  "/blog/2024/vim-resize-window-more-intuitive/",
]);

// Some pages (especially image-heavy slide posts) may produce unstable
// screenshots due to rendering timing, causing comparison retries to exhaust
// the timeout. Re-running usually resolves these, but if they persist,
// use `pnpm run vrt:ui` to visually check the diff and accept manually.

const urls = collectUrlsFromDist().filter((url) => !skipPages.has(url));

for (const url of urls) {
  const name = url.replace(/\//g, "__").replace(/^__|__$/g, "");

  test(`page: ${url}`, async ({ page }) => {
    await page.goto(url);
    await loadLazyImages(page);
    await expect(page).toHaveScreenshot(`full-${name || "root"}.png`, {
      fullPage: true,
      mask: await page.locator("[data-vrt-mask]").all(),
      animations: "disabled",
    });
  });

  const ogPath = ogImagePath(url);
  if (fs.existsSync(ogPath)) {
    test(`og: ${url}`, async () => {
      const png = fs.readFileSync(ogPath);
      expect(png).toMatchSnapshot(`og-full-${name || "root"}.png`);
    });
  }
}
