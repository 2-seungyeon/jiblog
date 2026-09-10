import type { ContractType, HomeContractDetail } from "@/lib/types/homes";
import { formatWon } from "@/lib/utils/format";

export function formatMonthlyRentDisplay(
  type: ContractType,
  monthlyRent: number,
): string {
  if (type === "전세" || monthlyRent === 0) {
    return "해당 없음";
  }

  return formatWon(monthlyRent);
}

export function formatContractAmounts(contract: HomeContractDetail) {
  return {
    deposit: formatWon(contract.deposit),
    monthlyRent: formatMonthlyRentDisplay(contract.type, contract.monthlyRent),
    maintenanceFee: formatWon(contract.maintenanceFee),
  };
}

export function formatRentSnapshotDisplay(
  contractType: ContractType | null,
  rentAmount: number,
  rentStatus: string,
): string {
  if (contractType === "전세") {
    return "해당 없음";
  }

  if (rentAmount === 0) {
    return rentStatus;
  }

  return `${formatWon(rentAmount)} · ${rentStatus}`;
}
