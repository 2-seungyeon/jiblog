import {
  formatCompletionDateLabel,
  formatDueDateLabel,
  getYearMonthFromString,
} from "@/lib/utils/date";

export type PaymentStatusLabel = "예정" | "완료";

export function formatPaymentPeriodLabel(yearMonth: string): string {
  const { year, month } = getYearMonthFromString(yearMonth);
  return `${year}년 ${month}월분`;
}

export function formatScheduledDueDateLine(
  yearMonth: string,
  dueDay: number,
): string {
  return `납부 예정일 ${formatDueDateLabel(yearMonth, dueDay)}`;
}

export function formatPaymentDateMeta(
  status: PaymentStatusLabel,
  yearMonth: string,
  dueDay: number,
  completedAt?: string | null,
): string {
  if (status === "예정") {
    return formatScheduledDueDateLine(yearMonth, dueDay);
  }

  const period = formatPaymentPeriodLabel(yearMonth);

  if (completedAt) {
    return `${period} · ${formatCompletionDateLabel(completedAt)}`;
  }

  return period;
}

export function formatMonthlyRentDueDayLabel(dueDay: number): string {
  return `매월 ${dueDay}일 (납부 예정)`;
}
