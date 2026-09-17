import { getYearMonthFromString } from "@/lib/utils/date";
import { calculateDDay, formatDDay } from "@/lib/utils/homes";

export type ContractExpiryStatus =
  | "normal"
  | "notice"
  | "warning"
  | "expired"
  | "unknown";

const MONTHLY_CONTRACT_TYPES = new Set([
  "월세",
  "반전세",
  "MONTHLY",
  "SEMI_JEONSE",
]);

export function normalizeContractEndDate(endDate: string): string {
  return endDate.includes("-") ? endDate.replace(/-/g, ".") : endDate;
}

export function getContractExpiryStatus(
  endDate: string,
): ContractExpiryStatus {
  const days = calculateDDay(normalizeContractEndDate(endDate));

  if (!Number.isFinite(days)) {
    return "unknown";
  }

  if (days < 0) {
    return "expired";
  }

  if (days < 30) {
    return "warning";
  }

  if (days < 90) {
    return "notice";
  }

  return "normal";
}

export function isMonthlyContractType(type: string): boolean {
  return MONTHLY_CONTRACT_TYPES.has(type);
}

export function isContractEligibleForRent(options: {
  type: string;
  monthlyRent: number;
  endDate: string;
}): boolean {
  if (!isMonthlyContractType(options.type)) {
    return false;
  }

  if (options.monthlyRent <= 0) {
    return false;
  }

  return getContractExpiryStatus(options.endDate) !== "expired";
}

export function isContractEligibleForMaintenance(options: {
  maintenanceFee: number;
  endDate: string;
}): boolean {
  if (options.maintenanceFee <= 0) {
    return false;
  }

  return getContractExpiryStatus(options.endDate) !== "expired";
}

function toYearMonthKey(year: number, month: number): number {
  return year * 12 + month;
}

function parseContractYearMonth(date: string): { year: number; month: number } {
  const normalized = normalizeContractEndDate(date);
  const [year, month] = normalized.split(".").map(Number);
  return { year, month };
}

export function isYearMonthWithinContract(
  startDate: string,
  endDate: string,
  yearMonth: string,
): boolean {
  const { year, month } = getYearMonthFromString(yearMonth);
  const targetKey = toYearMonthKey(year, month);
  const start = parseContractYearMonth(startDate);
  const end = parseContractYearMonth(endDate);
  const startKey = toYearMonthKey(start.year, start.month);
  const endKey = toYearMonthKey(end.year, end.month);

  return targetKey >= startKey && targetKey <= endKey;
}

export function isContractEligibleForRentInMonth(options: {
  type: string;
  monthlyRent: number;
  startDate: string;
  endDate: string;
  yearMonth: string;
}): boolean {
  if (!isMonthlyContractType(options.type) || options.monthlyRent <= 0) {
    return false;
  }

  return isYearMonthWithinContract(
    options.startDate,
    options.endDate,
    options.yearMonth,
  );
}

export function isContractEligibleForMaintenanceInMonth(options: {
  maintenanceFee: number;
  startDate: string;
  endDate: string;
  yearMonth: string;
}): boolean {
  if (options.maintenanceFee <= 0) {
    return false;
  }

  return isYearMonthWithinContract(
    options.startDate,
    options.endDate,
    options.yearMonth,
  );
}

export function isRentPaymentBillable(options: {
  paymentStatus: "예정" | "완료";
  contractType: string;
  contractEndDate: string;
}): boolean {
  if (!isMonthlyContractType(options.contractType)) {
    return false;
  }

  if (options.paymentStatus === "완료") {
    return true;
  }

  return getContractExpiryStatus(options.contractEndDate) !== "expired";
}

export function getContractStatusMessage(
  status: ContractExpiryStatus,
): string | null {
  switch (status) {
    case "notice":
      return "계약 종료가 다가오고 있어요.";
    case "warning":
      return "계약 종료가 얼마 남지 않았어요. 갱신이 필요하면 계약 정보를 업데이트해주세요.";
    case "expired":
      return "계약 기간이 끝났어요. 계약을 갱신하면 월세 일정을 다시 관리할 수 있어요.";
    default:
      return null;
  }
}

export function getContractActionLabel(status: ContractExpiryStatus): string {
  switch (status) {
    case "expired":
    case "warning":
      return "계약 갱신하기";
    default:
      return "계약 수정";
  }
}

export function getContractStatusBadgeLabel(
  status: ContractExpiryStatus,
): string {
  switch (status) {
    case "expired":
      return "계약 종료";
    case "warning":
      return "종료 임박";
    case "notice":
      return "종료 예정";
    default:
      return "계약 진행 중";
  }
}

export function getContractStatusBadgeClassName(
  status: ContractExpiryStatus,
): string {
  switch (status) {
    case "expired":
      return "ui-badge-muted";
    case "warning":
      return "ui-badge-warning-strong";
    case "notice":
      return "ui-badge-warning";
    default:
      return "ui-badge-success";
  }
}

export function getContractDDayClassName(
  status: ContractExpiryStatus,
): string {
  switch (status) {
    case "expired":
      return "text-text-secondary";
    case "warning":
      return "text-warning-strong";
    case "notice":
      return "text-warning";
    default:
      return "text-text-primary";
  }
}

export { formatDDay };
