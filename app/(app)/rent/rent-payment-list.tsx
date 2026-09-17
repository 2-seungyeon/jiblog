"use client";

import {
  completeRentPaymentAction,
  createRentPaymentAction,
  uncompleteRentPaymentAction,
} from "@/lib/actions/homes";
import { PaymentCategoryListPanel } from "@/components/payment/payment-category-list-panel";
import { PaymentCancelButton } from "@/components/payment/payment-cancel-button";
import { PaymentCompleteButton } from "@/components/payment/payment-complete-button";
import { PaymentRecordAddButton } from "@/components/payment/payment-record-add-button";
import { usePaymentStatus } from "@/hooks/use-payment-status";
import type { MissingRentHome, RentPaymentListItem } from "@/lib/types/homes";
import { formatWon } from "@/lib/utils/format";
import {
  formatRentDueDateMeta,
  sortRentPayments,
} from "@/lib/utils/rent-display";
import { PaymentListItemLayout } from "@/components/ui/payment-list-item-layout";
import { isPaymentOverdue } from "@/lib/utils/payment-overdue";
import { getPaymentRowClassName } from "@/lib/utils/payment-row";

type RentPaymentListProps = {
  payments: RentPaymentListItem[];
  yearMonth: string;
  isCurrentMonth: boolean;
  missingRentHomes: MissingRentHome[];
};

export function RentPaymentList({
  payments,
  yearMonth,
  isCurrentMonth,
  missingRentHomes,
}: RentPaymentListProps) {
  const { handleComplete, handleUncomplete, loadingId, loadingKind, getDisplayStatus } =
    usePaymentStatus(completeRentPaymentAction, uncompleteRentPaymentAction);
  const sortedPayments = sortRentPayments(payments);
  const pendingCount = payments.filter((payment) => payment.status === "예정").length;
  const completedCount = payments.filter((payment) => payment.status === "완료").length;
  const missingRentAppend =
    !isCurrentMonth && missingRentHomes.length > 0 ? (
      <>
        <p className="text-sm font-medium text-text-primary">
          계약상 월세 (미등록)
        </p>
        <ul className="space-y-2">
          {missingRentHomes.map((home) => (
            <li
              key={home.homeId}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <div className="min-w-0">
                <p className="text-text-secondary">{home.homeNickname}</p>
                <p className="font-semibold tabular-nums text-text-primary">
                  {formatWon(home.monthlyRent)}
                </p>
              </div>
              <PaymentRecordAddButton
                homeId={home.homeId}
                yearMonth={yearMonth}
                action={createRentPaymentAction}
              />
            </li>
          ))}
        </ul>
      </>
    ) : undefined;

  return (
    <PaymentCategoryListPanel
      title="월세 목록"
      summary={`예정 ${pendingCount} · 완료 ${completedCount}`}
      emptyMessage={
        sortedPayments.length === 0 && !missingRentAppend
          ? "등록된 월세 납부 일정이 없어요."
          : undefined
      }
      append={missingRentAppend}
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
                contextLine={payment.contractType}
                amount={payment.amount}
                metaLine={formatRentDueDateMeta(payment)}
                status={displayStatus}
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
