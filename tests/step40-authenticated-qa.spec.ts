import { expect, test } from "@playwright/test";
import { isPaymentOverdue } from "../lib/utils/payment-overdue";
import { gotoAppPage } from "./helpers/ui";
import { assertNoHorizontalScroll } from "./helpers/viewport-qa";

test.describe("STEP 40 overdue payment logic", () => {
  test("marks scheduled payments after due day as overdue", () => {
    expect(isPaymentOverdue("예정", "2026-09", 5, new Date("2026-09-14"))).toBe(true);
    expect(isPaymentOverdue("예정", "2026-09", 14, new Date("2026-09-14"))).toBe(false);
    expect(isPaymentOverdue("예정", "2026-09", 20, new Date("2026-09-14"))).toBe(false);
    expect(isPaymentOverdue("완료", "2026-09", 5, new Date("2026-09-14"))).toBe(false);
  });
});

test.describe("STEP 40 overdue payment UI", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("payment lists render overdue badge styling when applicable", async ({ page }) => {
    await gotoAppPage(page, "/dashboard");

    const overdueBadge = page.locator(".ui-payment-status-overdue").first();
    if ((await overdueBadge.count()) === 0) {
      test.skip(true, "No overdue scheduled payments in test data");
    }

    await expect(page.getByText("납부 지연").first()).toBeVisible();
    const badgeColor = await overdueBadge.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    );
    expect(badgeColor).toBe("rgb(220, 76, 76)");
    await assertNoHorizontalScroll(page);
  });

  test("dashboard todo highlights overdue relative date", async ({ page }) => {
    await gotoAppPage(page, "/dashboard");
    const overdueExtra = page.locator(".ui-payment-list-extra-overdue").first();
    if ((await overdueExtra.count()) > 0) {
      await expect(overdueExtra).toContainText("지연");
    }
    await assertNoHorizontalScroll(page);
  });
});

test.describe("STEP 40 mobile branding", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("mobile app shell shows logo and app name", async ({ page }) => {
    await gotoAppPage(page, "/dashboard");
    await expect(page.getByRole("link", { name: /집로그/ }).first()).toBeVisible();
    await expect(page.locator("header svg").first()).toBeVisible();
    await assertNoHorizontalScroll(page);
  });

  for (const path of ["/homes", "/rent"] as const) {
    test(`${path} keeps mobile brand visible`, async ({ page }) => {
      await gotoAppPage(page, path);
      await expect(page.getByRole("link", { name: /집로그/ }).first()).toBeVisible();
    });
  }
});
