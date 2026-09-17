import { expect, test } from "@playwright/test";
import { allowMutations } from "./helpers/env";
import {
  preparePendingMaintenancePaymentForTestUser,
  preparePendingRentPaymentForTestUser,
} from "./helpers/test-data-fixture";
import { completePaymentViaDialog, expectSubmitWithFeedback, gotoAppPage } from "./helpers/ui";

test.describe("STEP 47 payment cancel UI", () => {
  test("completed rent payment shows cancel button", async ({ page }) => {
    await gotoAppPage(page, "/rent");

    const cancelButton = page.getByRole("button", { name: "납부 취소" }).first();
    if ((await cancelButton.count()) === 0) {
      test.skip(true, "No completed rent payment visible in list");
    }

    await expect(cancelButton).toBeVisible();
  });

  test("cancels completed rent payment back to pending", async ({ page }) => {
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
      test.skip(true, "No billable pending rent in UI");
    }

    await completePaymentViaDialog(page, completeButton);

    const cancelButton = page.getByRole("button", { name: "납부 취소" }).first();
    await expect(cancelButton).toBeVisible();
    await expectSubmitWithFeedback(page, cancelButton, "납부 취소했어요");

    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("button", { name: "납부하기" }).first()).toBeVisible();
  });

  test("cancels completed maintenance payment back to pending", async ({ page }) => {
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

    await completePaymentViaDialog(page, completeButton);

    const cancelButton = page.getByRole("button", { name: "납부 취소" }).first();
    await expectSubmitWithFeedback(page, cancelButton, "납부 취소했어요");

    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("button", { name: "납부하기" }).first()).toBeVisible();
  });
});
