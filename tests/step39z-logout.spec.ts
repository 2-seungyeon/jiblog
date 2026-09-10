import { expect, test } from "@playwright/test";
import { gotoAppPage } from "./helpers/ui";

test.describe("STEP 39 logout", () => {
  test("logout redirects to login and blocks protected routes", async ({ page }) => {
    await gotoAppPage(page, "/dashboard");

    const logoutButton = page
      .getByRole("button", { name: "로그아웃" })
      .or(page.getByRole("button", { name: "처리 중..." }))
      .first();
    await expect(logoutButton).toBeVisible();
    await logoutButton.click();

    await page.waitForURL(/\/login/, { timeout: 30_000 });
    await expect(page.getByRole("heading", { level: 1, name: "로그인" })).toBeVisible();

    await page.goto("/dashboard");
    await page.waitForURL(/\/login/);
  });
});
