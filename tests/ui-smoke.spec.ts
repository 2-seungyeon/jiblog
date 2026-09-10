import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const publicRoutes = [
  { name: "login", path: "/login" },
  { name: "signup", path: "/signup" },
] as const;

const authRedirectRoutes = [
  { name: "dashboard", path: "/dashboard" },
  { name: "homes", path: "/homes" },
  { name: "rent", path: "/rent" },
  { name: "maintenance", path: "/maintenance" },
  { name: "expenses", path: "/expenses" },
] as const;

function screenshotDir(viewportWidth: number) {
  return path.join("tests", "screenshots", String(viewportWidth));
}

test.describe("public auth pages render", () => {
  for (const route of publicRoutes) {
    test(`${route.name}`, async ({ page }, testInfo) => {
      await page.goto(route.path);
      await page.waitForLoadState("networkidle");

      const dir = screenshotDir(testInfo.project.use.viewport?.width ?? 1280);
      fs.mkdirSync(dir, { recursive: true });
      await page.screenshot({
        path: path.join(dir, `${route.name}.png`),
        fullPage: true,
      });

      await expect(page.locator("body")).toBeVisible();
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    });
  }
});

test.describe("protected routes redirect or render", () => {
  for (const route of authRedirectRoutes) {
    test(`${route.name}`, async ({ page }, testInfo) => {
      await page.goto(route.path);
      await page.waitForLoadState("networkidle");

      const dir = screenshotDir(testInfo.project.use.viewport?.width ?? 1280);
      fs.mkdirSync(dir, { recursive: true });
      await page.screenshot({
        path: path.join(dir, `${route.name}.png`),
        fullPage: true,
      });

      const url = page.url();
      const onLogin = url.includes("/login");
      const onApp = url.includes(route.path);

      expect(onLogin || onApp).toBeTruthy();
    });
  }
});
