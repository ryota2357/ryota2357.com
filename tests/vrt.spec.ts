import fs from "node:fs";
import { expect, test } from "@playwright/test";
import { loadLazyImages, ogImagePath } from "./vrt-utils";

const pages = [
  { name: "home", path: "/" },
  { name: "about", path: "/about/" },
  { name: "works", path: "/works/" },
  { name: "blog__kitchen-sink", path: "/blog/0000/kitchen-sink/" },
  { name: "blog__kitchen-sink-ja", path: "/blog/0000/kitchen-sink-ja/" },
];

for (const { name, path } of pages) {
  test(`${name} page`, async ({ page }) => {
    await page.goto(path);
    await loadLazyImages(page);
    await expect(page).toHaveScreenshot(`${name}.png`, {
      fullPage: true,
      mask: await page.locator("[data-vrt-mask]").all(),
      animations: "disabled",
    });
  });

  const ogPath = ogImagePath(path);
  if (fs.existsSync(ogPath)) {
    test(`${name} og image`, async () => {
      const png = fs.readFileSync(ogPath);
      expect(png).toMatchSnapshot(`og-${name}.png`);
    });
  }
}
