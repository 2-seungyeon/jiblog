import { expect, test } from "@playwright/test";
import { allowMutations, checkNoHorizontalScroll } from "./helpers/env";
import { disconnectPaymentFixture } from "./helpers/payment-fixture";
import {
  createDisposableTestHome,
  deleteExpensePaymentForCategory,
  deleteHomeById,
  findAvailableExpenseCategory,
  getContractForHome,
  getPrimaryHomeForTestUser,
  preparePendingMaintenancePaymentForTestUser,
  preparePendingRentPaymentForTestUser,
  updateHomeMemo,
} from "./helpers/test-data-fixture";
import {
  expectSubmitWithFeedback,
  gotoAppPage,
  openFirstHomeDetail,
  selectComboboxOption,
} from "./helpers/ui";

const paymentRoutes = [
  { path: "/rent", label: "월세" },
  { path: "/maintenance", label: "관리비" },
  { path: "/expenses", label: "공과금" },
] as const;

const responsiveViewports = [
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
] as const;

async function expectPaymentTabs(page: import("@playwright/test").Page, activeLabel: string) {
  const tabNav = page.getByRole("navigation", { name: "납부 구분" });
  await expect(tabNav).toBeVisible();

  for (const tab of paymentRoutes) {
    await expect(tabNav.getByRole("link", { name: tab.label })).toBeVisible();
  }

  const activeTab = tabNav.locator(".ui-payment-tab-active");
  await expect(activeTab).toHaveCount(1);
  await expect(activeTab).toHaveText(activeLabel);
  await expect(activeTab).not.toHaveClass(/font-bold|font-semibold/);
}

test.describe("authenticated core flows", () => {
  test("login session opens dashboard", async ({ page }) => {
    await gotoAppPage(page, "/dashboard");

    expect(page.url()).toContain("/dashboard");
    await expect(
      page
        .getByText("이번 달 주거비")
        .or(page.getByText("등록된 집이 없어요"))
        .or(page.getByText("등록된 계약이 없어요"))
        .first(),
    ).toBeVisible();
  });

  test("dashboard payment management CTA goes to rent", async ({ page }) => {
    await gotoAppPage(page, "/dashboard");

    const paymentLink = page.getByRole("link", { name: "납부 관리하기" });

    if ((await paymentLink.count()) === 0) {
      test.skip(true, "No payment management CTA on dashboard for this account");
    }

    await expect(paymentLink.first()).toHaveAttribute("href", "/rent");
    await paymentLink.first().click();
    await page.waitForURL(/\/rent$/);
    await expectPaymentTabs(page, "월세");
  });

  test("homes list renders primary badge beside title", async ({ page }) => {
    await gotoAppPage(page, "/homes");

    if (page.url().includes("/login")) {
      test.fail(true, "Expected authenticated homes page");
    }

    const emptyState = page.getByText("아직 등록된 집이 없어요");

    if (await emptyState.isVisible()) {
      test.skip(true, "No homes registered for this account");
    }

    const primaryBadge = page.getByText("대표", { exact: true }).first();
    await expect(primaryBadge).toBeVisible();
    await expect(primaryBadge).toHaveClass(/ui-primary-home-badge/);

    await openFirstHomeDetail(page);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("home detail shows contract and payment sections", async ({ page }) => {
    await openFirstHomeDetail(page);

    await expect(page.getByRole("heading", { name: "계약" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "이번 달 납부" })).toBeVisible();
    await expect(page.getByRole("button", { name: "집 정보 수정" })).toBeVisible();
  });

  test("payment tabs navigate across rent, maintenance, and expenses", async ({ page }) => {
    await gotoAppPage(page, "/rent");

    if (await page.getByText("등록된 집이 없어요").isVisible()) {
      test.skip(true, "Account has no homes — payment tabs unavailable");
    }

    await expectPaymentTabs(page, "월세");

    const tabNav = page.getByRole("navigation", { name: "납부 구분" });

    await tabNav.getByRole("link", { name: "관리비" }).click();
    await page.waitForURL(/\/maintenance$/);
    await expectPaymentTabs(page, "관리비");

    await tabNav.getByRole("link", { name: "공과금" }).click();
    await page.waitForURL(/\/expenses$/);
    await expectPaymentTabs(page, "공과금");

    await tabNav.getByRole("link", { name: "월세" }).click();
    await page.waitForURL(/\/rent$/);
    await expectPaymentTabs(page, "월세");
  });

  test("payment pages reload with correct active tab", async ({ page }) => {
    await gotoAppPage(page, "/rent");

    if (await page.getByText("등록된 집이 없어요").isVisible()) {
      test.skip(true, "Account has no homes — payment tabs unavailable");
    }

    for (const route of paymentRoutes) {
      await gotoAppPage(page, route.path);
      await expectPaymentTabs(page, route.label);
    }
  });

  test("payment overview shows rent, maintenance, and utility breakdown", async ({ page }) => {
    await gotoAppPage(page, "/rent");

    if (await page.getByText("등록된 집이 없어요").isVisible()) {
      test.skip(true, "Account has no homes — payment overview unavailable");
    }

    await expect(page.getByText("이번 달 주거비").first()).toBeVisible();
    await expect(page.getByText("월세").first()).toBeVisible();
    await expect(page.getByText("관리비").first()).toBeVisible();
    await expect(page.getByText("공과금").first()).toBeVisible();
  });
});

test.describe("authenticated mutation flows", () => {
  test.describe.configure({ mode: "serial" });

  let primaryHomeId: string | null = null;
  let originalMemo: string | null = null;
  let disposableHomeId: string | null = null;
  let expenseCleanup: {
    homeId: string;
    category: import("@prisma/client").ExpenseCategory;
  } | null = null;

  test.beforeAll(async () => {
    if (!allowMutations()) {
      return;
    }

    const primaryHome = await getPrimaryHomeForTestUser();
    primaryHomeId = primaryHome?.id ?? null;
    originalMemo = primaryHome?.memo ?? null;
    disposableHomeId = await createDisposableTestHome();
  });

  test.afterAll(async () => {
    if (!allowMutations()) {
      return;
    }

    if (primaryHomeId) {
      await updateHomeMemo(primaryHomeId, originalMemo);
    }

    if (expenseCleanup) {
      await deleteExpensePaymentForCategory(
        expenseCleanup.homeId,
        expenseCleanup.category,
      );
    }

    if (disposableHomeId) {
      await deleteHomeById(disposableHomeId).catch(() => undefined);
    }
  });

  test("home edit saves memo and shows loading and toast", async ({ page }) => {
    if (!allowMutations()) {
      test.skip(true, "Set PLAYWRIGHT_ALLOW_MUTATIONS=1 to run mutation tests");
    }

    if (!primaryHomeId) {
      test.skip(true, "No primary home for this account");
    }

    const testMemo = `E2E ${Date.now()}`;

    await gotoAppPage(page, `/homes/${primaryHomeId}/edit`);
    await expect(page.getByRole("heading", { name: "집 정보 수정" })).toBeVisible();
    await page.getByLabel("메모").fill(testMemo);

    await expectSubmitWithFeedback(
      page,
      page.getByRole("button", { name: "저장하기" }),
      "수정했어요",
    );

    await page.waitForURL(new RegExp(`/homes/${primaryHomeId}$`));
    await expect(page.getByText(testMemo)).toBeVisible();
  });

  test("contract edit shows current rent and maintenance values", async ({ page }) => {
    if (!allowMutations()) {
      test.skip(true, "Set PLAYWRIGHT_ALLOW_MUTATIONS=1 to run mutation tests");
    }

    if (!primaryHomeId) {
      test.skip(true, "No primary home for this account");
    }

    const contract = await getContractForHome(primaryHomeId!);

    if (!contract) {
      test.skip(true, "No contract registered for primary home");
    }

    await gotoAppPage(page, `/homes/${primaryHomeId}/contract/edit`);
    await expect(
      page.getByRole("heading", { name: /계약 (수정|갱신)/ }),
    ).toBeVisible();

    await expect(page.getByLabel("월세")).toHaveValue(
      contract!.monthlyRent.toLocaleString("ko-KR"),
    );
    await expect(page.getByLabel("관리비")).toHaveValue(
      contract!.maintenanceFee.toLocaleString("ko-KR"),
    );

    await expectSubmitWithFeedback(
      page,
      page.getByRole("button", { name: /저장하기|갱신하기/ }),
      "수정했어요",
    );

    await page.waitForURL(new RegExp(`/homes/${primaryHomeId}$`));
  });

  test("expense registration appears in expenses list", async ({ page }) => {
    if (!allowMutations()) {
      test.skip(true, "Set PLAYWRIGHT_ALLOW_MUTATIONS=1 to run mutation tests");
    }

    if (!primaryHomeId) {
      test.skip(true, "No primary home for this account");
    }

    const availableCategory = await findAvailableExpenseCategory(primaryHomeId!);

    if (!availableCategory) {
      test.skip(true, "No unused expense category for current month");
    }

    expenseCleanup = {
      homeId: primaryHomeId!,
      category: availableCategory!.category,
    };

    await gotoAppPage(page, "/expenses/new");
    await selectComboboxOption(page, "공과금 종류", availableCategory!.label);
    await page.getByLabel("금액").fill("12,345");
    await page.getByLabel("납부 예정일").fill("20");

    await expectSubmitWithFeedback(
      page,
      page.getByRole("button", { name: "등록하기" }),
      "저장했어요",
    );

    await page.waitForURL(/\/expenses$/);
    await expect(page.getByText(availableCategory!.label).first()).toBeVisible();
    await expect(page.getByText("12,345원").first()).toBeVisible();
  });

  test("home delete dialog opens and cancel keeps the home", async ({ page }) => {
    if (!allowMutations()) {
      test.skip(true, "Set PLAYWRIGHT_ALLOW_MUTATIONS=1 to run mutation tests");
    }

    if (!disposableHomeId) {
      test.skip(true, "Could not create disposable test home");
    }

    await gotoAppPage(page, `/homes/${disposableHomeId}`);
    await page.getByRole("button", { name: "이 집 삭제하기" }).click();

    const dialog = page.getByRole("dialog", { name: "이 집을 삭제할까요?" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("button", { name: "취소" })).toBeVisible();
    await dialog.getByRole("button", { name: "취소" }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1, name: "E2E 삭제 테스트" })).toBeVisible();
  });

  test("primary home with completed payments shows delete blocked message", async ({
    page,
  }) => {
    if (!allowMutations()) {
      test.skip(true, "Set PLAYWRIGHT_ALLOW_MUTATIONS=1 to run mutation tests");
    }

    if (!primaryHomeId) {
      test.skip(true, "No primary home for this account");
    }

    await gotoAppPage(page, `/homes/${primaryHomeId}`);
    await expect(
      page.getByText("완료된 납부 기록이 있어 이 집은 삭제할 수 없어요"),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "이 집 삭제하기" })).toHaveCount(0);
  });
});

test.describe("authenticated payment complete", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(async () => {
    if (!allowMutations()) {
      return;
    }

    const rentPaymentId = await preparePendingRentPaymentForTestUser();
    const maintenancePaymentId =
      await preparePendingMaintenancePaymentForTestUser();

    if (!rentPaymentId && !maintenancePaymentId) {
      throw new Error(
        "No rent or maintenance payments found for PLAYWRIGHT_TEST_EMAIL",
      );
    }
  });

  test.afterAll(async () => {
    await disconnectPaymentFixture();
  });

  test("shows loading and completes pending rent payment when allowed", async ({
    page,
  }) => {
    if (!allowMutations()) {
      test.skip(true, "Set PLAYWRIGHT_ALLOW_MUTATIONS=1 to run mutation tests");
    }

    const rentPaymentId = await preparePendingRentPaymentForTestUser();

    if (!rentPaymentId) {
      test.skip(true, "No rent payment record to reset for this account");
    }

    await gotoAppPage(page, "/rent");

    const completeButton = page.getByRole("button", { name: "납부하기" }).first();

    if ((await completeButton.count()) === 0) {
      test.skip(
        true,
        "No billable pending rent in UI — contract may be expired",
      );
    }

    const pendingBefore = await page.getByRole("button", { name: "납부하기" }).count();
    await expectSubmitWithFeedback(page, completeButton, "납부 완료했어요");

    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("button", { name: "납부하기" })).toHaveCount(
      pendingBefore - 1,
    );
  });

  test("shows loading and completes pending maintenance payment when allowed", async ({
    page,
  }) => {
    if (!allowMutations()) {
      test.skip(true, "Set PLAYWRIGHT_ALLOW_MUTATIONS=1 to run mutation tests");
    }

    const maintenancePaymentId = await preparePendingMaintenancePaymentForTestUser();

    if (!maintenancePaymentId) {
      test.skip(true, "No maintenance payment record to reset for this account");
    }

    await gotoAppPage(page, "/maintenance");

    const completeButton = page.getByRole("button", { name: "납부하기" }).first();

    if ((await completeButton.count()) === 0) {
      test.skip(true, "No pending maintenance payment to complete");
    }

    const pendingBefore = await page.getByRole("button", { name: "납부하기" }).count();
    await expectSubmitWithFeedback(page, completeButton, "납부 완료했어요");

    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("button", { name: "납부하기" })).toHaveCount(
      pendingBefore - 1,
    );
  });
});

for (const viewport of responsiveViewports) {
  test.describe(`authenticated responsive ${viewport.width}px`, () => {
    test.use({ viewport });

    for (const routePath of ["/dashboard", "/homes", "/rent", "/maintenance", "/expenses"] as const) {
      test(`${routePath} has no horizontal scroll`, async ({ page }) => {
        await gotoAppPage(page, routePath);

        if (page.url().includes("/login")) {
          test.fail(true, "Expected authenticated session");
        }

        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
        checkNoHorizontalScroll(scrollWidth, clientWidth);
      });
    }

    test("home detail has no horizontal scroll", async ({ page }) => {
      await gotoAppPage(page, "/homes");

      if (await page.getByText("아직 등록된 집이 없어요").isVisible()) {
        test.skip(true, "No homes registered for this account");
      }

      await page.locator(".ui-home-item").first().click();
      await page.waitForURL(/\/homes\/[^/]+$/);

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      checkNoHorizontalScroll(scrollWidth, clientWidth);
    });

    if (viewport.width <= 430) {
      test("payment tabs remain usable on mobile", async ({ page }) => {
        await gotoAppPage(page, "/rent");

        if (await page.getByText("등록된 집이 없어요").isVisible()) {
          test.skip(true, "Account has no homes — payment tabs unavailable");
        }

        await expectPaymentTabs(page, "월세");

        const tabNav = page.getByRole("navigation", { name: "납부 구분" });
        const tabBox = await tabNav.boundingBox();
        expect(tabBox?.width ?? 0).toBeGreaterThan(0);
      });

      test("delete dialog stays within viewport", async ({ page }) => {
        if (!allowMutations()) {
          test.skip(true, "Set PLAYWRIGHT_ALLOW_MUTATIONS=1 to run mutation tests");
        }

        const disposableHomeId = await createDisposableTestHome();

        if (!disposableHomeId) {
          test.skip(true, "Could not create disposable test home");
        }

        try {
          await gotoAppPage(page, `/homes/${disposableHomeId}`);
          await page.getByRole("button", { name: "이 집 삭제하기" }).click();

          const dialog = page.getByRole("dialog", { name: "이 집을 삭제할까요?" });
          await expect(dialog).toBeVisible();

          const dialogBox = await dialog.boundingBox();
          expect(dialogBox).not.toBeNull();
          expect(dialogBox!.x).toBeGreaterThanOrEqual(0);
          expect(dialogBox!.x + dialogBox!.width).toBeLessThanOrEqual(viewport.width + 1);

          await dialog.getByRole("button", { name: "취소" }).click();
        } finally {
          await deleteHomeById(disposableHomeId!).catch(() => undefined);
        }
      });
    }
  });
}

