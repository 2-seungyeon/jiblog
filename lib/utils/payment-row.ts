import type { ExpensePaymentStatus, RentPaymentStatus } from "@/lib/types/homes";

type PaymentRowStatus = RentPaymentStatus | ExpensePaymentStatus;

type PaymentRowOptions = {
  overdue?: boolean;
};

export function getPaymentRowClassName(
  status: PaymentRowStatus,
  options: PaymentRowOptions = {},
): string {
  if (status === "완료") {
    return ["ui-row-list-item", "ui-row-list-item-done"].join(" ");
  }

  if (options.overdue) {
    return ["ui-row-list-item", "ui-row-list-item-overdue"].join(" ");
  }

  return ["ui-row-list-item", "ui-row-list-item-pending"].join(" ");
}
