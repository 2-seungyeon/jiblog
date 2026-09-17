import { getCurrentYearMonth, getKSTDateParts, getYearMonthFromString } from "@/lib/utils/date";

const MIN_YEAR = 1970;
const MAX_YEAR = 2100;

export function formatYearMonthLabel(yearMonth: string): string {
  const { year, month } = getYearMonthFromString(yearMonth);
  return `${year}년 ${month}월`;
}

export function isCurrentYearMonth(
  yearMonth: string,
  reference: Date = new Date(),
): boolean {
  return yearMonth === getCurrentYearMonth(reference);
}

export function parseYearMonthParam(raw?: string | null): string {
  if (!raw || !/^\d{4}-\d{2}$/.test(raw)) {
    return getCurrentYearMonth();
  }

  const { year, month } = getYearMonthFromString(raw);

  if (month < 1 || month > 12 || year < MIN_YEAR || year > MAX_YEAR) {
    return getCurrentYearMonth();
  }

  return raw;
}

export function addMonths(yearMonth: string, delta: number): string {
  const { year, month } = getYearMonthFromString(yearMonth);
  const date = new Date(year, month - 1 + delta, 1);

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function getYearMonthBounds(reference: Date = new Date()): {
  startYear: number;
  endYear: number;
} {
  const { year } = getKSTDateParts(reference);

  return {
    startYear: year - 50,
    endYear: year + 10,
  };
}

export function buildYearMonth(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function getPaymentPeriodSubtitle(yearMonth: string): string {
  return isCurrentYearMonth(yearMonth)
    ? "이번 달 주거비"
    : `${formatYearMonthLabel(yearMonth)} 주거비`;
}

export function getMonthSearchParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export function appendMonthQuery(path: string, yearMonth?: string | null): string {
  if (!yearMonth || isCurrentYearMonth(yearMonth)) {
    return path;
  }

  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}month=${yearMonth}`;
}
