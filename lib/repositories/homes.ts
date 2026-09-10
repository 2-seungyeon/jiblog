import "server-only";

import {
  ContractStatus,
  PaymentStatus,
  type Contract,
  type ExpensePayment,
  type Home,
  type RentPayment,
} from "@prisma/client";

import { requireUser } from "@/lib/auth/user";
import { prisma } from "@/lib/prisma";
import { DEFAULT_RENT_DUE_DAY } from "@/lib/constants/app";
import { ensureCurrentMonthRentPayments } from "@/lib/repositories/ensure-current-month-rent";
import {
  getCurrentYearMonth,
  getCurrentYearMonthLabel,
} from "@/lib/utils/date";
import { getContractExpiryStatus, isContractEligibleForRent } from "@/lib/utils/contract-status";
import {
  CONTRACT_TYPE_PRISMA,
  EXPENSE_CATEGORY_LABEL,
  formatStoredDate,
  getRentStatusLabel,
  RESIDENCE_STATUS_LABEL,
  RESIDENCE_STATUS_PRISMA,
  toContractDetail,
  toContractSummary,
} from "@/lib/utils/prisma-labels";
import { splitExpensePayments } from "@/lib/utils/payment-category";
import { devLoadingDelay } from "@/lib/utils/dev-loading-delay";
import type {
  CreateContractInput,
  CreateHomeInput,
  HomeDeleteCheck,
  HomeDetail,
  HomeListItem,
  HomePaymentSnapshot,
  UpdateContractInput,
  UpdateHomeInput,
} from "@/lib/types/homes";

type HomeWithContract = Home & { contract: Contract | null };

type HomeWithRelations = Home & {
  contract: Contract | null;
  rentPayments: RentPayment[];
  expensePayments: ExpensePayment[];
};

function parseFormDateToDbDate(date: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function buildPaymentSnapshot(
  contract: Contract | null,
  rentPayments: RentPayment[],
  expensePayments: ExpensePayment[],
  yearMonthLabel: string,
): HomePaymentSnapshot | null {
  if (!contract) {
    return null;
  }

  const contractDetail = toContractDetail(contract);
  const rentPayment = rentPayments[0];
  const isExpired = getContractExpiryStatus(contractDetail.endDate) === "expired";
  const rentAmount =
    isExpired && rentPayment?.status === PaymentStatus.SCHEDULED
      ? 0
      : (rentPayment?.amount ?? 0);
  const rentStatus =
    isExpired && rentPayment?.status === PaymentStatus.SCHEDULED
      ? "계약 종료"
      : getRentStatusLabel(rentPayment, contractDetail);
  const expenseItems = expensePayments.map((payment) => ({
    category: EXPENSE_CATEGORY_LABEL[payment.category] as import("@/lib/types/homes").ExpenseCategory,
    amount: payment.amount,
  }));
  const { maintenanceAmount, utilityAmount } = splitExpensePayments(expenseItems);
  const utilityCount = expenseItems.filter(
    (item) => item.category !== "관리비",
  ).length;

  return {
    yearMonth: yearMonthLabel,
    rentAmount,
    rentStatus,
    maintenanceAmount,
    utilityExpenseAmount: utilityAmount,
    expenseCount: utilityCount,
  };
}

function toHomeListItem(home: HomeWithContract): HomeListItem {
  return {
    id: home.id,
    nickname: home.nickname,
    address: home.address,
    detailAddress: home.detailAddress ?? undefined,
    isPrimary: home.isPrimary,
    residenceStatus: RESIDENCE_STATUS_LABEL[home.residenceStatus],
    contract: toContractSummary(home.contract),
  };
}

function toHomeDetail(
  home: HomeWithRelations,
  yearMonthLabel: string,
): HomeDetail {
  return {
    ...toHomeListItem(home),
    moveInDate: home.moveInDate ? formatStoredDate(home.moveInDate) : undefined,
    detailAddress: home.detailAddress ?? undefined,
    memo: home.memo ?? undefined,
    contractDetail: home.contract ? toContractDetail(home.contract) : null,
    paymentSnapshot: buildPaymentSnapshot(
      home.contract,
      home.rentPayments,
      home.expensePayments,
      yearMonthLabel,
    ),
  };
}

export async function getHomes(): Promise<HomeListItem[]> {
  await devLoadingDelay();
  const user = await requireUser();

  const homes = await prisma.home.findMany({
    where: { userId: user.id },
    include: { contract: true },
    orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
  });

  return homes.map(toHomeListItem);
}

export async function getHomeDetail(id: string): Promise<HomeDetail | null> {
  await devLoadingDelay();
  const user = await requireUser();
  const yearMonth = await ensureCurrentMonthRentPayments(user.id);
  const yearMonthLabel = getCurrentYearMonthLabel();

  const home = await prisma.home.findFirst({
    where: { id, userId: user.id },
    include: {
      contract: true,
      rentPayments: {
        where: { yearMonth },
      },
      expensePayments: {
        where: { yearMonth },
      },
    },
  });

  if (!home) {
    return null;
  }

  return toHomeDetail(home, yearMonthLabel);
}

export async function getDefaultIsPrimary(): Promise<boolean> {
  const user = await requireUser();
  const homeCount = await prisma.home.count({
    where: { userId: user.id },
  });

  if (homeCount === 0) {
    return true;
  }

  const primaryCount = await prisma.home.count({
    where: { userId: user.id, isPrimary: true },
  });

  return primaryCount === 0;
}

export async function createHome(input: CreateHomeInput): Promise<string> {
  const user = await requireUser();
  const residenceStatus = RESIDENCE_STATUS_PRISMA[input.residenceStatus];

  return prisma.$transaction(async (tx) => {
    const homeCount = await tx.home.count({
      where: { userId: user.id },
    });
    const primaryCount = await tx.home.count({
      where: { userId: user.id, isPrimary: true },
    });
    const isPrimary = input.isPrimary || homeCount === 0 || primaryCount === 0;

    if (isPrimary) {
      await tx.home.updateMany({
        where: { userId: user.id, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const home = await tx.home.create({
      data: {
        userId: user.id,
        nickname: input.nickname,
        address: input.address,
        detailAddress: input.detailAddress,
        residenceStatus,
        moveInDate: input.moveInDate
          ? parseFormDateToDbDate(input.moveInDate)
          : null,
        isPrimary,
        memo: input.memo,
      },
    });

    return home.id;
  });
}

export async function updateHome(
  homeId: string,
  input: UpdateHomeInput,
): Promise<boolean> {
  const user = await requireUser();

  const existing = await prisma.home.findFirst({
    where: { id: homeId, userId: user.id },
    select: { id: true, isPrimary: true },
  });

  if (!existing) {
    return false;
  }

  const residenceStatus = RESIDENCE_STATUS_PRISMA[input.residenceStatus];

  await prisma.$transaction(async (tx) => {
    const homeCount = await tx.home.count({
      where: { userId: user.id },
    });
    let isPrimary = input.isPrimary;

    if (homeCount === 1) {
      isPrimary = true;
    } else if (!input.isPrimary && existing.isPrimary) {
      const otherPrimaryCount = await tx.home.count({
        where: {
          userId: user.id,
          isPrimary: true,
          NOT: { id: homeId },
        },
      });

      if (otherPrimaryCount === 0) {
        isPrimary = true;
      }
    }

    if (isPrimary) {
      await tx.home.updateMany({
        where: {
          userId: user.id,
          isPrimary: true,
          NOT: { id: homeId },
        },
        data: { isPrimary: false },
      });
    }

    await tx.home.update({
      where: { id: homeId },
      data: {
        nickname: input.nickname,
        address: input.address,
        detailAddress: input.detailAddress ?? null,
        residenceStatus,
        moveInDate: input.moveInDate
          ? parseFormDateToDbDate(input.moveInDate)
          : null,
        isPrimary,
        memo: input.memo ?? null,
      },
    });
  });

  return true;
}

export async function createContract(
  homeId: string,
  input: CreateContractInput,
): Promise<boolean> {
  const user = await requireUser();

  const home = await prisma.home.findFirst({
    where: { id: homeId, userId: user.id },
    include: { contract: true },
  });

  if (!home || home.contract) {
    return false;
  }

  const contractType = CONTRACT_TYPE_PRISMA[input.type];
  const monthlyRent = input.type === "전세" ? 0 : input.monthlyRent;

  await prisma.$transaction(async (tx) => {
    await tx.contract.create({
      data: {
        homeId,
        type: contractType,
        startDate: parseFormDateToDbDate(input.startDate),
        endDate: parseFormDateToDbDate(input.endDate),
        deposit: input.deposit,
        monthlyRent,
        maintenanceFee: input.maintenanceFee,
        status: ContractStatus.ACTIVE,
      },
    });

    if (
      input.type !== "전세" &&
      monthlyRent > 0 &&
      isContractEligibleForRent({
        type: input.type,
        monthlyRent,
        endDate: input.endDate.replace(/-/g, "."),
      })
    ) {
      const yearMonth = getCurrentYearMonth();
      const existingRentPayment = await tx.rentPayment.findUnique({
        where: {
          homeId_yearMonth: {
            homeId,
            yearMonth,
          },
        },
      });

      if (!existingRentPayment) {
        await tx.rentPayment.create({
          data: {
            homeId,
            yearMonth,
            amount: monthlyRent,
            dueDay: DEFAULT_RENT_DUE_DAY,
            status: PaymentStatus.SCHEDULED,
          },
        });
      }
    }
  });

  return true;
}

export async function updateContract(
  homeId: string,
  input: UpdateContractInput,
): Promise<boolean> {
  const user = await requireUser();

  const home = await prisma.home.findFirst({
    where: { id: homeId, userId: user.id },
    include: { contract: true },
  });

  if (!home?.contract) {
    return false;
  }

  const contractType = CONTRACT_TYPE_PRISMA[input.type];
  const monthlyRent = input.type === "전세" ? 0 : input.monthlyRent;
  const endDateLabel = input.endDate.replace(/-/g, ".");
  const canManageRent = isContractEligibleForRent({
    type: input.type,
    monthlyRent,
    endDate: endDateLabel,
  });

  await prisma.$transaction(async (tx) => {
    await tx.contract.update({
      where: { id: home.contract!.id },
      data: {
        type: contractType,
        startDate: parseFormDateToDbDate(input.startDate),
        endDate: parseFormDateToDbDate(input.endDate),
        deposit: input.deposit,
        monthlyRent,
        maintenanceFee: input.maintenanceFee,
      },
    });

    if (canManageRent) {
      await tx.rentPayment.updateMany({
        where: {
          homeId,
          status: PaymentStatus.SCHEDULED,
        },
        data: {
          amount: monthlyRent,
        },
      });

      const yearMonth = getCurrentYearMonth();
      const existingRentPayment = await tx.rentPayment.findUnique({
        where: {
          homeId_yearMonth: {
            homeId,
            yearMonth,
          },
        },
      });

      if (!existingRentPayment) {
        await tx.rentPayment.create({
          data: {
            homeId,
            yearMonth,
            amount: monthlyRent,
            dueDay: DEFAULT_RENT_DUE_DAY,
            status: PaymentStatus.SCHEDULED,
          },
        });
      }
    }
  });

  return true;
}

export async function getHomeDeleteCheck(
  homeId: string,
): Promise<HomeDeleteCheck | null> {
  const user = await requireUser();

  const home = await prisma.home.findFirst({
    where: { id: homeId, userId: user.id },
    select: { id: true },
  });

  if (!home) {
    return null;
  }

  const [completedRentCount, completedExpenseCount] = await Promise.all([
    prisma.rentPayment.count({
      where: {
        homeId,
        status: PaymentStatus.COMPLETED,
      },
    }),
    prisma.expensePayment.count({
      where: {
        homeId,
        status: PaymentStatus.COMPLETED,
      },
    }),
  ]);

  if (completedRentCount > 0 || completedExpenseCount > 0) {
    return {
      canDelete: false,
      message:
        "완료된 납부 기록이 있어 이 집은 삭제할 수 없어요. 거주 상태를 ‘과거 거주’로 변경해 관리를 종료할 수 있어요.",
    };
  }

  return {
    canDelete: true,
    message: "",
  };
}

export async function deleteHome(
  homeId: string,
): Promise<{ success: true } | { success: false; message: string }> {
  const user = await requireUser();
  const deleteCheck = await getHomeDeleteCheck(homeId);

  if (!deleteCheck) {
    return { success: false, message: "집 정보를 찾을 수 없어요" };
  }

  if (!deleteCheck.canDelete) {
    return { success: false, message: deleteCheck.message };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const home = await tx.home.findFirst({
        where: { id: homeId, userId: user.id },
        select: { id: true, isPrimary: true },
      });

      if (!home) {
        throw new Error("NOT_FOUND");
      }

      const wasPrimary = home.isPrimary;

      await tx.home.delete({
        where: { id: homeId },
      });

      if (wasPrimary) {
        const nextPrimary = await tx.home.findFirst({
          where: { userId: user.id },
          orderBy: { createdAt: "asc" },
          select: { id: true },
        });

        if (nextPrimary) {
          await tx.home.update({
            where: { id: nextPrimary.id },
            data: { isPrimary: true },
          });
        }
      }
    });
  } catch {
    return { success: false, message: "집을 삭제할 수 없어요" };
  }

  return { success: true };
}
