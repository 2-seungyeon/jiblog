import { expect, test } from "@playwright/test";
import {
  needsMaintenanceDueDay,
  needsRentDueDay,
  resolveContractDueDays,
} from "../lib/utils/contract-due-day";
import {
  disconnectTestDataFixture,
  getPrimaryHomeForTestUser,
  preparePendingMaintenancePaymentForHome,
  preparePendingRentPaymentForHome,
  restoreMaintenancePaymentSnapshot,
  restoreRentPaymentSnapshot,
} from "./helpers/test-data-fixture";
import { gotoAppPage } from "./helpers/ui";

test.describe("STEP 43 contract due day rules", () => {
  test("requires rent due day only for monthly contracts with rent", () => {
    expect(needsRentDueDay("월세", 500_000)).toBe(true);
    expect(needsRentDueDay("전세", 0)).toBe(false);
    expect(needsRentDueDay("월세", 0)).toBe(false);
  });

  test("requires maintenance due day only when maintenance fee exists", () => {
    expect(needsMaintenanceDueDay(80_000)).toBe(true);
    expect(needsMaintenanceDueDay(0)).toBe(false);
  });

  test("accepts separate rent and maintenance due days", () => {
    const result = resolveContractDueDays({
      contractType: "월세",
      monthlyRent: 500_000,
      maintenanceFee: 80_000,
      rentDueDayValue: "25",
      maintenanceDueDayValue: "10",
    });

    expect(result.errors).toEqual({});
    expect(result.rentDueDay).toBe(25);
    expect(result.maintenanceDueDay).toBe(10);
  });

  test("skips maintenance due day validation when maintenance fee is zero", () => {
    const result = resolveContractDueDays({
      contractType: "월세",
      monthlyRent: 500_000,
      maintenanceFee: 0,
      rentDueDayValue: "25",
      maintenanceDueDayValue: "",
    });

    expect(result.errors).toEqual({});
    expect(result.rentDueDay).toBe(25);
    expect(result.maintenanceDueDay).toBe(5);
  });

  test("requires rent due day input for monthly contracts", () => {
    const result = resolveContractDueDays({
      contractType: "월세",
      monthlyRent: 500_000,
      maintenanceFee: 0,
      rentDueDayValue: "",
      maintenanceDueDayValue: "",
    });

    expect(result.errors.rentDueDay).toBe("납부 예정일을 입력해주세요");
  });
});

test.describe("STEP 43 contract due days UI", () => {
  test("contract edit form includes separate rent and maintenance due day fields", async ({
    page,
  }) => {
    const home = await getPrimaryHomeForTestUser();
    test.skip(!home, "No authenticated test home");

    await gotoAppPage(page, `/homes/${home!.id}/contract/edit`);

    await expect(page.getByRole("spinbutton", { name: /월세 납부일/ })).toBeVisible();

    const maintenanceDueDay = page.getByRole("spinbutton", { name: /관리비 납부일/ });
    if ((await maintenanceDueDay.count()) > 0) {
      await expect(maintenanceDueDay).toBeVisible();
    }
  });

  test("jeonse contract hides rent due day field", async ({ page }) => {
    const home = await getPrimaryHomeForTestUser();
    test.skip(!home, "No authenticated test home");

    await gotoAppPage(page, `/homes/${home!.id}/contract/edit`);
    await page.getByLabel("계약 유형").click();
    await page.getByRole("option", { name: "전세", exact: true }).click();

    await expect(page.getByRole("spinbutton", { name: /월세 납부일/ })).toHaveCount(0);
    await expect(page.getByLabel("월세")).toBeDisabled();
    await expect(
      page.locator(".opacity-40").filter({ has: page.getByLabel("월세") }).first(),
    ).toBeVisible();
  });

  test("maintenance due day appears only when maintenance fee is entered", async ({ page }) => {
    const home = await getPrimaryHomeForTestUser();
    test.skip(!home, "No authenticated test home");

    await gotoAppPage(page, `/homes/${home!.id}/contract/edit`);

    const maintenanceFeeInput = page.getByRole("textbox", { name: "관리비", exact: true });
    await maintenanceFeeInput.click();
    await page.keyboard.press("Control+A");
    await page.keyboard.press("Backspace");
    await expect(page.getByRole("spinbutton", { name: /관리비 납부일/ })).toHaveCount(0);

    await maintenanceFeeInput.pressSequentially("80000");
    await expect(page.getByRole("spinbutton", { name: /관리비 납부일/ })).toBeVisible();
  });

  test("home detail shows rent and maintenance due day rows when applicable", async ({
    page,
  }) => {
    const home = await getPrimaryHomeForTestUser();
    test.skip(!home, "No authenticated test home");

    await gotoAppPage(page, `/homes/${home!.id}`);

    const rentDueDayRow = page.getByText("월세 납부 예정일");
    const maintenanceDueDayRow = page.getByText("관리비 납부 예정일");

    if ((await rentDueDayRow.count()) === 0 && (await maintenanceDueDayRow.count()) === 0) {
      test.skip(true, "Primary home has no billable contract amounts");
    }

    if ((await rentDueDayRow.count()) > 0) {
      await expect(rentDueDayRow).toBeVisible();
      await expect(page.getByText(/매월 \d+일 \(납부 예정\)/).first()).toBeVisible();
    }

    if ((await maintenanceDueDayRow.count()) > 0) {
      await expect(maintenanceDueDayRow).toBeVisible();
    }
  });

  test("rent and maintenance pages reflect their contract due days", async ({ page }) => {
    const home = await getPrimaryHomeForTestUser();
    test.skip(!home, "No authenticated test home");

    const rentSnapshot = await preparePendingRentPaymentForHome(home!.id);
    const maintenanceSnapshot = await preparePendingMaintenancePaymentForHome(home!.id);

    try {
      await gotoAppPage(page, `/homes/${home!.id}`);

      const rentDueDayText = await page
        .locator(".ui-detail-row")
        .filter({ hasText: "월세 납부 예정일" })
        .textContent()
        .catch(() => null);
      const maintenanceDueDayText = await page
        .locator(".ui-detail-row")
        .filter({ hasText: "관리비 납부 예정일" })
        .textContent()
        .catch(() => null);

      const rentDueDay = rentDueDayText?.match(/매월 (\d+)일/)?.[1];
      const maintenanceDueDay = maintenanceDueDayText?.match(/매월 (\d+)일/)?.[1];

      test.skip(!rentDueDay && !maintenanceDueDay, "No due day rows on home detail");

      if (rentDueDay) {
        expect(rentSnapshot).not.toBeNull();
        await gotoAppPage(page, "/rent");
        await expect(
          page.getByText(new RegExp(`납부 예정일 .*${rentDueDay}일`)).first(),
        ).toBeVisible();
      }

      if (maintenanceDueDay) {
        expect(maintenanceSnapshot).not.toBeNull();
        await gotoAppPage(page, "/maintenance");
        await expect(
          page.getByText(new RegExp(`납부 예정일 .*${maintenanceDueDay}일`)).first(),
        ).toBeVisible();
      }
    } finally {
      if (rentSnapshot) {
        await restoreRentPaymentSnapshot(rentSnapshot);
      }
      if (maintenanceSnapshot) {
        await restoreMaintenancePaymentSnapshot(maintenanceSnapshot);
      }
      await disconnectTestDataFixture();
    }
  });
});
