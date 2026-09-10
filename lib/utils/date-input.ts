/** Form hidden value: YYYY-MM-DD */
export function isValidIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/** YYYY-MM-DD → 2026. 09. 08 */
export function formatDateDisplay(isoDate: string): string {
  if (!isValidIsoDate(isoDate)) {
    return "";
  }

  const [year, month, day] = isoDate.split("-");
  return `${year}. ${month}. ${day}`;
}

/** YYYY-MM-DD → local Date (no timezone shift) */
export function isoDateToLocalDate(isoDate: string): Date | undefined {
  if (!isValidIsoDate(isoDate)) {
    return undefined;
  }

  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** local Date → YYYY-MM-DD */
export function localDateToIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Stored label (YYYY.MM.DD) → YYYY-MM-DD */
export function storedDateToIsoDate(storedDate: string): string {
  const normalized = storedDate.replace(/\./g, "-").replace(/\s/g, "");
  const [year, month, day] = normalized.split("-");

  if (!year || !month || !day) {
    return "";
  }

  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}
