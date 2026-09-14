import { expect, test } from "@playwright/test";
import { gotoAppPage } from "./helpers/ui";

test.describe("STEP 41 email confirmation pages", () => {
  test("confirm-email page renders with resend action", async ({ page }) => {
    await gotoAppPage(page, "/signup/confirm-email?email=test%40example.com&status=new");

    await expect(page.getByRole("heading", { name: "이메일을 확인해주세요" })).toBeVisible();
    await expect(page.getByText("test@example.com")).toBeVisible();
    await expect(page.getByRole("button", { name: "인증 메일 다시 보내기" })).toBeVisible();
    await expect(page.getByRole("link", { name: "로그인 페이지로 이동" })).toBeVisible();
  });

  test("email-confirmed page renders success state", async ({ page }) => {
    await gotoAppPage(page, "/signup/email-confirmed");

    await expect(page.getByRole("heading", { name: "이메일 인증이 완료됐어요" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /로그인하기|대시보드로 이동/ }),
    ).toBeVisible();
  });

  test("auth callback without token redirects to confirm-email error", async ({ page }) => {
    await page.goto("/auth/callback");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/signup\/confirm-email\?status=error/);
  });

  test("login page links to confirm-email guidance copy area", async ({ page }) => {
    await gotoAppPage(page, "/login");
    await expect(page.getByRole("heading", { name: "로그인" })).toBeVisible();
    await expect(page.getByRole("link", { name: "회원가입" })).toBeVisible();
  });
});
