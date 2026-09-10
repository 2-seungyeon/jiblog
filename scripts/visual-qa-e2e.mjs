/**
 * STEP 33 Visual QA — captures key routes at required viewports.
 *
 * Usage:
 *   node scripts/visual-qa-e2e.mjs
 *   VISUAL_QA_EMAIL=... VISUAL_QA_PASSWORD=... node scripts/visual-qa-e2e.mjs
 *
 * Requires dev server at http://localhost:3000
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = path.join(process.cwd(), ".visual-qa", "step34c");
const EMAIL = process.env.VISUAL_QA_EMAIL;
const PASSWORD = process.env.VISUAL_QA_PASSWORD;

const viewports = [
  { name: "375", width: 375, height: 812 },
  { name: "390", width: 390, height: 844 },
  { name: "430", width: 430, height: 932 },
  { name: "768", width: 768, height: 1024 },
  { name: "1280", width: 1280, height: 800 },
  { name: "1440", width: 1440, height: 900 },
];

const publicRoutes = [
  { name: "login", path: "/login" },
  { name: "signup", path: "/signup" },
];

const appRoutes = [
  { name: "dashboard", path: "/dashboard" },
  { name: "homes", path: "/homes" },
  { name: "homes-new", path: "/homes/new" },
  { name: "rent", path: "/rent" },
  { name: "maintenance", path: "/maintenance" },
  { name: "expenses", path: "/expenses" },
  { name: "expenses-new", path: "/expenses/new" },
];

async function tryLogin(page) {
  if (!EMAIL || !PASSWORD) {
    return false;
  }

  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.fill('input[name="email"]', EMAIL);
  await page.fill('input[name="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.includes("/login"), {
    timeout: 15000,
  });
  return true;
}

async function capture(page, routeName, vp) {
  const file = path.join(OUT, `${routeName}-${vp.name}.png`);
  await page.screenshot({ path: file, fullPage: true });
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const loggedIn = await tryLogin(page);
  console.log(loggedIn ? "✓ Authenticated session" : "○ Public routes only (set VISUAL_QA_EMAIL/PASSWORD)");

  let homeId = null;
  if (loggedIn) {
    await page.goto(`${BASE}/homes`, { waitUntil: "networkidle" });
    const link = page.locator('a.ui-home-item, a.ui-home-row, a.ui-card-link').first();
    if (await link.count()) {
      const href = await link.getAttribute("href");
      homeId = href?.split("/").pop() ?? null;
    }
  }

  const dynamicRoutes =
    loggedIn && homeId
      ? [
          { name: "home-detail", path: `/homes/${homeId}` },
          { name: "home-edit", path: `/homes/${homeId}/edit` },
          { name: "contract-new", path: `/homes/${homeId}/contract/new` },
          { name: "contract-edit", path: `/homes/${homeId}/contract/edit` },
        ]
      : [];

  const routes = [...publicRoutes, ...(loggedIn ? [...appRoutes, ...dynamicRoutes] : [])];

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    for (const route of routes) {
      await page.goto(`${BASE}${route.path}`, { waitUntil: "networkidle" });
      await capture(page, route.name, vp);
      console.log(`✓ ${route.name} @ ${vp.name}px`);
    }
  }

  await browser.close();
  console.log(`\nScreenshots: ${OUT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
