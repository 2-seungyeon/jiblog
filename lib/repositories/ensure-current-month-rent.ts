import "server-only";

import {
  ContractStatus,
  ContractType,
  PaymentStatus,
} from "@prisma/client";

import { DEFAULT_RENT_DUE_DAY } from "@/lib/constants/app";
import { prisma } from "@/lib/prisma";
import { isContractEligibleForRent } from "@/lib/utils/contract-status";
import { formatDateFromDb, getCurrentYearMonth } from "@/lib/utils/date";
import { ensureCurrentMonthMaintenancePayments } from "@/lib/repositories/ensure-current-month-maintenance";

export async function ensureCurrentMonthRentPayments(
  userId: string,
): Promise<string> {
  const yearMonth = getCurrentYearMonth();

  const homes = await prisma.home.findMany({
    where: {
      userId,
      contract: {
        status: ContractStatus.ACTIVE,
        type: { in: [ContractType.MONTHLY, ContractType.SEMI_JEONSE] },
        monthlyRent: { gt: 0 },
      },
    },
    select: {
      id: true,
      contract: {
        select: {
          type: true,
          monthlyRent: true,
          endDate: true,
        },
      },
    },
  });

  const paymentsToCreate = homes.flatMap((home) => {
    if (!home.contract) {
      return [];
    }

    const endDate = formatDateFromDb(home.contract.endDate);

    if (
      !isContractEligibleForRent({
        type: home.contract.type,
        monthlyRent: home.contract.monthlyRent,
        endDate,
      })
    ) {
      return [];
    }

    return [
      {
        homeId: home.id,
        yearMonth,
        amount: home.contract.monthlyRent,
        dueDay: DEFAULT_RENT_DUE_DAY,
        status: PaymentStatus.SCHEDULED,
      },
    ];
  });

  if (paymentsToCreate.length > 0) {
    await prisma.rentPayment.createMany({
      data: paymentsToCreate,
      skipDuplicates: true,
    });
  }

  await ensureCurrentMonthMaintenancePayments(userId);

  return yearMonth;
}
