import type { RentEmptyReason } from "@/lib/utils/contract-display-status";
import { formatYearMonthLabel, isCurrentYearMonth } from "@/lib/utils/year-month";

export function getRentPageDescription(yearMonth: string): string {
  return isCurrentYearMonth(yearMonth)
    ? "이번 달 월세 납부 현황"
    : `${formatYearMonthLabel(yearMonth)} 월세 납부 현황`;
}

export function getMaintenancePageDescription(yearMonth: string): string {
  return isCurrentYearMonth(yearMonth)
    ? "이번 달 관리비 납부 현황"
    : `${formatYearMonthLabel(yearMonth)} 관리비 납부 현황`;
}

export function getExpensesPageDescription(yearMonth: string): string {
  return isCurrentYearMonth(yearMonth)
    ? "전기·가스·수도 등 공과금 납부 현황"
    : `${formatYearMonthLabel(yearMonth)} 공과금 납부 현황`;
}

export function shouldShowRentOnboardingEmpty(
  emptyReason: RentEmptyReason | null,
  isCurrentMonth: boolean,
): boolean {
  if (!emptyReason) {
    return false;
  }

  if (
    emptyReason === "no-home" ||
    emptyReason === "no-contract" ||
    emptyReason === "expired" ||
    emptyReason === "jeonse-only"
  ) {
    return true;
  }

  return emptyReason === "active-no-payments" && isCurrentMonth;
}
