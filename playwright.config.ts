import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "node:fs";
import path from "node:path";
import { hasAuthCredentials, loadEnvLocal } from "./tests/helpers/env";

loadEnvLocal();

const viewports = [
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
];

const authEnabled = hasAuthCredentials();
const authStorageState = path.join("tests", ".auth", "user.json");
const testServerPort = 3001;
const testBaseURL = authEnabled
  ? `http://127.0.0.1:${testServerPort}`
  : (process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${testServerPort}`);

export default defineConfig({
  testDir: "./tests",
  fullyParallel: !authEnabled,
  workers: authEnabled ? 1 : undefined,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL: testBaseURL,
    trace: "off",
    screenshot: "off",
  },
  projects: [
    ...(authEnabled
      ? [
          {
            name: "setup",
            testMatch: /auth\.setup\.ts/,
          },
        ]
      : []),
    ...viewports.map((viewport) => ({
      name: `${viewport.width}`,
      testMatch: /(step37-qa|step38\.5-signup|step39-signup|ui-smoke)\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        viewport,
      },
    })),
    ...(authEnabled
      ? [
          {
            name: "authenticated",
            testMatch:
              /step3[89](?:\.[56])?-authenticated-qa\.spec\.ts|step39z-logout\.spec\.ts/,
            dependencies: ["setup"],
            fullyParallel: false,
            use: {
              ...devices["Desktop Chrome"],
              storageState: existsSync(authStorageState)
                ? authStorageState
                : undefined,
              viewport: { width: 1280, height: 800 },
            },
          },
        ]
      : []),
  ],
  webServer: authEnabled
    ? {
        command: `npm run start -- -p ${testServerPort}`,
        url: testBaseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      }
    : process.env.PLAYWRIGHT_BASE_URL
      ? undefined
      : {
          command: `npm run start -- -p ${testServerPort}`,
          url: testBaseURL,
          reuseExistingServer: true,
          timeout: 120_000,
        },
});
