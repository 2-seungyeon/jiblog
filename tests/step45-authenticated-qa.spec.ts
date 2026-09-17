import { expect, test } from "@playwright/test";
import {
  addMonths,
  formatYearMonthLabel,
  getPaymentPeriodSubtitle,
  isCurrentYearMonth,
  parseYearMonthParam,
} from "../lib/utils/year-month";
import { getCurrentYearMonth } from "../lib/utils/date";
import { gotoAppPage } from "./helpers/ui";

test.describe("STEP 45 year-month helpers", () => {
  test("parses valid month param", () => {
    expect(parseYearMonthParam("2026-03")).toBe("2026-03");
    expect(parseYearMonthParam("invalid")).toBe(getCurrentYearMonth());
  });

  test("adds and labels months", () => {
    expect(addMonths("2026-01", -1)).toBe("2025-12");
    expect(formatYearMonthLabel("2026-03")).toBe("2026년 3월");
    expect(getPaymentPeriodSubtitle(getCurrentYearMonth())).toBe("이번 달 주거비");
    expect(getPaymentPeriodSubtitle("2025-12")).toBe("2025년 12월 주거비");
  });

  test("detects current month", () => {
    expect(isCurrentYearMonth(getCurrentYearMonth())).toBe(true);
    expect(isCurrentYearMonth(addMonths(getCurrentYearMonth(), -1))).toBe(false);
  });
});

test.describe("STEP 45 payment period navigation UI", () => {
  test("rent page shows period navigator and current month by default", async ({
    page,
  }) => {
    await gotoAppPage(page, "/rent");

    await expect(page.getByRole("button", { name: "이전 달" })).toBeVisible();
    await expect(page.getByRole("button", { name: "다음 달" })).toBeVisible();
    await expect(page.getByLabel("연도")).toBeVisible();
    await expect(page.getByLabel("월")).toBeVisible();
    await expect(page.getByText("이번 달 주거비").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "이번 달로 돌아가기" })).toHaveCount(0);
  });

  test("month query shows selected period and preserves tabs", async ({ page }) => {
    const previousMonth = addMonths(getCurrentYearMonth(), -1);
    const previousLabel = formatYearMonthLabel(previousMonth);

    await gotoAppPage(page, `/rent?month=${previousMonth}`);

    await expect(page.getByText(`${previousLabel} 주거비`).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "이번 달로 돌아가기" })).toBeVisible();

    await page.getByRole("link", { name: "관리비" }).click();
    await expect(page).toHaveURL(new RegExp(`/maintenance\\?month=${previousMonth}`));
    await expect(page.getByText(`${previousLabel} 관리비 납부 현황`)).toBeVisible();
  });

  test("dashboard supports month query", async ({ page }) => {
    const previousMonth = addMonths(getCurrentYearMonth(), -1);
    const previousLabel = formatYearMonthLabel(previousMonth);

    await gotoAppPage(page, `/dashboard?month=${previousMonth}`);

    await expect(page.getByText(`${previousLabel} 주거비`).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "이번 달로 돌아가기" })).toBeVisible();
  });

  test("maintenance and expenses pages share month navigation", async ({ page }) => {
    const previousMonth = addMonths(getCurrentYearMonth(), -1);

    await gotoAppPage(page, `/maintenance?month=${previousMonth}`);
    await expect(page.getByLabel("연도")).toBeVisible();
    await expect(page.getByRole("button", { name: "이번 달로 돌아가기" })).toBeVisible();

    await gotoAppPage(page, `/expenses?month=${previousMonth}`);
    await expect(page.getByLabel("월")).toBeVisible();
    await expect(page.getByText(`${formatYearMonthLabel(previousMonth)} 주거비`).first()).toBeVisible();
  });
});
