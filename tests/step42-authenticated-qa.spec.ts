import { expect, test } from "@playwright/test";
import {
  getContractEditPageDescription,
  getContractGuidanceSteps,
  getContractHomeDetailGuidance,
} from "../lib/utils/contract-guidance";
import { gotoAppPage } from "./helpers/ui";
import { getPrimaryHomeForTestUser } from "./helpers/test-data-fixture";

test.describe("STEP 42 contract guidance copy", () => {
  test("edit mode includes termination guidance", () => {
    expect(getContractEditPageDescription("edit")).toContain("종료일");
    expect(getContractGuidanceSteps("edit").join(" ")).toContain("과거 거주");
  });

  test("renewal mode focuses on new contract period", () => {
    expect(getContractEditPageDescription("renewal")).toContain("새 기간");
    expect(getContractGuidanceSteps("renewal").join(" ")).toContain("월세");
  });

  test("home detail guidance covers expiry states", () => {
    expect(getContractHomeDetailGuidance("expired")?.title).toContain("끝");
    expect(getContractHomeDetailGuidance("warning")?.steps.length).toBeGreaterThan(1);
  });
});

test.describe("STEP 42 contract guidance UI", () => {
  test("contract edit page shows guidance panel", async ({ page }) => {
    const home = await getPrimaryHomeForTestUser();
    test.skip(!home, "No authenticated test home");

    await gotoAppPage(page, `/homes/${home!.id}/contract/edit`);

    await expect(page.getByRole("heading", { name: /계약 (수정|갱신)/ })).toBeVisible();
    await expect(page.getByLabel(/계약 (수정 · 중단|갱신) 안내/)).toBeVisible();
    await expect(
      page.getByText(/중도 퇴거\(계약 중단\)|새 계약 시작일·종료일·금액/),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "집 정보 수정" })).toBeVisible();
    await expect(
      page.getByText("계약을 끝내려면 종료일을 실제 퇴거일로 바꿔주세요."),
    ).toBeVisible();
  });

  test("home detail shows guidance when contract needs attention", async ({ page }) => {
    const home = await getPrimaryHomeForTestUser();
    test.skip(!home, "No authenticated test home");

    await gotoAppPage(page, `/homes/${home!.id}`);

    const guidance = page.getByLabel(/계약 종료|계약 기간/);
    if ((await guidance.count()) === 0) {
      test.skip(true, "Primary home contract is not near expiry");
    }

    await expect(guidance.first()).toBeVisible();
    await expect(page.getByRole("link", { name: "집 정보 수정" }).first()).toBeVisible();
  });
});
