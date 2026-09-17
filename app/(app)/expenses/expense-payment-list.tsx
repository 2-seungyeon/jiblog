"use client";

import {
  completeExpensePaymentAction,
  uncompleteExpensePaymentAction,
} from "@/lib/actions/homes";
import { PaymentCategoryListPanel } from "@/components/payment/payment-category-list-panel";
import { PaymentCancelButton } from "@/components/payment/payment-cancel-button";
import { PaymentCompleteButton } from "@/components/payment/payment-complete-button";
import { usePaymentStatus } from "@/hooks/use-payment-status";
import type { ExpensePaymentListItem } from "@/lib/types/homes";
import {
  formatExpenseDueDateMeta,
  sortExpensePayments,
} from "@/lib/utils/expense-display";
import { PaymentListItemLayout } from "@/components/ui/payment-list-item-layout";
import { isPaymentOverdue } from "@/lib/utils/payment-overdue";
import { getPaymentRowClassName } from "@/lib/utils/payment-row";

type ExpensePaymentListProps = {
  payments: ExpensePaymentListItem[];
};

export function ExpensePaymentList({ payments }: ExpensePaymentListProps) {
  const { handleComplete, handleUncomplete, loadingId, loadingKind, getDisplayStatus } =
    usePaymentStatus(completeExpensePaymentAction, uncompleteExpensePaymentAction);
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
        const overdue = isPaymentOverdue(
          displayStatus,
          payment.yearMonth,
          payment.dueDay,
        );

        return (
          <li key={payment.id}>
            <div className={getPaymentRowClassName(displayStatus, { overdue })}>
              <PaymentListItemLayout
                title={payment.homeNickname}
                contextLine={payment.category}
                amount={payment.amount}
                metaLine={formatExpenseDueDateMeta(payment)}
                status={displayStatus}
                statusKind="expense"
                overdue={overdue}
                action={
                  isCompleted ? (
                    <PaymentCancelButton
                      loading={
                        loadingId === payment.id && loadingKind === "uncomplete"
                      }
                      onClick={() => handleUncomplete(payment.id)}
                    />
                  ) : (
                    <PaymentCompleteButton
                      loading={
                        loadingId === payment.id && loadingKind === "complete"
                      }
                      onClick={() => handleComplete(payment.id)}
                    />
                  )
                }
              />
            </div>
          </li>
        );
      })}
    </PaymentCategoryListPanel>
  );
}
