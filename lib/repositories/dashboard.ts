import "server-only";

import {
  PaymentStatus,
  type Contract,
  type ExpensePayment,
  type Home,
  type RentPayment,
} from "@prisma/client";

import {
  getDisplayName,
  requireUser,
} from "@/lib/auth/user";
import { prisma } from "@/lib/prisma";
import { ensureCurrentMonthRentPayments } from "@/lib/repositories/ensure-current-month-rent";
import type {
  Contract as DashboardContract,
  DashboardData,
  UpcomingPayment,
} from "@/lib/types/dashboard";
import type { HomeContractDetail } from "@/lib/types/homes";
import {
  formatDueDateLabel,
  formatRelativeDueDay,
  formatDateFromDb,
  getCurrentYearMonthLabel,
  getKSTToday,
} from "@/lib/utils/date";
import { calculatePaymentSummary } from "@/lib/utils/payment-summary";
import { splitExpensePayments } from "@/lib/utils/payment-category";
import { isRentPaymentBillable } from "@/lib/utils/contract-status";
import {
  EXPENSE_CATEGORY_LABEL,
  CONTRACT_TYPE_LABEL,
  getRentStatusLabel,
  PAYMENT_STATUS_LABEL,
  toContractDetail,
} from "@/lib/utils/prisma-labels";
import { calculateDDay } from "@/lib/utils/homes";
import { devLoadingDelay } from "@/lib/utils/dev-loading-delay";

type PrimaryHomeWithRelations = Home & {
  contract: Contract | null;
  rentPayments: RentPayment[];
  expensePayments: ExpensePayment[];
};

type RentPaymentWithHome = RentPayment & {
  home: {
    nickname: string;
    contract: Contract | null;
  };
};

type ExpensePaymentWithHome = ExpensePayment & {
  home: {
    nickname: string;
    contract: Contract | null;
  };
};

const primaryHomeInclude = (yearMonth: string) =>
  ({
    contract: true,
    rentPayments: {
      where: { yearMonth },
    },
    expensePayments: {
      where: { yearMonth },
    },
  }) as const;

function buildContract(
  contractDetail: HomeContractDetail,
): DashboardContract {
  return {
    type: contractDetail.type,
    startDate: contractDetail.startDate,
    endDate: contractDetail.endDate,
    dDay: calculateDDay(contractDetail.endDate, getKSTToday()),
    deposit: contractDetail.deposit,
    monthlyRent: contractDetail.monthlyRent,
    maintenanceFee: contractDetail.maintenanceFee,
    status: contractDetail.status,
  };
}

async function getPrimaryHomeWithRelations(
  userId: string,
  yearMonth: string,
): Promise<PrimaryHomeWithRelations | null> {
  const include = primaryHomeInclude(yearMonth);

  const primaryHome = await prisma.home.findFirst({
    where: { userId, isPrimary: true },
    include,
  });

  if (primaryHome) {
    return primaryHome;
  }

  return prisma.home.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include,
  });
}

async function getAllUserPaymentsForMonth(userId: string, yearMonth: string) {
  const [rentPayments, expensePayments] = await Promise.all([
    prisma.rentPayment.findMany({
      where: {
        yearMonth,
        home: { userId },
      },
      include: {
        home: {
          include: { contract: true },
        },
      },
      orderBy: { dueDay: "asc" },
    }),
    prisma.expensePayment.findMany({
      where: {
        yearMonth,
        home: { userId },
      },
      include: {
        home: {
          include: { contract: true },
        },
      },
      orderBy: [{ dueDay: "asc" }, { category: "asc" }],
    }),
  ]);

  return {
    rentPayments: rentPayments as RentPaymentWithHome[],
    expensePayments: expensePayments as ExpensePaymentWithHome[],
  };
}

function isEligibleRentPayment(payment: RentPaymentWithHome): boolean {
  const contract = payment.home.contract;

  if (!contract) {
    return false;
  }

  const contractType = CONTRACT_TYPE_LABEL[contract.type];
  const paymentStatus = PAYMENT_STATUS_LABEL[payment.status];

  return isRentPaymentBillable({
    paymentStatus,
    contractType,
    contractEndDate: formatDateFromDb(contract.endDate),
  });
}

function isEligibleExpensePayment(payment: ExpensePaymentWithHome): boolean {
  return Boolean(payment.home.contract);
}

export async function getDashboardData(): Promise<DashboardData> {
  await devLoadingDelay();
  const user = await requireUser();
  const userName = getDisplayName(user);
  const yearMonth = await ensureCurrentMonthRentPayments(user.id);
  const yearMonthLabel = getCurrentYearMonthLabel();
  const primaryHome = await getPrimaryHomeWithRelations(user.id, yearMonth);

  if (!primaryHome) {
    return {
      userName,
      state: "no-home",
      primaryHome: null,
      contract: null,
      monthlySummary: null,
      upcomingPayments: [],
    };
  }

  const primaryHomeSummary = {
    id: primaryHome.id,
    nickname: primaryHome.nickname,
    address: primaryHome.address,
    isPrimary: primaryHome.isPrimary,
  };

  if (!primaryHome.contract) {
    return {
      userName,
      state: "no-contract",
      primaryHome: primaryHomeSummary,
      contract: null,
      monthlySummary: null,
      upcomingPayments: [],
    };
  }

  const contractDetail = toContractDetail(primaryHome.contract);
  const contract = buildContract(contractDetail);
  const { rentPayments, expensePayments } = await getAllUserPaymentsForMonth(
    user.id,
    yearMonth,
  );

  const eligibleRentPayments = rentPayments.filter(isEligibleRentPayment);
  const eligibleExpensePayments = expensePayments.filter(isEligibleExpensePayment);

  const rentAmount = eligibleRentPayments.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );
  const expenseListItems = eligibleExpensePayments.map((payment) => ({
    category: EXPENSE_CATEGORY_LABEL[payment.category] as import("@/lib/types/homes").ExpenseCategory,
    amount: payment.amount,
    status: PAYMENT_STATUS_LABEL[payment.status] as "예정" | "완료",
  }));

  const { maintenanceAmount, utilityAmount } = splitExpensePayments(
    expenseListItems.map((item) => ({
      category: item.category,
      amount: item.amount,
    })),
  );
  const total = rentAmount + maintenanceAmount + utilityAmount;

  const primaryRentPayment = primaryHome.rentPayments[0];
  const payableItems = [
    ...eligibleRentPayments.map((payment) => ({
      amount: payment.amount,
      status: PAYMENT_STATUS_LABEL[payment.status] as "예정" | "완료",
    })),
    ...eligibleExpensePayments.map((payment) => ({
      amount: payment.amount,
      status: PAYMENT_STATUS_LABEL[payment.status] as "예정" | "완료",
    })),
  ];
  const paymentSummary = calculatePaymentSummary(payableItems);

  const expenseCount = eligibleExpensePayments.filter(
    (payment) => EXPENSE_CATEGORY_LABEL[payment.category] !== "관리비",
  ).length;

  const monthlySummary = {
    yearMonth: yearMonthLabel,
    total,
    rentAmount,
    maintenanceAmount,
    utilityExpenseAmount: utilityAmount,
    expenseCount,
    rentStatus: getRentStatusLabel(primaryRentPayment, contractDetail),
    paymentSummary: {
      scheduledAmount: paymentSummary.scheduledAmount,
      completedAmount: paymentSummary.completedAmount,
      scheduledCount: paymentSummary.scheduledCount,
      completedCount: paymentSummary.completedCount,
    },
  };

  const upcomingItems: Array<UpcomingPayment & { dueDay: number }> = [];

  for (const payment of eligibleRentPayments) {
    if (payment.status !== PaymentStatus.SCHEDULED) {
      continue;
    }

    upcomingItems.push({
      type: "월세",
      amount: payment.amount,
      dueDate: formatDueDateLabel(yearMonth, payment.dueDay),
      relativeDate: formatRelativeDueDay(yearMonth, payment.dueDay),
      status: "납부 예정",
      homeNickname: payment.home.nickname,
      dueDay: payment.dueDay,
    });
  }

  for (const payment of eligibleExpensePayments) {
    if (payment.status !== PaymentStatus.SCHEDULED) {
      continue;
    }

    upcomingItems.push({
      type: EXPENSE_CATEGORY_LABEL[payment.category],
      amount: payment.amount,
      dueDate: formatDueDateLabel(yearMonth, payment.dueDay),
      relativeDate: formatRelativeDueDay(yearMonth, payment.dueDay),
      status: "납부 예정",
      homeNickname: payment.home.nickname,
      dueDay: payment.dueDay,
    });
  }

  upcomingItems.sort((a, b) => a.dueDay - b.dueDay);

  const upcomingPayments: UpcomingPayment[] = upcomingItems.map(
    ({ type, amount, dueDate, relativeDate, status, homeNickname }) => ({
      type,
      amount,
      dueDate,
      relativeDate,
      status,
      homeNickname,
    }),
  );

  return {
    userName,
    state: "ready",
    primaryHome: primaryHomeSummary,
    contract,
    monthlySummary,
    upcomingPayments,
  };
}
