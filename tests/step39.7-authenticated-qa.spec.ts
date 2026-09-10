import { expect, test } from "@playwright/test";
import { gotoAppPage } from "./helpers/ui";
import {
  assertNoHorizontalOverflow,
  assertNoHorizontalScroll,
  assertWithinViewport,
} from "./helpers/viewport-qa";

const PAYMENT_PATHS = ["/rent", "/maintenance", "/expenses"] as const;

function formatWon(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}원`;
}

async function getGridColumnCount(
  page: import("@playwright/test").Page,
  selector: string,
): Promise<number> {
  const columns = await page
    .locator(selector)
    .first()
    .evaluate((element) => getComputedStyle(element).gridTemplateColumns);

  return columns.split(" ").filter(Boolean).length;
}

async function assertPaymentStatRowLayout(
  page: import("@playwright/test").Page,
): Promise<void> {
  const cells = page.locator(".ui-stat-grid-payment .ui-stat-cell");

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
  test.describe(`STEP 39.7 payment overview ${width}px`, () => {
    test.use({ viewport: { width, height: 812 } });

    for (const path of PAYMENT_PATHS) {
      test(`${path} stacks breakdown in one column`, async ({ page }) => {
        await gotoAppPage(page, path);
        const grid = page.locator(".ui-stat-grid-payment").first();
        await expect(grid).toBeVisible();
        await expect(grid).not.toHaveClass(/ui-stat-grid-dashboard/);
        expect(await getGridColumnCount(page, ".ui-stat-grid-payment")).toBe(1);
        await assertPaymentStatRowLayout(page);
        await assertNoHorizontalScroll(page);
        await assertNoHorizontalOverflow(grid, width);
      });
    }
  });
}

for (const width of GRID_WIDTHS) {
  test.describe(`STEP 39.7 payment overview ${width}px`, () => {
    test.use({ viewport: { width, height: 812 } });

    for (const path of PAYMENT_PATHS) {
      test(`${path} keeps three-column breakdown`, async ({ page }) => {
        await gotoAppPage(page, path);
        expect(await getGridColumnCount(page, ".ui-stat-grid-payment")).toBe(3);
        await assertNoHorizontalScroll(page);
      });
    }
  });
}

test.describe("STEP 39.7 payment amount stress", () => {
  test.use({ viewport: { width: 320, height: 812 } });

  const stressAmounts = [
    800_000,
    1_112_400,
    10_000_000,
    100_000_000,
    1_000_000_000,
  ] as const;

  for (const amount of stressAmounts) {
    test(`rent overview renders ${amount.toLocaleString("ko-KR")} without overflow`, async ({
      page,
    }) => {
      await gotoAppPage(page, "/rent");

      await page.locator(".ui-stat-grid-payment .ui-stat-cell-value").nth(0).evaluate(
        (element, formatted) => {
          element.textContent = formatted;
        },
        formatWon(amount),
      );

      const value = page.locator(".ui-stat-grid-payment .ui-stat-cell-value").nth(0);
      await assertWithinViewport(value, 320);
      await expect(value).toHaveText(formatWon(amount));
      await assertPaymentStatRowLayout(page);
      await assertNoHorizontalScroll(page);
    });
  }
});

for (const width of [...STACKED_WIDTHS, ...GRID_WIDTHS] as const) {
  test.describe(`STEP 39.7 dashboard regression ${width}px`, () => {
    test.use({ viewport: { width, height: 812 } });

    test("dashboard layout unchanged from STEP 39.6", async ({ page }) => {
      await gotoAppPage(page, "/dashboard");
      await expect(page.locator(".ui-stat-grid-dashboard")).toBeVisible();
      await expect(page.locator(".ui-stat-grid-payment")).toHaveCount(0);

      const expectedColumns = width <= 375 ? 1 : 3;
      expect(await getGridColumnCount(page, ".ui-stat-grid-dashboard")).toBe(expectedColumns);
      await assertNoHorizontalScroll(page);
    });
  });
}
