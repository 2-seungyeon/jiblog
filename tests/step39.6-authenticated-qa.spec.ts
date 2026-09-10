import { expect, test } from "@playwright/test";
import { gotoAppPage } from "./helpers/ui";
import {
  assertNoHorizontalOverflow,
  assertNoHorizontalScroll,
  assertWithinViewport,
} from "./helpers/viewport-qa";

function formatWon(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}원`;
}

async function getGridColumnCount(
  page: import("@playwright/test").Page,
  selector = ".ui-stat-grid",
): Promise<number> {
  const columns = await page
    .locator(selector)
    .first()
    .evaluate((element) => getComputedStyle(element).gridTemplateColumns);

  return columns.split(" ").filter(Boolean).length;
}

async function assertDashboardStatRowLayout(
  page: import("@playwright/test").Page,
): Promise<void> {
  const cells = page.locator(".ui-stat-grid-dashboard .ui-stat-cell");

  for (const cell of await cells.all()) {
    const labelBox = await cell.locator(".ui-stat-cell-label").boundingBox();
    const valueBox = await cell.locator(".ui-stat-cell-value").boundingBox();
    expect(labelBox).not.toBeNull();
    expect(valueBox).not.toBeNull();

    if (labelBox && valueBox) {
      expect(Math.abs(valueBox.y - labelBox.y)).toBeLessThanOrEqual(8);
      expect(valueBox.x).toBeGreaterThan(labelBox.x);
    }

    const valueText = await cell.locator(".ui-stat-cell-value").innerText();
    expect(valueText).toMatch(/^[\d,]+원$|^—$/);
    expect(valueText).not.toMatch(/\n\s*원$/);

    const whiteSpace = await cell
      .locator(".ui-stat-cell-value")
      .evaluate((element) => getComputedStyle(element).whiteSpace);
    expect(whiteSpace).toBe("nowrap");
  }
}

const STACKED_WIDTHS = [320, 360, 375] as const;
const GRID_WIDTHS = [390, 430] as const;

for (const width of STACKED_WIDTHS) {
  test.describe(`STEP 39.6 dashboard breakdown ${width}px`, () => {
    test.use({ viewport: { width, height: 812 } });

    test("stacks in one column with label left and amount right", async ({ page }) => {
      await gotoAppPage(page, "/dashboard");
      await expect(page.locator(".ui-stat-grid-dashboard")).toBeVisible();
      expect(await getGridColumnCount(page, ".ui-stat-grid-dashboard")).toBe(1);
      await assertDashboardStatRowLayout(page);
      await assertNoHorizontalScroll(page);
    });
  });
}

for (const width of GRID_WIDTHS) {
  test.describe(`STEP 39.6 dashboard breakdown ${width}px`, () => {
    test.use({ viewport: { width, height: 812 } });

    test("keeps three-column breakdown", async ({ page }) => {
      await gotoAppPage(page, "/dashboard");
      expect(await getGridColumnCount(page, ".ui-stat-grid-dashboard")).toBe(3);
      await assertNoHorizontalScroll(page);
    });
  });
}

test.describe("STEP 39.6 regression — payment pages keep default stat grid", () => {
  test.use({ viewport: { width: 320, height: 812 } });

  for (const path of ["/rent", "/maintenance", "/expenses"] as const) {
    test(`${path} keeps three-column overview`, async ({ page }) => {
      await gotoAppPage(page, path);
      const grid = page.locator(".ui-stat-grid").first();
      await expect(grid).toBeVisible();
      await expect(grid).not.toHaveClass(/ui-stat-grid-dashboard/);
      expect(await getGridColumnCount(page)).toBe(3);
      await assertNoHorizontalScroll(page);
    });
  }
});

test.describe("STEP 39.6 dashboard amount stress", () => {
  test.use({ viewport: { width: 320, height: 812 } });

  const stressAmounts = [
    800_000,
    1_112_400,
    10_000_000,
    100_000_000,
    1_000_000_000,
  ] as const;

  for (const amount of stressAmounts) {
    test(`overview renders ${amount.toLocaleString("ko-KR")} without overflow`, async ({
      page,
    }) => {
      await gotoAppPage(page, "/dashboard");

      await page.locator(".ui-stat-grid-dashboard .ui-stat-cell-value").nth(0).evaluate(
        (element, formatted) => {
          element.textContent = formatted;
        },
        formatWon(amount),
      );

      const value = page.locator(".ui-stat-grid-dashboard .ui-stat-cell-value").nth(0);
      await assertWithinViewport(value, 320);
      await expect(value).toHaveText(formatWon(amount));
      await assertDashboardStatRowLayout(page);
      await assertNoHorizontalScroll(page);
    });
  }
});

test.describe("STEP 39.6 layout regression at 320px", () => {
  test.use({ viewport: { width: 320, height: 812 } });

  for (const [path, label] of [
    ["/homes", "내 집"],
    ["/maintenance", "관리비"],
    ["/expenses", "공과금"],
  ] as const) {
    test(`${label} page has no horizontal overflow`, async ({ page }) => {
      await gotoAppPage(page, path);
      await assertNoHorizontalScroll(page);

      const statGrid = page.locator(".ui-stat-grid").first();
      if ((await statGrid.count()) > 0) {
        await expect(statGrid).not.toHaveClass(/ui-stat-grid-dashboard/);
        await assertNoHorizontalOverflow(statGrid, 320);
      }
    });
  }

  test("home detail page has no horizontal overflow", async ({ page }) => {
    await gotoAppPage(page, "/homes");
    const homeLink = page.locator('a[href^="/homes/"]:not([href="/homes/new"])').first();
    await expect(homeLink).toBeVisible();
    await homeLink.click();
    await page.waitForLoadState("networkidle");
    await assertNoHorizontalScroll(page);
  });

  test("dashboard uses dashboard-only stat grid class", async ({ page }) => {
    await gotoAppPage(page, "/dashboard");
    await expect(page.locator(".ui-stat-grid-dashboard")).toBeVisible();
    await assertNoHorizontalScroll(page);
  });
});
