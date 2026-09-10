/** Set DEBUG_LOADING_DELAY_MS in .env.local to verify page loading UI (e.g. 2000). */
export async function devLoadingDelay(): Promise<void> {
  const delayMs = Number(process.env.DEBUG_LOADING_DELAY_MS);

  if (!Number.isFinite(delayMs) || delayMs <= 0) {
    return;
  }

  await new Promise((resolve) => setTimeout(resolve, delayMs));
}
