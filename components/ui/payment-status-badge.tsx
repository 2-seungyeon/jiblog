import {
  formatExpensePaymentStatus,
  formatRentPaymentStatus,
} from "@/lib/utils/homes";

type PaymentStatus = "예정" | "완료";

type PaymentStatusBadgeProps = {
  status: PaymentStatus;
  kind?: "rent" | "expense";
  overdue?: boolean;
  className?: string;
};

function getPaymentStatusLabel(
  status: PaymentStatus,
  kind: "rent" | "expense",
  overdue: boolean,
): string {
  if (status === "완료") {
    return kind === "expense"
      ? formatExpensePaymentStatus(status)
      : formatRentPaymentStatus(status);
  }

  return overdue ? "납부 지연" : "납부 예정";
}

function getPaymentStatusClassName(status: PaymentStatus, overdue: boolean): string {
  if (status === "완료") {
    return "ui-payment-status-done";
  }

  return overdue ? "ui-payment-status-overdue" : "ui-payment-status-pending";
}

/** 납부 상태 — Badge 대신 Typography로 표현 */
export function PaymentStatusBadge({
  status,
  kind = "rent",
  overdue = false,
  className,
}: PaymentStatusBadgeProps) {
  const label = getPaymentStatusLabel(status, kind, overdue);

  return (
    <span
      className={[getPaymentStatusClassName(status, overdue), className]
        .filter(Boolean)
        .join(" ")}
    >
      {label}
    </span>
  );
}
