import { expect, test } from "@playwright/test";
import { allowMutations } from "./helpers/env";
import {
  createDisposableTestHome,
  deleteHomeById,
  getPrimaryHomeForTestUser,
} from "./helpers/test-data-fixture";
import { expectSubmitWithFeedback, gotoAppPage } from "./helpers/ui";

test.describe("STEP 49 duplicate home nickname", () => {
  test("blocks creating a home with an existing nickname", async ({ page }) => {
    if (!allowMutations()) {
      test.skip(true, "Set PLAYWRIGHT_ALLOW_MUTATIONS=1 to run mutation tests");
    }

    const primaryHome = await getPrimaryHomeForTestUser();
    test.skip(!primaryHome, "No authenticated test home");

    await gotoAppPage(page, "/homes/new");
    await page.getByLabel("별칭").fill(primaryHome!.nickname);
    await page.getByLabel("주소").fill("서울시 테스트구 테스트로 1");
    await page.getByRole("button", { name: "등록하기" }).click();

    await expect(
      page.getByText("이미 같은 별칭의 집이 있어요"),
    ).toBeVisible();
  });

  test("allows updating a home while keeping its own nickname", async ({ page }) => {
    if (!allowMutations()) {
      test.skip(true, "Set PLAYWRIGHT_ALLOW_MUTATIONS=1 to run mutation tests");
    }

    const primaryHome = await getPrimaryHomeForTestUser();
    test.skip(!primaryHome, "No authenticated test home");

    await gotoAppPage(page, `/homes/${primaryHome!.id}/edit`);
    await page.getByLabel("별칭").fill(primaryHome!.nickname);

    await expectSubmitWithFeedback(
      page,
      page.getByRole("button", { name: "저장하기" }),
      "수정했어요",
    );
  });

  test("blocks renaming a home to another home's nickname", async ({ page }) => {
    if (!allowMutations()) {
      test.skip(true, "Set PLAYWRIGHT_ALLOW_MUTATIONS=1 to run mutation tests");
    }

    const primaryHome = await getPrimaryHomeForTestUser();
    test.skip(!primaryHome, "No authenticated test home");

    const disposableHomeId = await createDisposableTestHome();
    test.skip(!disposableHomeId, "Could not create disposable test home");

    try {
      await gotoAppPage(page, `/homes/${disposableHomeId}/edit`);
      await page.getByLabel("별칭").fill(primaryHome!.nickname);
      await page.getByRole("button", { name: "저장하기" }).click();

      await expect(
        page.getByText("이미 같은 별칭의 집이 있어요"),
      ).toBeVisible();
    } finally {
      await deleteHomeById(disposableHomeId!);
    }
  });
});
