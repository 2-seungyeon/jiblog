import { getKSTToday, getYearMonthFromString } from "@/lib/utils/date";
import type { ExpensePaymentStatus, RentPaymentStatus } from "@/lib/types/homes";

type PendingPaymentStatus = Extract<RentPaymentStatus | ExpensePaymentStatus, "예정">;

export function isPaymentOverdue(
  status: RentPaymentStatus | ExpensePaymentStatus,
  yearMonth: string,
  dueDay: number,
  baseDate: Date = new Date(),
): boolean {
  if (status !== "예정") {
    return false;
  }

  const { year, month } = getYearMonthFromString(yearMonth);
  const dueDate = new Date(year, month - 1, dueDay);
  const today = getKSTToday(baseDate);

  return dueDate.getTime() < today.getTime();
}

export function isScheduledPaymentOverdue(
  status: PendingPaymentStatus,
  yearMonth: string,
  dueDay: number,
  baseDate: Date = new Date(),
): boolean {
  return isPaymentOverdue(status, yearMonth, dueDay, baseDate);
}
