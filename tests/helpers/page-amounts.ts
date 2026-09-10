import { expect, type Page } from "@playwright/test";

export function parseWonText(text: string): number | null {
  const match = text.replace(/\s/g, "").match(/([\d,]+)원/);

  if (!match) {
    return null;
  }

  return Number(match[1].replace(/,/g, ""));
}

export async function readOverviewAmounts(page: Page): Promise<{
  total: number | null;
  rent: number | null;
  maintenance: number | null;
  utility: number | null;
}> {
  const totalText = await page.locator(".ui-summary-total").first().textContent();
  const cells = page.locator(".ui-stat-cell-value");
  const rentText = await cells.nth(0).textContent();
  const maintenanceText = await cells.nth(1).textContent();
  const utilityText = await cells.nth(2).textContent();

  return {
    total: totalText ? parseWonText(totalText) : null,
    rent: rentText && rentText !== "—" ? parseWonText(rentText) : 0,
    maintenance:
      maintenanceText && maintenanceText !== "—"
        ? parseWonText(maintenanceText)
        : 0,
    utility:
      utilityText && utilityText !== "—" ? parseWonText(utilityText) : 0,
  };
}

export async function expectOverviewMatchesAudit(
  page: Page,
  audit: {
    rentTotal: number;
    maintenanceTotal: number;
    utilityTotal: number;
    grandTotal: number;
  },
): Promise<void> {
  const overview = await readOverviewAmounts(page);

  expect(overview.rent).toBe(audit.rentTotal);
  expect(overview.maintenance).toBe(audit.maintenanceTotal);
  expect(overview.utility).toBe(audit.utilityTotal);
  expect(overview.total).toBe(audit.grandTotal);
}

export async function expectElementsFitViewport(
  page: Page,
  selectors: string[],
  viewportWidth: number,
): Promise<void> {
  for (const selector of selectors) {
    const element = page.locator(selector).first();

    if ((await element.count()) === 0) {
      continue;
    }

    if (!(await element.isVisible())) {
      continue;
    }

    await expect(element).toBeVisible();
    const box = await element.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(-1);
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewportWidth + 1);
  }
}
