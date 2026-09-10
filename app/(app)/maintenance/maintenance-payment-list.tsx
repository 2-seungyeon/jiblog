"use client";

import { completeExpensePaymentAction } from "@/lib/actions/homes";
import { PaymentCategoryListPanel } from "@/components/payment/payment-category-list-panel";
import { PaymentCompleteButton } from "@/components/payment/payment-complete-button";
import { usePaymentComplete } from "@/hooks/use-payment-complete";
import type { ExpensePaymentListItem } from "@/lib/types/homes";
import {
  formatExpenseDueDateMeta,
  sortExpensePayments,
} from "@/lib/utils/expense-display";
import { PaymentListItemLayout } from "@/components/ui/payment-list-item-layout";
import { getPaymentRowClassName } from "@/lib/utils/payment-row";
import { formatWon } from "@/lib/utils/format";

type MaintenancePaymentListProps = {
  payments: ExpensePaymentListItem[];
  contractFees: Array<{
    homeId: string;
    homeNickname: string;
    maintenanceFee: number;
  }>;
};

export function MaintenancePaymentList({
  payments,
  contractFees,
}: MaintenancePaymentListProps) {
  const { handleComplete, loadingId, getDisplayStatus } = usePaymentComplete(
    completeExpensePaymentAction,
  );
  const sortedPayments = sortExpensePayments(payments);
  const pendingCount = payments.filter((payment) => payment.status === "예정").length;
  const completedCount = payments.filter((payment) => payment.status === "완료").length;

  const contractFeesAppend =
    contractFees.length > 0 ? (
      <>
        <p className="text-sm font-medium text-text-primary">
          계약상 관리비 (미등록)
        </p>
        <ul className="space-y-2">
          {contractFees.map((home) => (
            <li
              key={home.homeId}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="text-text-secondary">{home.homeNickname}</span>
              <span className="font-semibold tabular-nums text-text-primary">
                {formatWon(home.maintenanceFee)}
              </span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-text-secondary">
          공과금 등록에서 관리비 항목을 추가하면 납부 일정을 관리할 수 있어요.
        </p>
      </>
    ) : undefined;

  return (
    <PaymentCategoryListPanel
      title="관리비 목록"
      summary={`예정 ${pendingCount} · 완료 ${completedCount}`}
      emptyMessage={
        sortedPayments.length === 0
          ? "등록된 관리비 납부 일정이 없어요."
          : undefined
      }
      append={contractFeesAppend}
    >
      {sortedPayments.map((payment) => {
        const displayStatus = getDisplayStatus(payment.id, payment.status);
        const isCompleted = displayStatus === "완료";

        return (
          <li key={payment.id}>
            <div className={getPaymentRowClassName(displayStatus)}>
              <PaymentListItemLayout
                title={payment.homeNickname}
                contextLine={payment.category}
                amount={payment.amount}
                metaLine={formatExpenseDueDateMeta(payment)}
                status={displayStatus}
                action={
                  !isCompleted ? (
                    <PaymentCompleteButton
                      loading={loadingId === payment.id}
                      onClick={() => handleComplete(payment.id)}
                    />
                  ) : null
                }
              />
            </div>
          </li>
        );
      })}
    </PaymentCategoryListPanel>
  );
}
