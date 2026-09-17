import "server-only";

import { ContractType, PaymentStatus, type RentPayment } from "@prisma/client";

import { requireUser } from "@/lib/auth/user";
import { prisma } from "@/lib/prisma";
import { resolveViewYearMonth } from "@/lib/repositories/view-year-month";
import { formatDateFromDb } from "@/lib/utils/date";
import {
  isContractEligibleForRentInMonth,
  isRentPaymentBillable,
} from "@/lib/utils/contract-status";
import { isFutureYearMonth } from "@/lib/utils/year-month";
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

export async function getRentPageData(
  yearMonthParam?: string | null,
): Promise<RentPageData> {
  await devLoadingDelay();
  const user = await requireUser();
  const { yearMonth, yearMonthLabel } = await resolveViewYearMonth(
    user.id,
    yearMonthParam,
  );

  const [payments, homesWithContract] = await Promise.all([
    prisma.rentPayment.findMany({
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
    }),
    prisma.home.findMany({
      where: {
        userId: user.id,
        contract: { isNot: null },
      },
      select: {
        id: true,
        nickname: true,
        contract: {
          select: {
            type: true,
            startDate: true,
            endDate: true,
            monthlyRent: true,
          },
        },
      },
      orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
    }),
  ]);

  const listItems = payments
    .map(toRentPaymentListItem)
    .filter((payment): payment is RentPaymentListItem => payment !== null);

  const recordedHomeIds = new Set(payments.map((payment) => payment.homeId));
  const missingRentHomes = homesWithContract.flatMap((home) => {
    if (!home.contract || recordedHomeIds.has(home.id)) {
      return [];
    }

    const startDate = formatDateFromDb(home.contract.startDate);
    const endDate = formatDateFromDb(home.contract.endDate);

    if (
      !isContractEligibleForRentInMonth({
        type: home.contract.type,
        monthlyRent: home.contract.monthlyRent,
        startDate,
        endDate,
        yearMonth,
      })
    ) {
      return [];
    }

    return [
      {
        homeId: home.id,
        homeNickname: home.nickname,
        monthlyRent: home.contract.monthlyRent,
      },
    ];
  });

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
    missingRentHomes,
  };
}

export type CreateRentPaymentResult =
  | { success: true; id: string }
  | {
      success: false;
      code:
        | "home_not_found"
        | "no_contract"
        | "not_eligible"
        | "duplicate"
        | "future_month";
    };

export async function createRentPaymentForMonth(
  homeId: string,
  yearMonth: string,
): Promise<CreateRentPaymentResult> {
  const user = await requireUser();

  if (isFutureYearMonth(yearMonth)) {
    return { success: false, code: "future_month" };
  }

  const home = await prisma.home.findFirst({
    where: { id: homeId, userId: user.id },
    include: {
      contract: {
        select: {
          type: true,
          startDate: true,
          endDate: true,
          monthlyRent: true,
          rentDueDay: true,
        },
      },
    },
  });

  if (!home) {
    return { success: false, code: "home_not_found" };
  }

  if (!home.contract) {
    return { success: false, code: "no_contract" };
  }

  const startDate = formatDateFromDb(home.contract.startDate);
  const endDate = formatDateFromDb(home.contract.endDate);

  if (
    !isContractEligibleForRentInMonth({
      type: home.contract.type,
      monthlyRent: home.contract.monthlyRent,
      startDate,
      endDate,
      yearMonth,
    })
  ) {
    return { success: false, code: "not_eligible" };
  }

  const existing = await prisma.rentPayment.findUnique({
    where: {
      homeId_yearMonth: { homeId, yearMonth },
    },
  });

  if (existing) {
    return { success: false, code: "duplicate" };
  }

  const payment = await prisma.rentPayment.create({
    data: {
      homeId,
      yearMonth,
      amount: home.contract.monthlyRent,
      dueDay: home.contract.rentDueDay,
      status: PaymentStatus.SCHEDULED,
    },
  });

  return { success: true, id: payment.id };
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
