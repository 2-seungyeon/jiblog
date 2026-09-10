import type { HomeContractSummary, HomeListItem } from "@/lib/types/homes";
import {
  formatDDay,
  getContractExpiryStatus,
  getContractStatusBadgeClassName,
  getContractStatusBadgeLabel,
  type ContractExpiryStatus,
} from "@/lib/utils/contract-status";
import { getContractDateLineClassName } from "@/lib/utils/status-display";

export type RentEmptyReason =
  | "no-home"
  | "no-contract"
  | "expired"
  | "jeonse-only"
  | "active-no-payments";

export function getHomeContractExpiryStatus(
  contract: HomeContractSummary,
): ContractExpiryStatus | null {
  if (!contract.hasContract) {
    return null;
  }

  return getContractExpiryStatus(contract.endDate);
}

export function formatHomeContractLine(contract: HomeContractSummary): string {
  if (!contract.hasContract) {
    return "계약을 등록하면 월세와 일정을 관리할 수 있어요.";
  }

  const dDay = formatDDay(contract.endDate);
  return `종료 ${contract.endDate} · ${dDay}`;
}

export function getHomeContractLineClassName(
  contract: HomeContractSummary,
): string {
  if (!contract.hasContract) {
    return "ui-contract-date-empty";
  }

  return getContractDateLineClassName(
    getContractExpiryStatus(contract.endDate),
  );
}

export function hasActiveMonthlyContract(homes: HomeListItem[]): boolean {
  return homes.some(
    (home) =>
      home.contract.hasContract &&
      home.contract.type !== "전세" &&
      getContractExpiryStatus(home.contract.endDate) !== "expired",
  );
}

export function findExpiredMonthlyHome(
  homes: HomeListItem[],
): HomeListItem | null {
  return (
    homes.find(
      (home) =>
        home.contract.hasContract &&
        home.contract.type !== "전세" &&
        getContractExpiryStatus(home.contract.endDate) === "expired",
    ) ?? null
  );
}

export function resolveRentEmptyReason(
  homes: HomeListItem[],
  paymentCount: number,
): RentEmptyReason | null {
  if (paymentCount > 0) {
    return null;
  }

  if (homes.length === 0) {
    return "no-home";
  }

  const hasAnyContract = homes.some((home) => home.contract.hasContract);

  if (!hasAnyContract) {
    return "no-contract";
  }

  if (findExpiredMonthlyHome(homes)) {
    return "expired";
  }

  if (!hasActiveMonthlyContract(homes)) {
    return "jeonse-only";
  }

  return "active-no-payments";
}

export {
  getContractStatusBadgeClassName,
  getContractStatusBadgeLabel,
};
