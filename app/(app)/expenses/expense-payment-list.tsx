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

type ExpensePaymentListProps = {
  payments: ExpensePaymentListItem[];
};

export function ExpensePaymentList({ payments }: ExpensePaymentListProps) {
  const { handleComplete, loadingId, getDisplayStatus } = usePaymentComplete(
    completeExpensePaymentAction,
  );
  const sortedPayments = sortExpensePayments(payments);
  const pendingCount = payments.filter((payment) => payment.status === "예정").length;
  const completedCount = payments.filter((payment) => payment.status === "완료").length;

  return (
    <PaymentCategoryListPanel
      title="공과금 목록"
      summary={`예정 ${pendingCount} · 완료 ${completedCount}`}
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
