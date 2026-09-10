import {
  formatExpensePaymentStatus,
  formatRentPaymentStatus,
} from "@/lib/utils/homes";

type PaymentStatus = "예정" | "완료";

type PaymentStatusBadgeProps = {
  status: PaymentStatus;
  kind?: "rent" | "expense";
  className?: string;
};

/** 납부 상태 — Badge 대신 Typography로 표현 */
export function PaymentStatusBadge({
  status,
  kind = "rent",
  className,
}: PaymentStatusBadgeProps) {
  const label =
    kind === "expense"
      ? formatExpensePaymentStatus(status)
      : formatRentPaymentStatus(status);

  return (
    <span
      className={[
        status === "완료" ? "ui-payment-status-done" : "ui-payment-status-pending",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {label}
    </span>
  );
}
