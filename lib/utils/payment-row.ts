import type { ExpensePaymentStatus, RentPaymentStatus } from "@/lib/types/homes";

type PaymentRowStatus = RentPaymentStatus | ExpensePaymentStatus;

export function getPaymentRowClassName(status: PaymentRowStatus): string {
  return [
    "ui-row-list-item",
    status === "완료" ? "ui-row-list-item-done" : "ui-row-list-item-pending",
  ].join(" ");
}
