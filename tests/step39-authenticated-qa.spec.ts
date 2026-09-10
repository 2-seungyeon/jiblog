import { expect, test } from "@playwright/test";
import { gotoAppPage } from "./helpers/ui";

test.describe("STEP 39 service journey", () => {
  test("core pages communicate purpose within first glance", async ({ page }) => {
    await gotoAppPage(page, "/dashboard");
    await expect(page.locator(".ui-summary-total").first()).toBeVisible();
    await expect(page.getByText("이번 달 주거비").first()).toBeVisible();

    await gotoAppPage(page, "/homes");
    await expect(page.getByRole("heading", { name: "내 집" })).toBeVisible();

    await page.locator(".ui-home-item").first().click();
    await page.waitForURL(/\/homes\/[^/]+$/);
    await expect(page.locator(".ui-page-title").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "계약" })).toBeVisible();

    await gotoAppPage(page, "/rent");
    await expect(page.getByRole("heading", { name: "납부" })).toBeVisible();
    await expect(page.locator(".ui-summary-total").first()).toBeVisible();

    await gotoAppPage(page, "/maintenance");
    await expect(page.locator(".ui-summary-total").first()).toBeVisible();

    await gotoAppPage(page, "/expenses");
    await expect(page.locator(".ui-summary-total").first()).toBeVisible();

    await gotoAppPage(page, "/expenses/new");
    await expect(page.getByRole("heading", { name: "공과금 추가" })).toBeVisible();
  });
});

test.describe("STEP 39 navigation clarity", () => {
  test("marks active section with aria-current", async ({ page }) => {
    await gotoAppPage(page, "/homes");

    await expect(
      page.getByRole("link", { name: "내 집" }).and(page.locator('[aria-current="page"]')),
    ).toBeVisible();

    await gotoAppPage(page, "/rent");

    await expect(
      page
        .locator('nav[aria-label="납부 구분"]')
        .getByRole("link", { name: "월세" })
        .and(page.locator('[aria-current="page"]')),
    ).toBeVisible();
  });
});

test.describe("STEP 39 homes list hierarchy", () => {
  test("shows primary badge beside home title", async ({ page }) => {
    await gotoAppPage(page, "/homes");

    const primaryCard = page.locator(".ui-home-item").filter({ hasText: "대표" }).first();

    if ((await primaryCard.count()) === 0) {
      test.skip(true, "No primary home badge on this account");
    }

    const titleRow = primaryCard.locator(".flex.flex-wrap.items-center.gap-2").first();
    await expect(titleRow.locator(".ui-home-title")).toBeVisible();
    await expect(titleRow.getByText("대표", { exact: true })).toBeVisible();
  });
});

test.describe("STEP 39 toast placement", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("success toast stays above bottom navigation", async ({ page }) => {
    await gotoAppPage(page, "/homes");

    if (await page.getByText("아직 등록된 집이 없어요").isVisible()) {
      test.skip(true, "No homes");
    }

    await page.locator(".ui-home-item").first().click();
    await page.waitForURL(/\/homes\/[^/]+$/);

    const homeId = page.url().match(/\/homes\/([^/]+)$/)?.[1];
    test.skip(!homeId, "Could not resolve home id");

    await gotoAppPage(page, `/homes/${homeId}/edit`);

    const memoField = page.getByRole("textbox", { name: /메모/ });
    const currentMemo = await memoField.inputValue();
    await memoField.fill(currentMemo ? `${currentMemo} ` : "STEP39 QA");

    await page.getByRole("button", { name: /저장하기/ }).click();
    await expect(page.getByRole("status").filter({ hasText: "수정했어요" })).toBeVisible();

    const toastBox = await page.locator(".ui-toast").first().boundingBox();
    const bottomNavBox = await page
      .locator('nav[aria-label="하단 메뉴"]')
      .boundingBox();

    expect(toastBox).not.toBeNull();
    expect(bottomNavBox).not.toBeNull();

    if (toastBox && bottomNavBox) {
      expect(toastBox.y + toastBox.height).toBeLessThanOrEqual(bottomNavBox.y + 2);
    }
  });
});

const responsiveViewports = [
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
] as const;

for (const viewport of responsiveViewports) {
  test.describe(`STEP 39 responsive readability ${viewport.width}px`, () => {
    test.use({ viewport });

    test("payment tabs and overview remain readable", async ({ page }) => {
      await gotoAppPage(page, "/rent");

      const tabNav = page.locator('nav[aria-label="납부 구분"]');
      await expect(tabNav).toBeVisible();
      await expect(tabNav.getByRole("link", { name: "월세" })).toBeVisible();
      await expect(tabNav.getByRole("link", { name: "관리비" })).toBeVisible();
      await expect(tabNav.getByRole("link", { name: "공과금" })).toBeVisible();
      await expect(page.locator(".ui-summary-total").first()).toBeVisible();

      const tabBoxes = await tabNav.getByRole("link").all();
      expect(tabBoxes.length).toBeGreaterThanOrEqual(3);

      for (const tab of tabBoxes.slice(0, 3)) {
        const box = await tab.boundingBox();
        expect(box).not.toBeNull();
        if (box) {
          expect(box.height).toBeGreaterThanOrEqual(40);
        }
      }
    });
  });
}
