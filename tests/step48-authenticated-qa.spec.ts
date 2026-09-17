import { expect, test } from "@playwright/test";
import { normalizePaymentMemo, PAYMENT_MEMO_MAX_LENGTH } from "../lib/utils/payment-record";
import { parseCompletePaymentDetails } from "../lib/utils/complete-payment";
import { allowMutations } from "./helpers/env";
import { preparePendingRentPaymentForTestUser } from "./helpers/test-data-fixture";
import { expectSubmitWithFeedback, gotoAppPage } from "./helpers/ui";

test.describe("STEP 48 complete payment details helpers", () => {
  test("parses paidAt and memo", () => {
    const parsed = parseCompletePaymentDetails({
      paidAt: "2026-03-15",
      memo: "  카카오 송금 ",
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.paidAt).toBe("2026-03-15");
      expect(parsed.data.memo).toBe("카카오 송금");
    }
  });

  test("normalizes memo length", () => {
    const longMemo = "가".repeat(PAYMENT_MEMO_MAX_LENGTH + 10);
    expect(normalizePaymentMemo(longMemo)?.length).toBe(PAYMENT_MEMO_MAX_LENGTH);
  });
});

test.describe("STEP 48 payment complete dialog UI", () => {
  test("opens dialog from rent payment list", async ({ page }) => {
    if (!allowMutations()) {
      test.skip(true, "Set PLAYWRIGHT_ALLOW_MUTATIONS=1 to run mutation tests");
    }

    const rentPaymentId = await preparePendingRentPaymentForTestUser();

    if (!rentPaymentId) {
      test.skip(true, "No rent payment record to prepare for this account");
    }

    await gotoAppPage(page, "/rent");

    const openButton = page.getByRole("button", { name: "납부하기" }).first();
    if ((await openButton.count()) === 0) {
      test.skip(true, "No billable pending rent in UI");
    }

    await openButton.click();
    await expect(page.getByRole("heading", { name: "납부 완료 처리" })).toBeVisible();
    await expect(page.getByLabel("실제 납부일")).toBeVisible();
    await expect(page.getByLabel("메모 (선택)")).toBeVisible();
  });

  test("completes rent payment with memo", async ({ page }) => {
    if (!allowMutations()) {
      test.skip(true, "Set PLAYWRIGHT_ALLOW_MUTATIONS=1 to run mutation tests");
    }

    const rentPaymentId = await preparePendingRentPaymentForTestUser();

    if (!rentPaymentId) {
      test.skip(true, "No rent payment record to reset for this account");
    }

    const testMemo = `E2E memo ${Date.now()}`;

    await gotoAppPage(page, "/rent");

    const openButton = page.getByRole("button", { name: "납부하기" }).first();
    if ((await openButton.count()) === 0) {
      test.skip(true, "No billable pending rent in UI");
    }

    await openButton.click();
    await page.getByLabel("메모 (선택)").fill(testMemo);
    await expectSubmitWithFeedback(
      page,
      page.getByRole("button", { name: "납부 완료" }),
      "납부 완료했어요",
    );

    await expect(page.getByText(testMemo).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "납부 취소" }).first()).toBeVisible();
  });
});
