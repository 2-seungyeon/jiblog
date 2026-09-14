import type { ReactNode } from "react";
import { PaymentStatusBadge } from "@/components/ui/payment-status-badge";
import { formatWon } from "@/lib/utils/format";

export type PaymentListItemLayoutProps = {
  title: string;
  contextLine: string;
  metaLine: string;
  metaExtra?: ReactNode;
  metaExtraOverdue?: boolean;
  amount: number;
  status: "예정" | "완료";
  overdue?: boolean;
  statusKind?: "rent" | "expense";
  action?: ReactNode;
  footer?: ReactNode;
};

export function PaymentListItemLayout({
  title,
  contextLine,
  metaLine,
  metaExtra,
  metaExtraOverdue = false,
  amount,
  status,
  overdue = false,
  statusKind = "rent",
  action,
  footer,
}: PaymentListItemLayoutProps) {
  return (
    <div className="ui-payment-list-item flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        <p className="ui-payment-list-title">{title}</p>

        <div className="ui-payment-list-detail">
          <p className="ui-payment-list-context">{contextLine}</p>
          <p className="ui-payment-list-meta">{metaLine}</p>
          {metaExtra ? (
            <p
              className={[
                "ui-payment-list-extra",
                metaExtraOverdue ? "ui-payment-list-extra-overdue" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {metaExtra}
            </p>
          ) : null}
        </div>

        {footer}
      </div>

      <div className="ui-payment-list-aside">
        <p className="ui-payment-list-amount">{formatWon(amount)}</p>
        <div className="ui-payment-list-status">
          <PaymentStatusBadge status={status} kind={statusKind} overdue={overdue} />
        </div>
        {action ? <div className="ui-payment-list-action">{action}</div> : null}
      </div>
    </div>
  );
}
