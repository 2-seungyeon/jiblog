import "server-only";

import { ContractType, PaymentStatus, type RentPayment } from "@prisma/client";

import { requireUser } from "@/lib/auth/user";
import { prisma } from "@/lib/prisma";
import { ensureCurrentMonthRentPayments } from "@/lib/repositories/ensure-current-month-rent";
import { formatDateFromDb, getCurrentYearMonthLabel } from "@/lib/utils/date";
import { isRentPaymentBillable } from "@/lib/utils/contract-status";
import {
  CONTRACT_TYPE_LABEL,
  PAYMENT_STATUS_LABEL,
} from "@/lib/utils/prisma-labels";
import type { RentPageData, RentPaymentListItem } from "@/lib/types/homes";
import { devLoadingDelay } from "@/lib/utils/dev-loading-delay";

type RentPaymentWithHome = RentPayment & {
  home: {
    nickname: string;
    contract: {
      type: ContractType;
      endDate: Date;
    } | null;
  };
};

function toRentPaymentListItem(
  payment: RentPaymentWithHome,
): RentPaymentListItem | null {
  const contract = payment.home.contract;

  if (!contract) {
    return null;
  }

  const contractType = CONTRACT_TYPE_LABEL[contract.type];
  const paymentStatus = PAYMENT_STATUS_LABEL[payment.status];

  if (
    !isRentPaymentBillable({
      paymentStatus,
      contractType,
      contractEndDate: formatDateFromDb(contract.endDate),
    })
  ) {
    return null;
  }

  return {
    id: payment.id,
    homeId: payment.homeId,
    yearMonth: payment.yearMonth,
    amount: payment.amount,
    dueDay: payment.dueDay,
    status: paymentStatus,
    completedAt:
      payment.status === PaymentStatus.COMPLETED
        ? payment.updatedAt.toISOString()
        : null,
    homeNickname: payment.home.nickname,
    contractType,
  };
}

export async function getRentPageData(): Promise<RentPageData> {
  await devLoadingDelay();
  const user = await requireUser();
  const yearMonth = await ensureCurrentMonthRentPayments(user.id);
  const yearMonthLabel = getCurrentYearMonthLabel();

  const payments = await prisma.rentPayment.findMany({
    where: {
      yearMonth,
      home: { userId: user.id },
    },
    include: {
      home: {
        include: { contract: true },
      },
    },
    orderBy: { dueDay: "asc" },
  });

  const listItems = payments
    .map(toRentPaymentListItem)
    .filter((payment): payment is RentPaymentListItem => payment !== null);

  const totalAmount = listItems.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );

  const summaryStatus =
    listItems.length > 0 &&
    listItems.every((payment) => payment.status === "완료")
      ? "납부 완료"
      : "납부 예정";

  return {
    yearMonthLabel,
    totalAmount,
    summaryStatus,
    payments: listItems,
  };
}

export async function completeRentPayment(paymentId: string): Promise<boolean> {
  const user = await requireUser();

  const payment = await prisma.rentPayment.findFirst({
    where: {
      id: paymentId,
      home: { userId: user.id },
    },
  });

  if (!payment || payment.status === PaymentStatus.COMPLETED) {
    return false;
  }

  await prisma.rentPayment.update({
    where: { id: paymentId },
    data: { status: PaymentStatus.COMPLETED },
  });

  return true;
}
