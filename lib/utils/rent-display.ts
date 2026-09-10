import type { RentPaymentListItem } from "@/lib/types/homes";
import { formatPaymentDateMeta } from "@/lib/utils/payment-display";

export type RentSummaryStats = {
  totalAmount: number;
  scheduledAmount: number;
  completedAmount: number;
  scheduledCount: number;
  completedCount: number;
  totalCount: number;
};

export function calculateRentSummary(
  payments: RentPaymentListItem[],
): RentSummaryStats {
  const scheduled = payments.filter((payment) => payment.status === "예정");
  const completed = payments.filter((payment) => payment.status === "완료");

  return {
    totalAmount: payments.reduce((sum, payment) => sum + payment.amount, 0),
    scheduledAmount: scheduled.reduce((sum, payment) => sum + payment.amount, 0),
    completedAmount: completed.reduce((sum, payment) => sum + payment.amount, 0),
    scheduledCount: scheduled.length,
    completedCount: completed.length,
    totalCount: payments.length,
  };
}

export function sortRentPayments(
  payments: RentPaymentListItem[],
): RentPaymentListItem[] {
  return [...payments].sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === "예정" ? -1 : 1;
    }

    return a.dueDay - b.dueDay;
  });
}

export function formatRentDueDateMeta(payment: RentPaymentListItem): string {
  return formatPaymentDateMeta(
    payment.status,
    payment.yearMonth,
    payment.dueDay,
    payment.completedAt,
  );
}
