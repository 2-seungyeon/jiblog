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

export async function findAvailableExpenseCategory(
  homeId: string,
  yearMonth = getCurrentYearMonth(),
): Promise<{
  category: ExpenseCategory;
  label: string;
} | null> {
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
      nickname: `E2E 삭제 테스트 ${Date.now()}`,
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

type PreparedPaymentSnapshot = {
  id: string;
  created: boolean;
  previousStatus: PaymentStatus;
  previousDueDay: number;
};

export async function preparePendingRentPaymentForHome(
  homeId: string,
): Promise<PreparedPaymentSnapshot | null> {
  const contract = await prisma.contract.findUnique({
    where: { homeId },
    select: { monthlyRent: true, rentDueDay: true },
  });

  if (!contract || contract.monthlyRent <= 0) {
    return null;
  }

  const yearMonth = getCurrentYearMonth();
  const existing = await prisma.rentPayment.findUnique({
    where: {
      homeId_yearMonth: { homeId, yearMonth },
    },
  });

  if (!existing) {
    const created = await prisma.rentPayment.create({
      data: {
        homeId,
        yearMonth,
        amount: contract.monthlyRent,
        dueDay: contract.rentDueDay,
        status: PaymentStatus.SCHEDULED,
      },
    });

    return {
      id: created.id,
      created: true,
      previousStatus: PaymentStatus.SCHEDULED,
      previousDueDay: contract.rentDueDay,
    };
  }

  await prisma.rentPayment.update({
    where: { id: existing.id },
    data: {
      status: PaymentStatus.SCHEDULED,
      dueDay: contract.rentDueDay,
      paidAt: null,
      memo: null,
    },
  });

  return {
    id: existing.id,
    created: false,
    previousStatus: existing.status,
    previousDueDay: existing.dueDay,
  };
}

export async function restoreRentPaymentSnapshot(
  snapshot: PreparedPaymentSnapshot,
): Promise<void> {
  if (snapshot.created) {
    await prisma.rentPayment.delete({ where: { id: snapshot.id } });
    return;
  }

  await prisma.rentPayment.update({
    where: { id: snapshot.id },
    data: {
      status: snapshot.previousStatus,
      dueDay: snapshot.previousDueDay,
      paidAt: null,
      memo: null,
    },
  });
}

export async function preparePendingMaintenancePaymentForHome(
  homeId: string,
): Promise<PreparedPaymentSnapshot | null> {
  const contract = await prisma.contract.findUnique({
    where: { homeId },
    select: { maintenanceFee: true, maintenanceDueDay: true },
  });

  if (!contract || contract.maintenanceFee <= 0) {
    return null;
  }

  const yearMonth = getCurrentYearMonth();
  const existing = await prisma.expensePayment.findUnique({
    where: {
      homeId_yearMonth_category: {
        homeId,
        yearMonth,
        category: ExpenseCategory.MAINTENANCE,
      },
    },
  });

  if (!existing) {
    const created = await prisma.expensePayment.create({
      data: {
        homeId,
        yearMonth,
        category: ExpenseCategory.MAINTENANCE,
        amount: contract.maintenanceFee,
        dueDay: contract.maintenanceDueDay,
        status: PaymentStatus.SCHEDULED,
      },
    });

    return {
      id: created.id,
      created: true,
      previousStatus: PaymentStatus.SCHEDULED,
      previousDueDay: contract.maintenanceDueDay,
    };
  }

  await prisma.expensePayment.update({
    where: { id: existing.id },
    data: {
      status: PaymentStatus.SCHEDULED,
      dueDay: contract.maintenanceDueDay,
      paidAt: null,
      memo: null,
    },
  });

  return {
    id: existing.id,
    created: false,
    previousStatus: existing.status,
    previousDueDay: existing.dueDay,
  };
}

export async function restoreMaintenancePaymentSnapshot(
  snapshot: PreparedPaymentSnapshot,
): Promise<void> {
  if (snapshot.created) {
    await prisma.expensePayment.delete({ where: { id: snapshot.id } });
    return;
  }

  await prisma.expensePayment.update({
    where: { id: snapshot.id },
    data: {
      status: snapshot.previousStatus,
      dueDay: snapshot.previousDueDay,
      paidAt: null,
      memo: null,
    },
  });
}

export async function preparePendingRentPaymentForTestUser(): Promise<string | null> {
  const home = await getPrimaryHomeForTestUser();

  if (!home) {
    return null;
  }

  const snapshot = await preparePendingRentPaymentForHome(home.id);
  return snapshot?.id ?? null;
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
    data: {
      status: PaymentStatus.SCHEDULED,
      paidAt: null,
      memo: null,
    },
  });

  return payment.id;
}

export async function preparePendingMaintenancePaymentForTestUser(): Promise<string | null> {
  const home = await getPrimaryHomeForTestUser();

  if (!home) {
    return null;
  }

  const snapshot = await preparePendingMaintenancePaymentForHome(home.id);
  return snapshot?.id ?? null;
}

export async function disconnectTestDataFixture(): Promise<void> {
  await prisma.$disconnect();
}
