import "server-only";

import { ExpenseCategory, PaymentStatus } from "@prisma/client";

import { requireUser } from "@/lib/auth/user";
import { prisma } from "@/lib/prisma";
import { ensureCurrentMonthRentPayments } from "@/lib/repositories/ensure-current-month-rent";
import { getCurrentYearMonthLabel } from "@/lib/utils/date";
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

export async function getMaintenancePageData(): Promise<MaintenancePageData> {
  await devLoadingDelay();
  const user = await requireUser();
  const yearMonth = await ensureCurrentMonthRentPayments(user.id);
  const yearMonthLabel = getCurrentYearMonthLabel();

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
        contract: { select: { maintenanceFee: true } },
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
  const contractFees = homesWithContract
    .filter(
      (home) =>
        home.contract &&
        home.contract.maintenanceFee > 0 &&
        !paidHomeIds.has(home.id),
    )
    .map((home) => ({
      homeId: home.id,
      homeNickname: home.nickname,
      maintenanceFee: home.contract!.maintenanceFee,
    }));

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
