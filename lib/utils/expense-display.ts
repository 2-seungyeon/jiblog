import type { ExpensePaymentListItem } from "@/lib/types/homes";
import { formatPaymentDateMeta } from "@/lib/utils/payment-display";

export type ExpenseSummaryStats = {
  totalAmount: number;
  scheduledAmount: number;
  completedAmount: number;
  scheduledCount: number;
  completedCount: number;
  totalCount: number;
};

export function calculateExpenseSummary(
  payments: ExpensePaymentListItem[],
): ExpenseSummaryStats {
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

export function sortExpensePayments(
  payments: ExpensePaymentListItem[],
): ExpensePaymentListItem[] {
  return [...payments].sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === "예정" ? -1 : 1;
    }

    if (a.dueDay !== b.dueDay) {
      return a.dueDay - b.dueDay;
    }

    return a.category.localeCompare(b.category, "ko");
  });
}

export function formatExpenseDueDateMeta(
  payment: ExpensePaymentListItem,
): string {
  return formatPaymentDateMeta(
    payment.status,
    payment.yearMonth,
    payment.dueDay,
    payment.completedAt,
  );
}
