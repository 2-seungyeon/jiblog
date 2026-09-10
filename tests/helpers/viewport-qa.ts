import { expect, type Locator, type Page } from "@playwright/test";
import { checkNoHorizontalScroll } from "./env";

export async function assertNoHorizontalScroll(page: Page): Promise<void> {
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  checkNoHorizontalScroll(scrollWidth, clientWidth);
}

export async function assertWithinViewport(
  locator: Locator,
  viewportWidth: number,
): Promise<void> {
  await expect(locator).toBeVisible();
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();

  if (box) {
    expect(box.x).toBeGreaterThanOrEqual(-1);
    expect(box.x + box.width).toBeLessThanOrEqual(viewportWidth + 1);
  }
}

export async function assertNoHorizontalOverflow(
  locator: Locator,
  viewportWidth: number,
): Promise<void> {
  await expect(locator).toBeVisible();
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();

  if (box) {
    expect(box.x + box.width).toBeLessThanOrEqual(viewportWidth + 1);
  }
}
