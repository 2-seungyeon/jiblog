"use client";

import {
  completeExpensePaymentAction,
  createMaintenancePaymentAction,
  uncompleteExpensePaymentAction,
} from "@/lib/actions/homes";
import { PaymentRecordAddButton } from "@/components/payment/payment-record-add-button";
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
import { formatWon } from "@/lib/utils/format";

type MaintenancePaymentListProps = {
  payments: ExpensePaymentListItem[];
  contractFees: Array<{
    homeId: string;
    homeNickname: string;
    maintenanceFee: number;
  }>;
  yearMonth: string;
  isCurrentMonth: boolean;
};

export function MaintenancePaymentList({
  payments,
  contractFees,
  yearMonth,
  isCurrentMonth,
}: MaintenancePaymentListProps) {
  const { handleComplete, handleUncomplete, loadingId, loadingKind, getDisplayStatus } =
    usePaymentStatus(completeExpensePaymentAction, uncompleteExpensePaymentAction);
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
              <div className="min-w-0">
                <p className="text-text-secondary">{home.homeNickname}</p>
                <p className="font-semibold tabular-nums text-text-primary">
                  {formatWon(home.maintenanceFee)}
                </p>
              </div>
              {!isCurrentMonth ? (
                <PaymentRecordAddButton
                  homeId={home.homeId}
                  yearMonth={yearMonth}
                  action={createMaintenancePaymentAction}
                />
              ) : null}
            </li>
          ))}
        </ul>
        {isCurrentMonth ? (
          <p className="text-sm text-text-secondary">
            이번 달 관리비는 계약 등록 시 자동으로 추가돼요.
          </p>
        ) : null}
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
