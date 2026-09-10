import { expect, test } from "@playwright/test";
import {
  auditTestUserAmounts,
  disconnectAmountAudit,
  type AmountAuditResult,
} from "./helpers/amount-audit";
import { allowMutations } from "./helpers/env";
import {
  expectOverviewMatchesAudit,
  expectElementsFitViewport,
  readOverviewAmounts,
} from "./helpers/page-amounts";
import { disconnectPaymentFixture } from "./helpers/payment-fixture";
import {
  createDisposableTestHome,
  getContractForHome,
  getPrimaryHomeForTestUser,
  preparePendingUtilityPaymentForTestUser,
  restoreContractMaintenanceFee,
} from "./helpers/test-data-fixture";
import { expectSubmitWithFeedback, gotoAppPage } from "./helpers/ui";

let amountAudit: AmountAuditResult | null = null;

function formatWon(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}원`;
}

function contractPanel(page: import("@playwright/test").Page) {
  return page
    .getByRole("heading", { name: "계약" })
    .locator("xpath=ancestor::section[1]");
}

test.beforeAll(async () => {
  amountAudit = await auditTestUserAmounts();
});

test.afterAll(async () => {
  await disconnectAmountAudit();
  await disconnectPaymentFixture();
});

test.describe("STEP 38.5 dashboard flow", () => {
  test("shows greeting, overview, todo, and rent CTA", async ({ page }) => {
    test.skip(!amountAudit?.primaryHome, "No primary home for test account");

    await gotoAppPage(page, "/dashboard");

    const greeting = page.locator(".ui-greeting");
    await expect(greeting.locator(".ui-greeting-name")).toBeVisible();
    await expect(greeting.locator(".ui-greeting-name")).toContainText("님,");
    await expect(greeting.getByText(/대표 집/)).toHaveCount(0);

    await expect(page.getByText("이번 달 주거비").first()).toBeVisible();
    await expect(page.getByText("월세").first()).toBeVisible();
    await expect(page.getByText("관리비").first()).toBeVisible();
    await expect(page.getByText("공과금").first()).toBeVisible();

    const todoHeading = page.getByRole("heading", { name: "해야 할 일" });
    await expect(todoHeading).toBeVisible();

    const paymentLinks = page.getByRole("link", { name: "납부 관리하기" });
    await expect(paymentLinks.first()).toHaveAttribute("href", "/rent");

    if (amountAudit!.computed.scheduledCount > 0) {
      await expect(page.getByText("납부 예정일").first()).toBeVisible();
    }
  });
});

test.describe("STEP 38.5 amount consistency", () => {
  test("dashboard overview matches database audit totals", async ({ page }) => {
    test.skip(!amountAudit, "No test account audit data");

    await gotoAppPage(page, "/dashboard");
    await expectOverviewMatchesAudit(page, amountAudit!.computed);
  });

  for (const route of ["/rent", "/maintenance", "/expenses"] as const) {
    test(`${route} overview matches database audit totals`, async ({ page }) => {
      test.skip(!amountAudit, "No test account audit data");

      await gotoAppPage(page, route);
      await expectOverviewMatchesAudit(page, amountAudit!.computed);
    });
  }

  test("contract edit form matches primary home contract amounts", async ({ page }) => {
    test.skip(
      !amountAudit?.primaryHome?.contract,
      "No contract on primary home",
    );

    const contract = amountAudit!.primaryHome!.contract!;

    await gotoAppPage(
      page,
      `/homes/${amountAudit!.primaryHome!.id}/contract/edit`,
    );

    await expect(page.getByRole("textbox", { name: /월세/ })).toHaveValue(
      contract.monthlyRent.toLocaleString("ko-KR"),
    );
    await expect(page.getByRole("textbox", { name: /관리비/ })).toHaveValue(
      contract.maintenanceFee.toLocaleString("ko-KR"),
    );
  });

  test("grand total equals rent + maintenance + utility per policy", async () => {
    test.skip(!amountAudit, "No test account audit data");

    const { rentTotal, maintenanceTotal, utilityTotal, grandTotal } =
      amountAudit!.computed;

    expect(grandTotal).toBe(rentTotal + maintenanceTotal + utilityTotal);
  });
});

test.describe("STEP 38.5 cross-page contract sync", () => {
  test.describe.configure({ mode: "serial" });

  let primaryHomeId: string | null = null;
  let originalMaintenanceFee: number | null = null;

  test.beforeAll(async () => {
    if (!allowMutations()) {
      return;
    }

    const home = await getPrimaryHomeForTestUser();
    primaryHomeId = home?.id ?? null;

    if (primaryHomeId) {
      const contract = await getContractForHome(primaryHomeId);
      originalMaintenanceFee = contract?.maintenanceFee ?? null;
    }
  });

  test.afterAll(async () => {
    if (!allowMutations() || !primaryHomeId || originalMaintenanceFee === null) {
      return;
    }

    const contract = await getContractForHome(primaryHomeId);

    if (contract && contract.maintenanceFee !== originalMaintenanceFee) {
      await restoreContractMaintenanceFee(primaryHomeId, originalMaintenanceFee);
    }
  });

  test("maintenance fee change reflects on home detail and syncs across pages", async ({
    page,
  }) => {
    if (!allowMutations()) {
      test.skip(true, "Set PLAYWRIGHT_ALLOW_MUTATIONS=1 to run mutation tests");
    }

    test.skip(!primaryHomeId || originalMaintenanceFee === null, "No contract");

    const bumpedFee = originalMaintenanceFee! + 1_000;

    await gotoAppPage(page, `/homes/${primaryHomeId}/contract/edit`);
    await page
      .getByRole("textbox", { name: /관리비/ })
      .fill(bumpedFee.toLocaleString("ko-KR"));

    await expectSubmitWithFeedback(
      page,
      page.getByRole("button", { name: /저장하기|갱신하기/ }),
      "수정했어요",
    );

    await gotoAppPage(page, `/homes/${primaryHomeId}`);
    await page.reload();
    await page.waitForLoadState("networkidle");

    await expect(contractPanel(page).getByText(formatWon(bumpedFee))).toBeVisible();

    const maintenanceOverviewBefore = amountAudit!.computed.maintenanceTotal;

    await gotoAppPage(page, "/dashboard");
    const dashboardAmounts = await readOverviewAmounts(page);

    await gotoAppPage(page, "/maintenance");
    const maintenanceAmounts = await readOverviewAmounts(page);
    expect(dashboardAmounts.maintenance).toBe(maintenanceAmounts.maintenance);
    expect(dashboardAmounts.maintenance).toBe(maintenanceOverviewBefore);

    await gotoAppPage(page, `/homes/${primaryHomeId}/contract/edit`);
    await page
      .getByRole("textbox", { name: /관리비/ })
      .fill(originalMaintenanceFee!.toLocaleString("ko-KR"));
    await expectSubmitWithFeedback(
      page,
      page.getByRole("button", { name: /저장하기|갱신하기/ }),
      "수정했어요",
    );

    await gotoAppPage(page, `/homes/${primaryHomeId}`);
    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(
      contractPanel(page).getByText(formatWon(originalMaintenanceFee!)),
    ).toBeVisible();
  });
});

test.describe("STEP 38.5 delete flow", () => {
  test.describe.configure({ mode: "serial" });

  test("deletes disposable home with loading and toast", async ({ page }) => {
    if (!allowMutations()) {
      test.skip(true, "Set PLAYWRIGHT_ALLOW_MUTATIONS=1 to run mutation tests");
    }

    const disposableHomeId = await createDisposableTestHome();

    if (!disposableHomeId) {
      test.skip(true, "Could not create disposable home");
    }

    await gotoAppPage(page, `/homes/${disposableHomeId}`);
    await page.getByRole("button", { name: "이 집 삭제하기" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "취소" }).click();

    await page.getByRole("button", { name: "이 집 삭제하기" }).click();
    const deleteButton = page
      .getByRole("dialog")
      .getByRole("button", { name: "삭제하기" });

    await deleteButton.click();

    const loadingButton = page.getByRole("button", { name: "처리 중..." });
    const successToast = page.getByRole("status").filter({ hasText: "삭제했어요" });
    await expect(loadingButton.or(successToast)).toBeVisible({ timeout: 15_000 });
    await expect(successToast).toBeVisible({ timeout: 15_000 });

    await page.waitForURL(/\/homes$/);
    await expect(page.getByRole("heading", { name: "E2E 삭제 테스트" })).toHaveCount(0);
  });
});

test.describe("STEP 38.5 utility payment complete", () => {
  test("completes pending utility expense when available", async ({ page }) => {
    if (!allowMutations()) {
      test.skip(true, "Set PLAYWRIGHT_ALLOW_MUTATIONS=1 to run mutation tests");
    }

    const utilityPaymentId = await preparePendingUtilityPaymentForTestUser();

    if (!utilityPaymentId) {
      test.skip(true, "No utility payment to complete");
    }

    await gotoAppPage(page, "/expenses");

    const completeButton = page.getByRole("button", { name: "납부하기" }).first();

    if ((await completeButton.count()) === 0) {
      test.skip(true, "No pending utility payment button in UI");
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

const responsiveViewports = [
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
] as const;

for (const viewport of responsiveViewports) {
  test.describe(`STEP 38.5 responsive ${viewport.width}px`, () => {
    test.use({ viewport });

    test("dashboard key elements fit viewport", async ({ page }) => {
      await gotoAppPage(page, "/dashboard");

      const selectors = [
        ".ui-greeting-name",
        ".ui-summary-total",
        ".ui-stat-grid",
      ];

      if (viewport.width >= 768) {
        selectors.push("header");
      } else {
        selectors.push('nav[aria-label="주요 메뉴"]');
      }

      await expectElementsFitViewport(page, selectors, viewport.width);
    });

    test("home detail and payment tabs fit viewport", async ({ page }) => {
      await gotoAppPage(page, "/homes");

      if (await page.getByText("아직 등록된 집이 없어요").isVisible()) {
        test.skip(true, "No homes");
      }

      await page.locator(".ui-home-item").first().click();
      await page.waitForURL(/\/homes\/[^/]+$/);

      const detailSelectors = [".ui-page-title", ".ui-home-address"];

      if (viewport.width >= 768) {
        detailSelectors.push("header");
      } else {
        detailSelectors.push('nav[aria-label="주요 메뉴"]');
      }

      await expectElementsFitViewport(page, detailSelectors, viewport.width);

      await gotoAppPage(page, "/maintenance");
      await expectElementsFitViewport(
        page,
        ['nav[aria-label="납부 구분"]', ".ui-summary-total"],
        viewport.width,
      );

      await gotoAppPage(page, "/expenses");
      await expectElementsFitViewport(
        page,
        ['nav[aria-label="납부 구분"]', ".ui-summary-total"],
        viewport.width,
      );
    });
  });
}

test.describe("STEP 38.5 logout", () => {
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
