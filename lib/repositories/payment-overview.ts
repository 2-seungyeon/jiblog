import "server-only";

import { ExpenseCategory as PrismaExpenseCategory } from "@prisma/client";

import { requireUser } from "@/lib/auth/user";
import { prisma } from "@/lib/prisma";
import { ensureCurrentMonthRentPayments } from "@/lib/repositories/ensure-current-month-rent";
import { formatDateFromDb, getCurrentYearMonthLabel } from "@/lib/utils/date";
import { isRentPaymentBillable } from "@/lib/utils/contract-status";
import {
  CONTRACT_TYPE_LABEL,
  EXPENSE_CATEGORY_LABEL,
  PAYMENT_STATUS_LABEL,
} from "@/lib/utils/prisma-labels";
import { splitExpensePayments } from "@/lib/utils/payment-category";
import { devLoadingDelay } from "@/lib/utils/dev-loading-delay";
import type { ExpensePaymentListItem } from "@/lib/types/homes";

export type PaymentOverview = {
  yearMonthLabel: string;
  totalAmount: number;
  rentAmount: number;
  maintenanceAmount: number;
  utilityAmount: number;
  scheduledCount: number;
  completedCount: number;
};

function toExpenseListItem(
  payment: {
    id: string;
    homeId: string;
    yearMonth: string;
    category: PrismaExpenseCategory;
    amount: number;
    dueDay: number;
    status: string;
    updatedAt: Date;
    home: {
      nickname: string;
      contract: { id: string } | null;
    };
  },
): ExpensePaymentListItem | null {
  if (!payment.home.contract) {
    return null;
  }

  const status = PAYMENT_STATUS_LABEL[payment.status as "SCHEDULED" | "COMPLETED"];

  return {
    id: payment.id,
    homeId: payment.homeId,
    yearMonth: payment.yearMonth,
    category: EXPENSE_CATEGORY_LABEL[payment.category],
    amount: payment.amount,
    dueDay: payment.dueDay,
    status,
    completedAt:
      status === "완료" ? payment.updatedAt.toISOString() : null,
    homeNickname: payment.home.nickname,
  };
}

export async function getPaymentOverview(): Promise<PaymentOverview> {
  await devLoadingDelay();
  const user = await requireUser();
  const yearMonth = await ensureCurrentMonthRentPayments(user.id);
  const yearMonthLabel = getCurrentYearMonthLabel();

  const [rentPayments, expensePayments] = await Promise.all([
    prisma.rentPayment.findMany({
      where: { yearMonth, home: { userId: user.id } },
      include: { home: { include: { contract: true } } },
    }),
    prisma.expensePayment.findMany({
      where: { yearMonth, home: { userId: user.id } },
      include: { home: { include: { contract: true } } },
    }),
  ]);

  const eligibleRent = rentPayments.filter((payment) => {
    const contract = payment.home.contract;
    if (!contract) return false;
    return isRentPaymentBillable({
      paymentStatus: PAYMENT_STATUS_LABEL[payment.status],
      contractType: CONTRACT_TYPE_LABEL[contract.type],
      contractEndDate: formatDateFromDb(contract.endDate),
    });
  });

  const eligibleExpenses = expensePayments
    .map(toExpenseListItem)
    .filter((payment): payment is ExpensePaymentListItem => payment !== null);

  const rentAmount = eligibleRent.reduce((sum, p) => sum + p.amount, 0);
  const { maintenanceAmount, utilityAmount } =
    splitExpensePayments(eligibleExpenses);

  const allItems = [
    ...eligibleRent.map((p) => PAYMENT_STATUS_LABEL[p.status]),
    ...eligibleExpenses.map((p) => p.status),
  ];

  return {
    yearMonthLabel,
    totalAmount: rentAmount + maintenanceAmount + utilityAmount,
    rentAmount,
    maintenanceAmount,
    utilityAmount,
    scheduledCount: allItems.filter((s) => s === "예정").length,
    completedCount: allItems.filter((s) => s === "완료").length,
  };
}
