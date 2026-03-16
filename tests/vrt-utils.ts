import path from "node:path";
import { expect, type Page } from "@playwright/test";

export function ogImagePath(pagePath: string): string {
  const slug = pagePath.replace(/^\/|\/$/g, "") || "index";
  return path.resolve("dist/og", `${slug}.png`);
}

export async function loadLazyImages(page: Page): Promise<void> {
  const lazyImages = await page.locator('img[loading="lazy"]:visible').all();
  for (const lazyImage of lazyImages) {
    await lazyImage.scrollIntoViewIfNeeded();
    await expect(lazyImage).not.toHaveJSProperty("naturalWidth", 0);
  }
}
