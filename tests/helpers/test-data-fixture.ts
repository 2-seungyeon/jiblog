import {
  ExpenseCategory,
  PaymentStatus,
  PrismaClient,
  ResidenceStatus,
} from "@prisma/client";
import { loadEnvLocal } from "./env";

loadEnvLocal();

const prisma = new PrismaClient();

const EXPENSE_CATEGORY_LABEL: Record<ExpenseCategory, string> = {
  [ExpenseCategory.MAINTENANCE]: "관리비",
  [ExpenseCategory.ELECTRICITY]: "전기",
  [ExpenseCategory.GAS]: "가스",
  [ExpenseCategory.WATER]: "수도",
  [ExpenseCategory.INTERNET]: "인터넷",
  [ExpenseCategory.OTHER]: "기타",
};

const MUTABLE_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  ExpenseCategory.ELECTRICITY,
  ExpenseCategory.GAS,
  ExpenseCategory.WATER,
  ExpenseCategory.INTERNET,
  ExpenseCategory.OTHER,
];

export function getCurrentYearMonth(): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "numeric",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value ?? "2026";
  const month = parts.find((part) => part.type === "month")?.value ?? "1";

  return `${year}-${String(month).padStart(2, "0")}`;
}

async function getTestUserId(): Promise<string | null> {
  const email = process.env.PLAYWRIGHT_TEST_EMAIL?.trim();

  if (!email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  return user?.id ?? null;
}

export async function getPrimaryHomeForTestUser(): Promise<{
  id: string;
  nickname: string;
  memo: string | null;
} | null> {
  const userId = await getTestUserId();

  if (!userId) {
    return null;
  }

  return prisma.home.findFirst({
    where: { userId, isPrimary: true },
    select: { id: true, nickname: true, memo: true },
  });
}

export async function updateHomeMemo(
  homeId: string,
  memo: string | null,
): Promise<void> {
  await prisma.home.update({
    where: { id: homeId },
    data: { memo },
  });
}

export async function getContractForHome(homeId: string): Promise<{
  monthlyRent: number;
  maintenanceFee: number;
} | null> {
  return prisma.contract.findUnique({
    where: { homeId },
    select: { monthlyRent: true, maintenanceFee: true },
  });
}

export async function restoreContractMaintenanceFee(
  homeId: string,
  maintenanceFee: number,
): Promise<void> {
  await prisma.contract.update({
    where: { homeId },
    data: { maintenanceFee },
  });
}

export async function findAvailableExpenseCategory(homeId: string): Promise<{
  category: ExpenseCategory;
  label: string;
} | null> {
  const yearMonth = getCurrentYearMonth();
  const existing = await prisma.expensePayment.findMany({
    where: { homeId, yearMonth },
    select: { category: true },
  });
  const used = new Set(existing.map((payment) => payment.category));
  const available = MUTABLE_EXPENSE_CATEGORIES.find(
    (category) => !used.has(category),
  );

  if (!available) {
    return null;
  }

  return {
    category: available,
    label: EXPENSE_CATEGORY_LABEL[available],
  };
}

export async function deleteExpensePaymentForCategory(
  homeId: string,
  category: ExpenseCategory,
  yearMonth = getCurrentYearMonth(),
): Promise<void> {
  await prisma.expensePayment.deleteMany({
    where: { homeId, category, yearMonth },
  });
}

export async function createDisposableTestHome(): Promise<string | null> {
  const userId = await getTestUserId();

  if (!userId) {
    return null;
  }

  const home = await prisma.home.create({
    data: {
      userId,
      nickname: "E2E 삭제 테스트",
      address: "서울시 테스트구 E2E동",
      residenceStatus: ResidenceStatus.RESIDING,
      isPrimary: false,
    },
    select: { id: true },
  });

  return home.id;
}

export async function deleteHomeById(homeId: string): Promise<void> {
  await prisma.home.delete({ where: { id: homeId } });
}

export async function preparePendingRentPaymentForTestUser(): Promise<string | null> {
  const userId = await getTestUserId();

  if (!userId) {
    return null;
  }

  const yearMonth = getCurrentYearMonth();
  const payment = await prisma.rentPayment.findFirst({
    where: {
      yearMonth,
      home: { userId },
    },
    orderBy: { dueDay: "asc" },
  });

  if (!payment) {
    return null;
  }

  await prisma.rentPayment.update({
    where: { id: payment.id },
    data: { status: PaymentStatus.SCHEDULED },
  });

  return payment.id;
}

export async function preparePendingUtilityPaymentForTestUser(): Promise<string | null> {
  const userId = await getTestUserId();

  if (!userId) {
    return null;
  }

  const yearMonth = getCurrentYearMonth();
  const payment = await prisma.expensePayment.findFirst({
    where: {
      yearMonth,
      category: { not: ExpenseCategory.MAINTENANCE },
      home: { userId },
    },
    orderBy: { dueDay: "asc" },
  });

  if (!payment) {
    return null;
  }

  await prisma.expensePayment.update({
    where: { id: payment.id },
    data: { status: PaymentStatus.SCHEDULED },
  });

  return payment.id;
}

export async function preparePendingMaintenancePaymentForTestUser(): Promise<string | null> {
  const userId = await getTestUserId();

  if (!userId) {
    return null;
  }

  const yearMonth = getCurrentYearMonth();
  const payment = await prisma.expensePayment.findFirst({
    where: {
      yearMonth,
      category: ExpenseCategory.MAINTENANCE,
      home: { userId },
    },
    orderBy: { dueDay: "asc" },
  });

  if (!payment) {
    return null;
  }

  await prisma.expensePayment.update({
    where: { id: payment.id },
    data: { status: PaymentStatus.SCHEDULED },
  });

  return payment.id;
}

export async function disconnectTestDataFixture(): Promise<void> {
  await prisma.$disconnect();
}
