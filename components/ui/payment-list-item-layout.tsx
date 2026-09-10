import type { ReactNode } from "react";
import { PaymentStatusBadge } from "@/components/ui/payment-status-badge";
import { formatWon } from "@/lib/utils/format";

export type PaymentListItemLayoutProps = {
  title: string;
  contextLine: string;
  metaLine: string;
  metaExtra?: ReactNode;
  amount: number;
  status: "예정" | "완료";
  action?: ReactNode;
  footer?: ReactNode;
};

export function PaymentListItemLayout({
  title,
  contextLine,
  metaLine,
  metaExtra,
  amount,
  status,
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
            <p className="ui-payment-list-extra">{metaExtra}</p>
          ) : null}
        </div>

        {footer}
      </div>

      <div className="ui-payment-list-aside">
        <p className="ui-payment-list-amount">{formatWon(amount)}</p>
        <div className="ui-payment-list-status">
          <PaymentStatusBadge status={status} />
        </div>
        {action ? <div className="ui-payment-list-action">{action}</div> : null}
      </div>
    </div>
  );
}
