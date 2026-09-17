import "server-only";

import { ExpenseCategory, PaymentStatus } from "@prisma/client";

import { requireUser } from "@/lib/auth/user";
import { prisma } from "@/lib/prisma";
import { resolveViewYearMonth } from "@/lib/repositories/view-year-month";
import type { CreateExpensePaymentResult } from "@/lib/repositories/expenses";
import { formatDateFromDb } from "@/lib/utils/date";
import { isContractEligibleForMaintenanceInMonth } from "@/lib/utils/contract-status";
import { isFutureYearMonth } from "@/lib/utils/year-month";
import {
  EXPENSE_CATEGORY_LABEL,
  PAYMENT_STATUS_LABEL,
} from "@/lib/utils/prisma-labels";
import type { ExpensePaymentListItem } from "@/lib/types/homes";
import { devLoadingDelay } from "@/lib/utils/dev-loading-delay";

export type MaintenancePageData = {
  yearMonthLabel: string;
  totalAmount: number;
  summaryStatus: "납부 예정" | "납부 완료";
  payments: ExpensePaymentListItem[];
  contractFees: Array<{
    homeId: string;
    homeNickname: string;
    maintenanceFee: number;
  }>;
};

export async function getMaintenancePageData(
  yearMonthParam?: string | null,
): Promise<MaintenancePageData> {
  await devLoadingDelay();
  const user = await requireUser();
  const { yearMonth, yearMonthLabel } = await resolveViewYearMonth(
    user.id,
    yearMonthParam,
  );

  const [payments, homesWithContract] = await Promise.all([
    prisma.expensePayment.findMany({
      where: {
        yearMonth,
        category: ExpenseCategory.MAINTENANCE,
        home: { userId: user.id },
      },
      include: {
        home: { include: { contract: true } },
      },
      orderBy: [{ dueDay: "asc" }, { createdAt: "asc" }],
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
            maintenanceFee: true,
            startDate: true,
            endDate: true,
          },
        },
      },
      orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
    }),
  ]);

  const listItems = payments
    .filter((payment) => payment.home.contract)
    .map((payment) => ({
      id: payment.id,
      homeId: payment.homeId,
      yearMonth: payment.yearMonth,
      category: EXPENSE_CATEGORY_LABEL[payment.category],
      amount: payment.amount,
      dueDay: payment.dueDay,
      status: PAYMENT_STATUS_LABEL[payment.status],
      completedAt:
        payment.status === PaymentStatus.COMPLETED
          ? payment.updatedAt.toISOString()
          : null,
      homeNickname: payment.home.nickname,
    })) as ExpensePaymentListItem[];

  const paidHomeIds = new Set(listItems.map((p) => p.homeId));
  const contractFees = homesWithContract.flatMap((home) => {
    if (!home.contract || paidHomeIds.has(home.id)) {
      return [];
    }

    const startDate = formatDateFromDb(home.contract.startDate);
    const endDate = formatDateFromDb(home.contract.endDate);

    if (
      !isContractEligibleForMaintenanceInMonth({
        maintenanceFee: home.contract.maintenanceFee,
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
        maintenanceFee: home.contract.maintenanceFee,
      },
    ];
  });

  const totalAmount = listItems.reduce((sum, p) => sum + p.amount, 0);
  const summaryStatus =
    listItems.length > 0 && listItems.every((p) => p.status === "완료")
      ? "납부 완료"
      : "납부 예정";

  return {
    yearMonthLabel,
    totalAmount,
    summaryStatus,
    payments: listItems,
    contractFees,
  };
}

export async function createMaintenancePaymentForMonth(
  homeId: string,
  yearMonth: string,
): Promise<CreateExpensePaymentResult> {
  const user = await requireUser();

  if (isFutureYearMonth(yearMonth)) {
    return { success: false, code: "future_month" };
  }

  const home = await prisma.home.findFirst({
    where: { id: homeId, userId: user.id },
    include: {
      contract: {
        select: {
          maintenanceFee: true,
          maintenanceDueDay: true,
          startDate: true,
          endDate: true,
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
    !isContractEligibleForMaintenanceInMonth({
      maintenanceFee: home.contract.maintenanceFee,
      startDate,
      endDate,
      yearMonth,
    })
  ) {
    return { success: false, code: "not_eligible" };
  }

  const existing = await prisma.expensePayment.findUnique({
    where: {
      homeId_yearMonth_category: {
        homeId,
        yearMonth,
        category: ExpenseCategory.MAINTENANCE,
      },
    },
  });

  if (existing) {
    return { success: false, code: "duplicate" };
  }

  const payment = await prisma.expensePayment.create({
    data: {
      homeId,
      yearMonth,
      category: ExpenseCategory.MAINTENANCE,
      amount: home.contract.maintenanceFee,
      dueDay: home.contract.maintenanceDueDay,
      status: PaymentStatus.SCHEDULED,
    },
  });

  return { success: true, id: payment.id };
}
