import { expect, test } from "@playwright/test";
import { gotoAppPage } from "./helpers/ui";

test.describe("STEP 39 signup feedback", () => {
  test("duplicate email shows inline alert only once", async ({ page }) => {
    const email = process.env.PLAYWRIGHT_TEST_EMAIL?.trim();

    if (!email) {
      test.skip(true, "PLAYWRIGHT_TEST_EMAIL not set");
    }

    await gotoAppPage(page, "/signup");

    await page.getByRole("textbox", { name: /이름/ }).fill("중복 테스트");
    await page.getByRole("textbox", { name: /이메일/ }).fill(email!);
    await page.getByRole("textbox", { name: /^비밀번호 \*$/ }).fill("test1234");
    await page
      .getByRole("textbox", { name: /^비밀번호 확인 \*$/ })
      .fill("test1234");
    await page.getByRole("button", { name: "회원가입" }).click();

    await expect(page.getByRole("alert")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("alert")).toHaveCount(1);
    await expect(page).toHaveURL(/\/signup/);
  });
});
