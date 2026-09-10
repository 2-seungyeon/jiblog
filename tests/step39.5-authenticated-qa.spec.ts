import { expect, test } from "@playwright/test";
import { allowMutations } from "./helpers/env";
import { expectElementsFitViewport } from "./helpers/page-amounts";
import {
  getPrimaryHomeForTestUser,
  createDisposableTestHome,
} from "./helpers/test-data-fixture";
import {
  disconnectStressFixture,
  getContractStressSnapshot,
  getHomeDisplaySnapshot,
  updateContractDeposit,
  updateHomeDisplayFields,
  type ContractStressSnapshot,
  type HomeDisplaySnapshot,
} from "./helpers/stress-fixture";
import { gotoAppPage } from "./helpers/ui";
import {
  assertNoHorizontalOverflow,
  assertNoHorizontalScroll,
  assertWithinViewport,
} from "./helpers/viewport-qa";

const MOBILE_320 = { width: 320, height: 568 } as const;

const REGRESSION_WIDTHS = [375, 390, 430] as const;

const LONG_HOME_NAME = "서울 가양동 장기거주 테스트 아파트";
const LONG_ADDRESS = "서울특별시 강서구 양천로 000길 00 테스트아파트 101동 1001호";

function formatWon(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}원`;
}

test.afterAll(async () => {
  await disconnectStressFixture();
});

test.describe("STEP 39.5 320px journey", () => {
  test.use({ viewport: MOBILE_320 });

  test("service flow has no horizontal scroll", async ({ page }) => {
    const routes = [
      "/dashboard",
      "/homes",
      "/rent",
      "/maintenance",
      "/expenses",
      "/expenses/new",
    ] as const;

    for (const route of routes) {
      await gotoAppPage(page, route);
      await assertNoHorizontalScroll(page);
    }

    await gotoAppPage(page, "/homes");
    if (!(await page.getByText("아직 등록된 집이 없어요").isVisible())) {
      await page.locator(".ui-home-item").first().click();
      await page.waitForURL(/\/homes\/[^/]+$/);
      await assertNoHorizontalScroll(page);
    }
  });
});

test.describe("STEP 39.5 320px dashboard amounts", () => {
  test.use({ viewport: MOBILE_320 });

  test("shows grand total and breakdown within viewport", async ({ page }) => {
    await gotoAppPage(page, "/dashboard");

    const total = page.locator(".ui-summary-total").first();
    await assertWithinViewport(total, MOBILE_320.width);
    await expect(total).toContainText("원");

    for (const cell of await page.locator(".ui-stat-cell-value").all()) {
      await assertNoHorizontalOverflow(cell, MOBILE_320.width);
    }

    await assertNoHorizontalScroll(page);
  });
});

test.describe("STEP 39.5 320px payment tabs", () => {
  test.use({ viewport: MOBILE_320 });

  for (const tab of ["월세", "관리비", "공과금"] as const) {
    test(`${tab} tab fits viewport with readable target`, async ({ page }) => {
      await gotoAppPage(page, tab === "월세" ? "/rent" : tab === "관리비" ? "/maintenance" : "/expenses");

      const tabNav = page.locator('nav[aria-label="납부 구분"]');
      await assertWithinViewport(tabNav, MOBILE_320.width);

      const tabLink = tabNav.getByRole("link", { name: tab });
      await expect(tabLink).toBeVisible();
      const box = await tabLink.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(40);

      await assertNoHorizontalScroll(page);
    });
  }
});

test.describe("STEP 39.5 320px navigation", () => {
  test.use({ viewport: MOBILE_320 });

  test("bottom navigation items fit viewport", async ({ page }) => {
    await gotoAppPage(page, "/dashboard");

    const bottomNav = page.locator('nav[aria-label="하단 메뉴"]');
    await assertWithinViewport(bottomNav, MOBILE_320.width);

    for (const label of ["홈", "내 집", "납부", "로그아웃"]) {
      await expect(bottomNav.getByText(label, { exact: true })).toBeVisible();
    }

    await assertNoHorizontalScroll(page);
  });
});

test.describe("STEP 39.5 320px dialog and toast", () => {
  test.use({ viewport: MOBILE_320 });

  test("delete dialog and success toast stay within viewport", async ({ page }) => {
    if (!allowMutations()) {
      test.skip(true, "Set PLAYWRIGHT_ALLOW_MUTATIONS=1 to run mutation tests");
    }

    const disposableHomeId = await createDisposableTestHome();
    test.skip(!disposableHomeId, "Could not create disposable home");

    await gotoAppPage(page, `/homes/${disposableHomeId}`);
    await page.getByRole("button", { name: "이 집 삭제하기" }).click();

    const dialog = page.getByRole("dialog");
    await assertWithinViewport(dialog, MOBILE_320.width);
    await expect(dialog.getByRole("button", { name: "취소" })).toBeVisible();
    await expect(dialog.getByRole("button", { name: "삭제하기" })).toBeVisible();

    await dialog.getByRole("button", { name: "취소" }).click();

    await gotoAppPage(page, `/homes/${disposableHomeId}/edit`);
    await page.getByRole("textbox", { name: /메모/ }).fill("320 toast QA");
    await page.getByRole("button", { name: /저장하기/ }).click();

    const toast = page.locator(".ui-toast").first();
    await expect(toast).toBeVisible();
    await assertWithinViewport(toast, MOBILE_320.width);

    const bottomNavBox = await page.locator('nav[aria-label="하단 메뉴"]').boundingBox();
    const toastBox = await toast.boundingBox();
    expect(bottomNavBox).not.toBeNull();
    expect(toastBox).not.toBeNull();

    if (bottomNavBox && toastBox) {
      expect(toastBox.y + toastBox.height).toBeLessThanOrEqual(bottomNavBox.y + 2);
    }
  });
});

test.describe("STEP 39.5 stress layout", () => {
  test.describe.configure({ mode: "serial" });
  test.use({ viewport: MOBILE_320 });

  let primaryHomeId: string | null = null;
  let originalHome: HomeDisplaySnapshot | null = null;
  let originalContract: ContractStressSnapshot | null = null;

  test.beforeAll(async () => {
    if (!allowMutations()) {
      return;
    }

    const home = await getPrimaryHomeForTestUser();
    primaryHomeId = home?.id ?? null;

    if (primaryHomeId) {
      originalHome = await getHomeDisplaySnapshot(primaryHomeId);
      originalContract = await getContractStressSnapshot(primaryHomeId);
    }
  });

  test.afterAll(async () => {
    if (!allowMutations() || !primaryHomeId) {
      return;
    }

    if (originalHome) {
      await updateHomeDisplayFields(primaryHomeId, originalHome);
    }

    if (originalContract) {
      await updateContractDeposit(primaryHomeId, originalContract.deposit);
    }
  });

  for (const deposit of [10_000_000, 100_000_000, 1_000_000_000] as const) {
    test(`home detail shows deposit ${deposit.toLocaleString("ko-KR")} without overflow`, async ({
      page,
    }) => {
      if (!allowMutations()) {
        test.skip(true, "Set PLAYWRIGHT_ALLOW_MUTATIONS=1 to run mutation tests");
      }

      test.skip(!primaryHomeId, "No primary home");

      await updateContractDeposit(primaryHomeId!, deposit);
      await gotoAppPage(page, `/homes/${primaryHomeId}`);
      await page.reload();
      await page.waitForLoadState("networkidle");

      const depositText = page.getByText(formatWon(deposit), { exact: true });
      await assertWithinViewport(depositText, MOBILE_320.width);
      await assertNoHorizontalScroll(page);
    });
  }

  test("long home name and address render without overflow", async ({ page }) => {
    if (!allowMutations()) {
      test.skip(true, "Set PLAYWRIGHT_ALLOW_MUTATIONS=1 to run mutation tests");
    }

    test.skip(!primaryHomeId, "No primary home");

    await updateHomeDisplayFields(primaryHomeId!, {
      nickname: LONG_HOME_NAME,
      address: LONG_ADDRESS,
    });

    await gotoAppPage(page, "/homes");
    const primaryCard = page.locator(".ui-home-item").filter({ hasText: "대표" }).first();
    await assertWithinViewport(primaryCard, MOBILE_320.width);
    await expect(primaryCard.getByText("대표", { exact: true })).toBeVisible();

    await primaryCard.click();
    await page.waitForURL(/\/homes\/[^/]+$/);
    await expect(page.getByText(LONG_ADDRESS)).toBeVisible();
    await assertNoHorizontalScroll(page);
  });

  test("contract edit MoneyInput accepts large amount", async ({ page }) => {
    if (!allowMutations()) {
      test.skip(true, "Set PLAYWRIGHT_ALLOW_MUTATIONS=1 to run mutation tests");
    }

    test.skip(!primaryHomeId, "No primary home");

    await gotoAppPage(page, `/homes/${primaryHomeId}/contract/edit`);

    const rentInput = page.getByRole("textbox", { name: /월세/ });
    await rentInput.fill("1,000,000,000");
    await assertWithinViewport(rentInput, MOBILE_320.width);
    await assertNoHorizontalScroll(page);
  });
});

for (const width of REGRESSION_WIDTHS) {
  test.describe(`STEP 39.5 regression ${width}px`, () => {
    test.use({ viewport: { width, height: 812 } });

    test("dashboard and payment tabs have no horizontal scroll", async ({ page }) => {
      await gotoAppPage(page, "/dashboard");
      await assertNoHorizontalScroll(page);

      await gotoAppPage(page, "/rent");
      await assertNoHorizontalScroll(page);

      await expectElementsFitViewport(
        page,
        ['nav[aria-label="납부 구분"]', ".ui-summary-total"],
        width,
      );
    });
  });
}

for (const width of [340, 360, 414] as const) {
  test.describe(`STEP 39.5 breakpoint ${width}px`, () => {
    test.use({ viewport: { width, height: 812 } });

    test("payment tabs and dashboard amounts fit", async ({ page }) => {
      await gotoAppPage(page, "/dashboard");
      await assertNoHorizontalScroll(page);
      await assertWithinViewport(page.locator(".ui-summary-total").first(), width);

      await gotoAppPage(page, "/rent");
      await assertNoHorizontalScroll(page);
      await assertWithinViewport(page.locator('nav[aria-label="납부 구분"]'), width);
    });
  });
}
