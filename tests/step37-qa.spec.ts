import { expect, test } from "@playwright/test";

const viewports = [
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
];

for (const viewport of viewports) {
  test.describe(`viewport ${viewport.width}px`, () => {
    test.use({ viewport });

    test("login page layout", async ({ page }) => {
      await page.goto("/login");
      await page.waitForLoadState("networkidle");

      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.getByRole("button", { name: "로그인" })).toBeVisible();

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    });

    test("payment tabs structure when reachable", async ({ page }) => {
      await page.goto("/rent");
      await page.waitForLoadState("networkidle");

      if (page.url().includes("/login")) {
        test.skip(true, "Auth required for app pages");
      }

      const tabNav = page.getByRole("navigation", { name: "납부 구분" });
      await expect(tabNav).toBeVisible();
      await expect(tabNav.getByRole("link", { name: "월세" })).toBeVisible();
      await expect(tabNav.getByRole("link", { name: "관리비" })).toBeVisible();
      await expect(tabNav.getByRole("link", { name: "공과금" })).toBeVisible();

      const activeTab = tabNav.locator(".ui-payment-tab-active");
      await expect(activeTab).toHaveCount(1);
      await expect(activeTab).toHaveText("월세");
    });
  });
}
