import {
  ContractType,
  ExpenseCategory,
  PaymentStatus,
  PrismaClient,
} from "@prisma/client";
import { loadEnvLocal } from "./env";
import { getCurrentYearMonth } from "./test-data-fixture";

loadEnvLocal();

const prisma = new PrismaClient();

const CATEGORY_LABEL: Record<ExpenseCategory, string> = {
  [ExpenseCategory.MAINTENANCE]: "관리비",
  [ExpenseCategory.ELECTRICITY]: "전기",
  [ExpenseCategory.GAS]: "가스",
  [ExpenseCategory.WATER]: "수도",
  [ExpenseCategory.INTERNET]: "인터넷",
  [ExpenseCategory.OTHER]: "기타",
};

const CONTRACT_TYPE_LABEL: Record<ContractType, string> = {
  [ContractType.MONTHLY]: "월세",
  [ContractType.JEONSE]: "전세",
  [ContractType.SEMI_JEONSE]: "반전세",
};

function formatDateFromDb(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}

function getContractExpiryStatus(endDate: string): "expired" | "active" {
  const normalized = endDate.includes("-") ? endDate.replace(/-/g, ".") : endDate;
  const [year, month, day] = normalized.split(".").map(Number);
  const end = new Date(year, month - 1, day);
  const todayParts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(new Date());
  const ty = Number(todayParts.find((p) => p.type === "year")?.value);
  const tm = Number(todayParts.find((p) => p.type === "month")?.value);
  const td = Number(todayParts.find((p) => p.type === "day")?.value);
  const today = new Date(ty, tm - 1, td);
  return end < today ? "expired" : "active";
}

function isRentPaymentBillable(options: {
  paymentStatus: "예정" | "완료";
  contractType: string;
  contractEndDate: string;
}): boolean {
  const monthlyTypes = new Set(["월세", "반전세", "MONTHLY", "SEMI_JEONSE"]);

  if (!monthlyTypes.has(options.contractType)) {
    return false;
  }

  if (options.paymentStatus === "완료") {
    return true;
  }

  return getContractExpiryStatus(options.contractEndDate) !== "expired";
}

export type AmountAuditResult = {
  userEmail: string;
  userName: string;
  yearMonth: string;
  primaryHome: {
    id: string;
    nickname: string;
    contract: {
      monthlyRent: number;
      maintenanceFee: number;
      endDate: string;
    } | null;
  } | null;
  rentPayments: Array<{
    homeNickname: string;
    amount: number;
    status: string;
    eligible: boolean;
  }>;
  expensePayments: Array<{
    homeNickname: string;
    category: string;
    amount: number;
    status: string;
    eligible: boolean;
  }>;
  computed: {
    rentTotal: number;
    maintenanceTotal: number;
    utilityTotal: number;
    grandTotal: number;
    scheduledCount: number;
    completedCount: number;
  };
};

export async function auditTestUserAmounts(): Promise<AmountAuditResult | null> {
  const email = process.env.PLAYWRIGHT_TEST_EMAIL?.trim();

  if (!email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true },
  });

  if (!user) {
    return null;
  }

  const yearMonth = getCurrentYearMonth();
  const primaryHome = await prisma.home.findFirst({
    where: { userId: user.id, isPrimary: true },
    include: { contract: true },
  });

  const rentPayments = await prisma.rentPayment.findMany({
    where: { yearMonth, home: { userId: user.id } },
    include: { home: { include: { contract: true } } },
    orderBy: { dueDay: "asc" },
  });

  const expensePayments = await prisma.expensePayment.findMany({
    where: { yearMonth, home: { userId: user.id } },
    include: { home: { include: { contract: true } } },
    orderBy: [{ dueDay: "asc" }, { category: "asc" }],
  });

  const rentRows = rentPayments.map((payment) => {
    const contract = payment.home.contract;
    const status = payment.status === PaymentStatus.COMPLETED ? "완료" : "예정";
    const eligible =
      Boolean(contract) &&
      isRentPaymentBillable({
        paymentStatus: status,
        contractType: contract
          ? CONTRACT_TYPE_LABEL[contract.type]
          : "",
        contractEndDate: contract
          ? formatDateFromDb(contract.endDate)
          : "",
      });

    return {
      homeNickname: payment.home.nickname,
      amount: payment.amount,
      status,
      eligible,
    };
  });

  const expenseRows = expensePayments.map((payment) => {
    const eligible = Boolean(payment.home.contract);
    return {
      homeNickname: payment.home.nickname,
      category: CATEGORY_LABEL[payment.category],
      amount: payment.amount,
      status: payment.status === PaymentStatus.COMPLETED ? "완료" : "예정",
      eligible,
    };
  });

  const eligibleRent = rentRows.filter((row) => row.eligible);
  const eligibleExpense = expenseRows.filter((row) => row.eligible);

  const rentTotal = eligibleRent.reduce((sum, row) => sum + row.amount, 0);
  const maintenanceTotal = eligibleExpense
    .filter((row) => row.category === "관리비")
    .reduce((sum, row) => sum + row.amount, 0);
  const utilityTotal = eligibleExpense
    .filter((row) => row.category !== "관리비")
    .reduce((sum, row) => sum + row.amount, 0);

  const allStatuses = [
    ...eligibleRent.map((row) => row.status),
    ...eligibleExpense.map((row) => row.status),
  ];

  return {
    userEmail: user.email,
    userName: user.name,
    yearMonth,
    primaryHome: primaryHome
      ? {
          id: primaryHome.id,
          nickname: primaryHome.nickname,
          contract: primaryHome.contract
            ? {
                monthlyRent: primaryHome.contract.monthlyRent,
                maintenanceFee: primaryHome.contract.maintenanceFee,
                endDate: formatDateFromDb(primaryHome.contract.endDate),
              }
            : null,
        }
      : null,
    rentPayments: rentRows,
    expensePayments: expenseRows,
    computed: {
      rentTotal,
      maintenanceTotal,
      utilityTotal,
      grandTotal: rentTotal + maintenanceTotal + utilityTotal,
      scheduledCount: allStatuses.filter((status) => status === "예정").length,
      completedCount: allStatuses.filter((status) => status === "완료").length,
    },
  };
}

export async function disconnectAmountAudit(): Promise<void> {
  await prisma.$disconnect();
}
