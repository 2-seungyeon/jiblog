import { expect, test as setup } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { hasAuthCredentials } from "./helpers/env";

const authFile = path.join(process.cwd(), "tests", ".auth", "user.json");

setup("authenticate", async ({ page }) => {
  setup.setTimeout(60_000);

  if (!hasAuthCredentials()) {
    setup.skip(true, "PLAYWRIGHT_TEST_EMAIL / PLAYWRIGHT_TEST_PASSWORD not set");
  }

  const email = process.env.PLAYWRIGHT_TEST_EMAIL!.trim();
  const password = process.env.PLAYWRIGHT_TEST_PASSWORD!;

  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  await expect(page.getByRole("heading", { level: 1, name: "로그인" })).toBeVisible();
  await expect(page.getByRole("button", { name: "로그인" })).toBeEnabled();

  await page.getByRole("textbox", { name: /이메일/ }).fill(email);
  await page.getByRole("textbox", { name: /비밀번호/ }).fill(password);

  await Promise.all([
    page.waitForURL(/\/dashboard/, { timeout: 60_000 }),
    page.getByRole("button", { name: "로그인" }).click(),
  ]);

  mkdirSync(path.dirname(authFile), { recursive: true });
  await page.context().storageState({ path: authFile });
});
