import { expect, type Locator, type Page } from "@playwright/test";

export async function gotoAppPage(page: Page, path: string): Promise<void> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");

    const hasServerError = await page
      .getByRole("heading", { name: "This page couldn’t load" })
      .isVisible();

    if (!hasServerError) {
      return;
    }

    await page.waitForTimeout(2_000);
  }

  await expect(
    page.getByRole("heading", { name: "This page couldn’t load" }),
  ).toHaveCount(0);
}

export async function expectSubmitWithFeedback(
  page: Page,
  submitButton: Locator,
  successText: string,
): Promise<void> {
  await submitButton.click();

  const loadingButton = page.getByRole("button", { name: "처리 중..." }).first();
  const successToast = page.getByRole("status").filter({ hasText: successText });

  await expect(loadingButton.or(successToast)).toBeVisible({ timeout: 15_000 });
  await expect(successToast).toBeVisible({ timeout: 15_000 });
}

export async function selectComboboxOption(
  page: Page,
  label: string,
  optionLabel: string,
): Promise<void> {
  await page.getByLabel(label).click();
  await page.getByRole("option", { name: optionLabel }).click();
}

export async function openFirstHomeDetail(page: Page): Promise<void> {
  await gotoAppPage(page, "/homes");

  const emptyState = page.getByText("아직 등록된 집이 없어요");
  if (await emptyState.isVisible()) {
    throw new Error("No homes registered for this account");
  }

  const homeLink = page.locator(".ui-home-item").first();
  await expect(homeLink).toBeVisible();
  await homeLink.click();
  await page.waitForURL(/\/homes\/[^/]+$/);
}
