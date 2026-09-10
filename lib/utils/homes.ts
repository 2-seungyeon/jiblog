import {
  CONTRACT_TYPE_OPTIONS,
  EXPENSE_CATEGORY_OPTIONS,
  RESIDENCE_STATUS_OPTIONS,
  type ContractType,
  type ExpenseCategory,
  type HomeContractSummary,
  type ExpensePaymentStatus,
  type RentPaymentStatus,
  type ResidenceStatus,
} from "@/lib/types/homes";
import { getKSTToday } from "@/lib/utils/date";

export function toFormDate(storedDate: string): string {
  const [year, month, day] = storedDate.split(".");
  return `${year}-${month}-${day}`;
}

export function formatRentPaymentStatus(status: RentPaymentStatus): string {
  return status === "완료" ? "납부 완료" : "납부 예정";
}

export function formatExpensePaymentStatus(
  status: ExpensePaymentStatus,
): string {
  return status === "완료" ? "납부 완료" : "납부 예정";
}

export function formatContractSummary(contract: HomeContractSummary): string {
  if (!contract.hasContract) {
    return "계약 미등록";
  }

  return `${contract.type} · 계약 종료 ${contract.endDate}`;
}

export function parseEndDate(endDate: string): Date | null {
  if (!endDate || endDate === "-") {
    return null;
  }

  const parts = endDate.split(".");

  if (parts.length !== 3) {
    return null;
  }

  const [year, month, day] = parts.map(Number);

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null;
  }

  return new Date(year, month - 1, day);
}

export function calculateDDay(
  endDate: string,
  baseDate: Date = getKSTToday(),
): number {
  const end = parseEndDate(endDate);

  if (!end) {
    return Number.NaN;
  }

  const today = getKSTToday(baseDate);
  const diffMs = end.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function formatDDay(endDate: string, baseDate: Date = getKSTToday()): string {
  const days = calculateDDay(endDate, baseDate);

  if (!Number.isFinite(days)) {
    return "—";
  }

  if (days > 0) {
    return `D-${days}`;
  }

  if (days === 0) {
    return "D-Day";
  }

  return `D+${Math.abs(days)}`;
}

export function isResidenceStatus(value: string): value is ResidenceStatus {
  return RESIDENCE_STATUS_OPTIONS.includes(value as ResidenceStatus);
}

export function isContractType(value: string): value is ContractType {
  return CONTRACT_TYPE_OPTIONS.includes(value as ContractType);
}

export function isExpenseCategory(value: string): value is ExpenseCategory {
  return EXPENSE_CATEGORY_OPTIONS.includes(value as ExpenseCategory);
}
