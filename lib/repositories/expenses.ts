import "server-only";

import { PaymentStatus, type ExpensePayment } from "@prisma/client";

import { requireUser } from "@/lib/auth/user";
import { prisma } from "@/lib/prisma";
import { ensureCurrentMonthRentPayments } from "@/lib/repositories/ensure-current-month-rent";
import { getCurrentYearMonth, getCurrentYearMonthLabel } from "@/lib/utils/date";
import {
  EXPENSE_CATEGORY_LABEL,
  EXPENSE_CATEGORY_PRISMA,
  PAYMENT_STATUS_LABEL,
} from "@/lib/utils/prisma-labels";
import type {
  CreateExpenseInput,
  ExpenseEligibleHome,
  ExpensePaymentListItem,
  ExpensesPageData,
} from "@/lib/types/homes";
import { devLoadingDelay } from "@/lib/utils/dev-loading-delay";

export type CreateExpensePaymentResult =
  | { success: true; id: string }
  | { success: false; code: "home_not_found" | "no_contract" | "duplicate" };

type ExpensePaymentWithHome = ExpensePayment & {
  home: {
    nickname: string;
    contract: {
      id: string;
    } | null;
  };
};

function toExpensePaymentListItem(
  payment: ExpensePaymentWithHome,
): ExpensePaymentListItem | null {
  if (!payment.home.contract) {
    return null;
  }

  return {
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
  };
}

export async function getExpenseEligibleHomes(): Promise<ExpenseEligibleHome[]> {
  const user = await requireUser();

  const homes = await prisma.home.findMany({
    where: {
      userId: user.id,
      contract: {
        isNot: null,
      },
    },
    select: {
      id: true,
      nickname: true,
    },
    orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
  });

  return homes;
}

export async function createExpensePayment(
  input: CreateExpenseInput,
): Promise<CreateExpensePaymentResult> {
  const user = await requireUser();
  const yearMonth = getCurrentYearMonth();
  const category = EXPENSE_CATEGORY_PRISMA[input.category];

  const home = await prisma.home.findFirst({
    where: { id: input.homeId, userId: user.id },
    include: {
      contract: {
        select: { id: true },
      },
    },
  });

  if (!home) {
    return { success: false, code: "home_not_found" };
  }

  if (!home.contract) {
    return { success: false, code: "no_contract" };
  }

  const existing = await prisma.expensePayment.findUnique({
    where: {
      homeId_yearMonth_category: {
        homeId: input.homeId,
        yearMonth,
        category,
      },
    },
  });

  if (existing) {
    return { success: false, code: "duplicate" };
  }

  const payment = await prisma.expensePayment.create({
    data: {
      homeId: input.homeId,
      yearMonth,
      category,
      amount: input.amount,
      dueDay: input.dueDay,
      status: PaymentStatus.SCHEDULED,
    },
  });

  return { success: true, id: payment.id };
}

export async function getExpensesPageData(): Promise<ExpensesPageData> {
  await devLoadingDelay();
  const user = await requireUser();
  const yearMonth = await ensureCurrentMonthRentPayments(user.id);
  const yearMonthLabel = getCurrentYearMonthLabel();

  const payments = await prisma.expensePayment.findMany({
    where: {
      yearMonth,
      category: { not: "MAINTENANCE" },
      home: { userId: user.id },
    },
    include: {
      home: {
        include: { contract: true },
      },
    },
    orderBy: [{ dueDay: "asc" }, { category: "asc" }],
  });

  const listItems = payments
    .map(toExpensePaymentListItem)
    .filter((payment): payment is ExpensePaymentListItem => payment !== null);

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

export async function completeExpensePayment(
  paymentId: string,
): Promise<boolean> {
  const user = await requireUser();

  const payment = await prisma.expensePayment.findFirst({
    where: {
      id: paymentId,
      home: { userId: user.id },
    },
  });

  if (!payment || payment.status === PaymentStatus.COMPLETED) {
    return false;
  }

  await prisma.expensePayment.update({
    where: { id: paymentId },
    data: { status: PaymentStatus.COMPLETED },
  });

  return true;
}
