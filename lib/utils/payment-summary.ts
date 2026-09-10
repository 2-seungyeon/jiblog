export type PaymentSummaryStats = {
  totalAmount: number;
  scheduledAmount: number;
  completedAmount: number;
  scheduledCount: number;
  completedCount: number;
  totalCount: number;
};

export type PayableItem = {
  amount: number;
  status: "예정" | "완료";
};

export function calculatePaymentSummary(
  items: PayableItem[],
): PaymentSummaryStats {
  const scheduled = items.filter((item) => item.status === "예정");
  const completed = items.filter((item) => item.status === "완료");

  return {
    totalAmount: items.reduce((sum, item) => sum + item.amount, 0),
    scheduledAmount: scheduled.reduce((sum, item) => sum + item.amount, 0),
    completedAmount: completed.reduce((sum, item) => sum + item.amount, 0),
    scheduledCount: scheduled.length,
    completedCount: completed.length,
    totalCount: items.length,
  };
}

export function mergePaymentSummaries(
  ...summaries: PaymentSummaryStats[]
): PaymentSummaryStats {
  return summaries.reduce(
    (acc, summary) => ({
      totalAmount: acc.totalAmount + summary.totalAmount,
      scheduledAmount: acc.scheduledAmount + summary.scheduledAmount,
      completedAmount: acc.completedAmount + summary.completedAmount,
      scheduledCount: acc.scheduledCount + summary.scheduledCount,
      completedCount: acc.completedCount + summary.completedCount,
      totalCount: acc.totalCount + summary.totalCount,
    }),
    {
      totalAmount: 0,
      scheduledAmount: 0,
      completedAmount: 0,
      scheduledCount: 0,
      completedCount: 0,
      totalCount: 0,
    },
  );
}
