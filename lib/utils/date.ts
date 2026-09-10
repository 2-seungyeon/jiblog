const KST_TIMEZONE = "Asia/Seoul";

type DateParts = {
  year: number;
  month: number;
  day: number;
};

function getDateParts(date: Date, timeZone: string): DateParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });

  const parts = formatter.formatToParts(date);

  return {
    year: Number(parts.find((part) => part.type === "year")?.value),
    month: Number(parts.find((part) => part.type === "month")?.value),
    day: Number(parts.find((part) => part.type === "day")?.value),
  };
}

export function getKSTDateParts(date: Date = new Date()): DateParts {
  return getDateParts(date, KST_TIMEZONE);
}

export function getKSTToday(date: Date = new Date()): Date {
  const { year, month, day } = getKSTDateParts(date);
  return new Date(year, month - 1, day);
}

export function getCurrentYearMonth(date: Date = new Date()): string {
  const { year, month } = getKSTDateParts(date);
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function getCurrentYearMonthLabel(date: Date = new Date()): string {
  const { year, month } = getKSTDateParts(date);
  return `${year}년 ${month}월`;
}

export function getYearMonthFromString(yearMonth: string): {
  year: number;
  month: number;
} {
  const [year, month] = yearMonth.split("-").map(Number);
  return { year, month };
}

export function formatDueDateLabel(yearMonth: string, dueDay: number): string {
  const { month } = getYearMonthFromString(yearMonth);
  return `${month}월 ${dueDay}일`;
}

export function formatCompletionDateLabel(date: Date | string): string {
  const value = typeof date === "string" ? new Date(date) : date;
  const { month, day } = getKSTDateParts(value);
  return `${month}월 ${day}일 완료`;
}

export function formatDateFromDb(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
}

export function formatRelativeDueDay(
  yearMonth: string,
  dueDay: number,
  baseDate: Date = new Date(),
): string {
  const { year, month } = getYearMonthFromString(yearMonth);
  const due = new Date(year, month - 1, dueDay);
  const base = getKSTToday(baseDate);

  const diffDays = Math.round(
    (due.getTime() - base.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) {
    return "오늘";
  }

  if (diffDays > 0) {
    return `${diffDays}일 후`;
  }

  return `${Math.abs(diffDays)}일 전`;
}