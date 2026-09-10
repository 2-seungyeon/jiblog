import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export function loadEnvLocal(): void {
  const envPath = path.join(process.cwd(), ".env.local");

  if (!existsSync(envPath)) {
    return;
  }

  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

export function hasAuthCredentials(): boolean {
  return Boolean(
    process.env.PLAYWRIGHT_TEST_EMAIL?.trim() &&
      process.env.PLAYWRIGHT_TEST_PASSWORD,
  );
}

export function allowMutations(): boolean {
  return process.env.PLAYWRIGHT_ALLOW_MUTATIONS === "1";
}

export function checkNoHorizontalScroll(
  scrollWidth: number,
  clientWidth: number,
): void {
  if (scrollWidth > clientWidth + 1) {
    throw new Error(
      `Horizontal scroll detected: scrollWidth=${scrollWidth}, clientWidth=${clientWidth}`,
    );
  }
}
