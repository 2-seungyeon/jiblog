import { formatWon } from "@/lib/utils/format";

export function getMaintenanceOverviewFootnote(
  maintenanceAmount: number,
  contractMaintenanceTotal: number,
): string | undefined {
  if (maintenanceAmount > 0 || contractMaintenanceTotal <= 0) {
    return undefined;
  }

  return `계약 관리비 ${formatWon(contractMaintenanceTotal)} · 납부 일정 미등록`;
}

export function sumContractMaintenanceFees(
  contractFees: Array<{ maintenanceFee: number }>,
): number {
  return contractFees.reduce((sum, home) => sum + home.maintenanceFee, 0);
}
