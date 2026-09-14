"use client";

import { completeRentPaymentAction } from "@/lib/actions/homes";
import { PaymentCategoryListPanel } from "@/components/payment/payment-category-list-panel";
import { PaymentCompleteButton } from "@/components/payment/payment-complete-button";
import { usePaymentComplete } from "@/hooks/use-payment-complete";
import type { RentPaymentListItem } from "@/lib/types/homes";
import {
  formatRentDueDateMeta,
  sortRentPayments,
} from "@/lib/utils/rent-display";
import { PaymentListItemLayout } from "@/components/ui/payment-list-item-layout";
import { isPaymentOverdue } from "@/lib/utils/payment-overdue";
import { getPaymentRowClassName } from "@/lib/utils/payment-row";

type RentPaymentListProps = {
  payments: RentPaymentListItem[];
};

export function RentPaymentList({ payments }: RentPaymentListProps) {
  const { handleComplete, loadingId, getDisplayStatus } = usePaymentComplete(
    completeRentPaymentAction,
  );
  const sortedPayments = sortRentPayments(payments);
  const pendingCount = payments.filter((payment) => payment.status === "예정").length;
  const completedCount = payments.filter((payment) => payment.status === "완료").length;

  return (
    <PaymentCategoryListPanel
      title="월세 목록"
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
                contextLine={payment.contractType}
                amount={payment.amount}
                metaLine={formatRentDueDateMeta(payment)}
                status={displayStatus}
                overdue={overdue}
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
