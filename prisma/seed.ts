import {
  ContractStatus,
  ContractType,
  ExpenseCategory,
  PaymentStatus,
  PrismaClient,
  ResidenceStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

function parseStoredDate(date: string): Date {
  const [year, month, day] = date.split(".").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

const RESIDENCE_STATUS: Record<string, ResidenceStatus> = {
  "거주 중": ResidenceStatus.RESIDING,
  "이사 예정": ResidenceStatus.MOVING_OUT,
  "과거 거주": ResidenceStatus.PAST,
};

const CONTRACT_TYPE: Record<string, ContractType> = {
  월세: ContractType.MONTHLY,
  전세: ContractType.JEONSE,
  반전세: ContractType.SEMI_JEONSE,
};

const PAYMENT_STATUS: Record<string, PaymentStatus> = {
  예정: PaymentStatus.SCHEDULED,
  완료: PaymentStatus.COMPLETED,
};

const EXPENSE_CATEGORY: Record<string, ExpenseCategory> = {
  관리비: ExpenseCategory.MAINTENANCE,
  전기: ExpenseCategory.ELECTRICITY,
  가스: ExpenseCategory.GAS,
  수도: ExpenseCategory.WATER,
  인터넷: ExpenseCategory.INTERNET,
  기타: ExpenseCategory.OTHER,
};

const CURRENT_RENT_YEAR_MONTH = "2026-03";
const DEFAULT_RENT_DUE_DAY = 5;

async function main() {
  await prisma.home.upsert({
    where: { id: "home-1" },
    create: {
      id: "home-1",
      nickname: "학교 근처 원룸",
      address: "서울시 ○○구 ○○동",
      detailAddress: "101동 502호",
      residenceStatus: RESIDENCE_STATUS["거주 중"],
      moveInDate: parseStoredDate("2025.03.01"),
      isPrimary: true,
      memo: "학교 도보 10분",
    },
    update: {
      nickname: "학교 근처 원룸",
      address: "서울시 ○○구 ○○동",
      detailAddress: "101동 502호",
      residenceStatus: RESIDENCE_STATUS["거주 중"],
      moveInDate: parseStoredDate("2025.03.01"),
      isPrimary: true,
      memo: "학교 도보 10분",
    },
  });

  await prisma.home.upsert({
    where: { id: "home-2" },
    create: {
      id: "home-2",
      nickname: "직장 근처 투룸",
      address: "경기도 ○○시 ○○동",
      detailAddress: "202동 1203호",
      residenceStatus: RESIDENCE_STATUS["이사 예정"],
      moveInDate: parseStoredDate("2024.09.01"),
      isPrimary: false,
      memo: "직장에서 지하철 2정거장",
    },
    update: {
      nickname: "직장 근처 투룸",
      address: "경기도 ○○시 ○○동",
      detailAddress: "202동 1203호",
      residenceStatus: RESIDENCE_STATUS["이사 예정"],
      moveInDate: parseStoredDate("2024.09.01"),
      isPrimary: false,
      memo: "직장에서 지하철 2정거장",
    },
  });

  await prisma.home.upsert({
    where: { id: "home-3" },
    create: {
      id: "home-3",
      nickname: "예전에 살던 원룸",
      address: "서울시 ○○구 ○○동",
      residenceStatus: RESIDENCE_STATUS["과거 거주"],
      moveInDate: parseStoredDate("2023.02.01"),
      isPrimary: false,
      memo: "졸업 후 첫 자취방",
    },
    update: {
      nickname: "예전에 살던 원룸",
      address: "서울시 ○○구 ○○동",
      residenceStatus: RESIDENCE_STATUS["과거 거주"],
      moveInDate: parseStoredDate("2023.02.01"),
      isPrimary: false,
      memo: "졸업 후 첫 자취방",
    },
  });

  await prisma.contract.upsert({
    where: { homeId: "home-1" },
    create: {
      id: "contract-1",
      homeId: "home-1",
      type: CONTRACT_TYPE["월세"],
      startDate: parseStoredDate("2025.03.01"),
      endDate: parseStoredDate("2026.02.28"),
      deposit: 10_000_000,
      monthlyRent: 500_000,
      maintenanceFee: 80_000,
      status: ContractStatus.ACTIVE,
    },
    update: {
      type: CONTRACT_TYPE["월세"],
      startDate: parseStoredDate("2025.03.01"),
      endDate: parseStoredDate("2026.02.28"),
      deposit: 10_000_000,
      monthlyRent: 500_000,
      maintenanceFee: 80_000,
      status: ContractStatus.ACTIVE,
    },
  });

  await prisma.contract.upsert({
    where: { homeId: "home-2" },
    create: {
      id: "contract-2",
      homeId: "home-2",
      type: CONTRACT_TYPE["전세"],
      startDate: parseStoredDate("2024.09.01"),
      endDate: parseStoredDate("2026.08.31"),
      deposit: 150_000_000,
      monthlyRent: 0,
      maintenanceFee: 120_000,
      status: ContractStatus.ACTIVE,
    },
    update: {
      type: CONTRACT_TYPE["전세"],
      startDate: parseStoredDate("2024.09.01"),
      endDate: parseStoredDate("2026.08.31"),
      deposit: 150_000_000,
      monthlyRent: 0,
      maintenanceFee: 120_000,
      status: ContractStatus.ACTIVE,
    },
  });

  await prisma.rentPayment.upsert({
    where: {
      homeId_yearMonth: {
        homeId: "home-1",
        yearMonth: CURRENT_RENT_YEAR_MONTH,
      },
    },
    create: {
      id: "rent-1",
      homeId: "home-1",
      yearMonth: CURRENT_RENT_YEAR_MONTH,
      amount: 500_000,
      dueDay: DEFAULT_RENT_DUE_DAY,
      status: PAYMENT_STATUS["예정"],
    },
    update: {
      amount: 500_000,
      dueDay: DEFAULT_RENT_DUE_DAY,
      status: PAYMENT_STATUS["예정"],
    },
  });

  const expenseSeeds = [
    {
      id: "expense-1",
      homeId: "home-1",
      category: "관리비" as const,
      amount: 80_000,
      dueDay: 10,
    },
    {
      id: "expense-2",
      homeId: "home-1",
      category: "전기" as const,
      amount: 45_000,
      dueDay: 15,
    },
    {
      id: "expense-3",
      homeId: "home-1",
      category: "수도" as const,
      amount: 40_000,
      dueDay: 20,
    },
    {
      id: "expense-4",
      homeId: "home-2",
      category: "관리비" as const,
      amount: 60_000,
      dueDay: 10,
    },
    {
      id: "expense-5",
      homeId: "home-2",
      category: "전기" as const,
      amount: 35_000,
      dueDay: 15,
    },
  ] as const;

  for (const expense of expenseSeeds) {
    await prisma.expensePayment.upsert({
      where: {
        homeId_yearMonth_category: {
          homeId: expense.homeId,
          yearMonth: CURRENT_RENT_YEAR_MONTH,
          category: EXPENSE_CATEGORY[expense.category],
        },
      },
      create: {
        id: expense.id,
        homeId: expense.homeId,
        yearMonth: CURRENT_RENT_YEAR_MONTH,
        category: EXPENSE_CATEGORY[expense.category],
        amount: expense.amount,
        dueDay: expense.dueDay,
        status: PAYMENT_STATUS["예정"],
      },
      update: {
        amount: expense.amount,
        dueDay: expense.dueDay,
        status: PAYMENT_STATUS["예정"],
      },
    });
  }

  const [homeCount, contractCount, rentCount, expenseCount] = await Promise.all([
    prisma.home.count(),
    prisma.contract.count(),
    prisma.rentPayment.count(),
    prisma.expensePayment.count(),
  ]);

  console.log("Seed completed.");
  console.log(`Home: ${homeCount}`);
  console.log(`Contract: ${contractCount}`);
  console.log(`RentPayment: ${rentCount}`);
  console.log(`ExpensePayment: ${expenseCount}`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
