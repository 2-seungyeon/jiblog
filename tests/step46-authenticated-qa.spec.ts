import { expect, test } from "@playwright/test";
import {
  isContractEligibleForMaintenanceInMonth,
  isContractEligibleForRentInMonth,
  isYearMonthWithinContract,
} from "../lib/utils/contract-status";
import { getCurrentYearMonth } from "../lib/utils/date";
import {
  addMonths,
  formatYearMonthLabel,
  isFutureYearMonth,
  parseYearMonthParam,
} from "../lib/utils/year-month";
import { allowMutations } from "./helpers/env";
import {
  findAvailableExpenseCategory,
  getPrimaryHomeForTestUser,
} from "./helpers/test-data-fixture";
import {
  expectSubmitWithFeedback,
  gotoAppPage,
  selectComboboxOption,
} from "./helpers/ui";

test.describe("STEP 46 contract month helpers", () => {
  test("checks year-month within contract period", () => {
    expect(
      isYearMonthWithinContract("2025.01.01", "2025.12.31", "2025-06"),
    ).toBe(true);
    expect(
      isYearMonthWithinContract("2025.01.01", "2025.12.31", "2024-12"),
    ).toBe(false);
    expect(
      isYearMonthWithinContract("2025.01.01", "2025.03.15", "2025-03"),
    ).toBe(true);
  });

  test("checks rent and maintenance eligibility by month", () => {
    expect(
      isContractEligibleForRentInMonth({
        type: "월세",
        monthlyRent: 500_000,
        startDate: "2025.01.01",
        endDate: "2025.12.31",
        yearMonth: "2025-06",
      }),
    ).toBe(true);
    expect(
      isContractEligibleForMaintenanceInMonth({
        maintenanceFee: 80_000,
        startDate: "2025.01.01",
        endDate: "2025.12.31",
        yearMonth: "2025-06",
      }),
    ).toBe(true);
  });

  test("detects future months", () => {
    const nextMonth = addMonths(getCurrentYearMonth(), 1);
    expect(isFutureYearMonth(nextMonth)).toBe(true);
    expect(isFutureYearMonth(getCurrentYearMonth())).toBe(false);
    expect(parseYearMonthParam("invalid")).toBe(getCurrentYearMonth());
  });
});

test.describe("STEP 46 past month payment recording UI", () => {
  test("past month rent page can show record add section", async ({ page }) => {
    const previousMonth = addMonths(getCurrentYearMonth(), -1);

    await gotoAppPage(page, `/rent?month=${previousMonth}`);

    await expect(page.getByRole("button", { name: "이번 달로 돌아가기" })).toBeVisible();
    await expect(page.getByText("월세 목록")).toBeVisible();
  });

  test("expenses new page reflects month query", async ({ page }) => {
    const previousMonth = addMonths(getCurrentYearMonth(), -1);
    const previousLabel = formatYearMonthLabel(previousMonth);

    await gotoAppPage(page, `/expenses/new?month=${previousMonth}`);

    await expect(
      page.getByText(`${previousLabel} 공과금 납부 항목을 등록하세요.`),
    ).toBeVisible();
    await expect(
      page.getByText(`${previousLabel} 공과금으로 등록됩니다.`),
    ).toBeVisible();
  });

  test("expenses list preserves month when adding expense", async ({ page }) => {
    const previousMonth = addMonths(getCurrentYearMonth(), -1);

    await gotoAppPage(page, `/expenses?month=${previousMonth}`);

    const addButton = page.getByRole("link", { name: "공과금 추가" });
    if (await addButton.count()) {
      await addButton.first().click();
      await expect(page).toHaveURL(
        new RegExp(`/expenses/new\\?month=${previousMonth}`),
      );
    }
  });

  test("creates past month rent record from list", async ({ page }) => {
    if (!allowMutations()) {
      test.skip(true, "Set PLAYWRIGHT_ALLOW_MUTATIONS=1 to run mutation tests");
    }

    const previousMonth = addMonths(getCurrentYearMonth(), -1);

    await gotoAppPage(page, `/rent?month=${previousMonth}`);

    const addButton = page.getByRole("button", { name: "기록 추가" }).first();
    if (!(await addButton.isVisible())) {
      test.skip(true, "No missing rent homes for previous month");
    }

    await addButton.click();
    await expect(
      page.getByRole("status").filter({ hasText: "저장했어요" }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("예정").first()).toBeVisible();
  });

  test("creates past month maintenance record from list", async ({ page }) => {
    if (!allowMutations()) {
      test.skip(true, "Set PLAYWRIGHT_ALLOW_MUTATIONS=1 to run mutation tests");
    }

    const previousMonth = addMonths(getCurrentYearMonth(), -1);

    await gotoAppPage(page, `/maintenance?month=${previousMonth}`);

    const addButton = page.getByRole("button", { name: "기록 추가" }).first();
    if (!(await addButton.isVisible())) {
      test.skip(true, "No missing maintenance homes for previous month");
    }

    await addButton.click();
    await expect(
      page.getByRole("status").filter({ hasText: "저장했어요" }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("예정").first()).toBeVisible();
  });

  test("registers expense for past month and returns to filtered list", async ({
    page,
  }) => {
    if (!allowMutations()) {
      test.skip(true, "Set PLAYWRIGHT_ALLOW_MUTATIONS=1 to run mutation tests");
    }

    const previousMonth = addMonths(getCurrentYearMonth(), -1);
    const primaryHome = await getPrimaryHomeForTestUser();

    if (!primaryHome) {
      test.skip(true, "No primary home for this account");
    }

    const availableCategory = await findAvailableExpenseCategory(
      primaryHome!.id,
      previousMonth,
    );

    if (!availableCategory) {
      test.skip(true, "No unused expense category for previous month");
    }

    await gotoAppPage(page, `/expenses/new?month=${previousMonth}`);
    await selectComboboxOption(page, "공과금 종류", availableCategory!.label);
    await page.getByLabel("금액").fill("23,456");
    await page.getByLabel("납부 예정일").fill("18");

    await expectSubmitWithFeedback(
      page,
      page.getByRole("button", { name: "등록하기" }),
      "저장했어요",
    );

    await page.waitForURL(new RegExp(`/expenses\\?month=${previousMonth}`));
    await expect(page.getByText(availableCategory!.label).first()).toBeVisible();
  });
});
