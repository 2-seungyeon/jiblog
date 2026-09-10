import "server-only";

import { ContractStatus, ExpenseCategory, PaymentStatus } from "@prisma/client";

import { DEFAULT_RENT_DUE_DAY } from "@/lib/constants/app";
import { prisma } from "@/lib/prisma";
import { isContractEligibleForMaintenance } from "@/lib/utils/contract-status";
import { formatDateFromDb, getCurrentYearMonth } from "@/lib/utils/date";

export async function ensureCurrentMonthMaintenancePayments(
  userId: string,
): Promise<void> {
  const yearMonth = getCurrentYearMonth();

  const homes = await prisma.home.findMany({
    where: {
      userId,
      contract: {
        status: ContractStatus.ACTIVE,
        maintenanceFee: { gt: 0 },
      },
    },
    select: {
      id: true,
      contract: {
        select: {
          maintenanceFee: true,
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
      !isContractEligibleForMaintenance({
        maintenanceFee: home.contract.maintenanceFee,
        endDate,
      })
    ) {
      return [];
    }

    return [
      {
        homeId: home.id,
        yearMonth,
        category: ExpenseCategory.MAINTENANCE,
        amount: home.contract.maintenanceFee,
        dueDay: DEFAULT_RENT_DUE_DAY,
        status: PaymentStatus.SCHEDULED,
      },
    ];
  });

  if (paymentsToCreate.length > 0) {
    await prisma.expensePayment.createMany({
      data: paymentsToCreate,
      skipDuplicates: true,
    });
  }
}
