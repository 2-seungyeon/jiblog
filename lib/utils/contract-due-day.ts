import {
  DEFAULT_MAINTENANCE_DUE_DAY,
  DEFAULT_RENT_DUE_DAY,
} from "@/lib/constants/app";
import type { ContractType } from "@/lib/types/homes";

export type ContractDueDayFieldErrors = {
  rentDueDay?: string;
  maintenanceDueDay?: string;
};

function parseDueDay(value: string): number | null {
  if (value.trim() === "") {
    return null;
  }

  const dueDay = Number(value);

  if (!Number.isInteger(dueDay)) {
    return null;
  }

  return dueDay;
}

export function needsRentDueDay(
  contractType: ContractType | null,
  monthlyRent: number,
): boolean {
  return contractType !== "전세" && monthlyRent > 0;
}

export function needsMaintenanceDueDay(maintenanceFee: number): boolean {
  return maintenanceFee > 0;
}

export function resolveContractDueDays(input: {
  contractType: ContractType | null;
  monthlyRent: number;
  maintenanceFee: number;
  rentDueDayValue: string;
  maintenanceDueDayValue: string;
}): {
  rentDueDay: number;
  maintenanceDueDay: number;
  errors: ContractDueDayFieldErrors;
} {
  const errors: ContractDueDayFieldErrors = {};
  const rentRequired = needsRentDueDay(input.contractType, input.monthlyRent);
  const maintenanceRequired = needsMaintenanceDueDay(input.maintenanceFee);

  const rentDueDay = parseContractDueDayField(
    input.rentDueDayValue,
    DEFAULT_RENT_DUE_DAY,
    "rentDueDay",
    errors,
    rentRequired,
  );
  const maintenanceDueDay = parseContractDueDayField(
    input.maintenanceDueDayValue,
    DEFAULT_MAINTENANCE_DUE_DAY,
    "maintenanceDueDay",
    errors,
    maintenanceRequired,
  );

  return { rentDueDay, maintenanceDueDay, errors };
}

function parseContractDueDayField(
  value: string,
  fallback: number,
  field: keyof ContractDueDayFieldErrors,
  errors: ContractDueDayFieldErrors,
  required: boolean,
): number {
  if (!required) {
    return fallback;
  }

  const parsed = value === "" ? null : parseDueDay(value);

  if (parsed === null) {
    errors[field] = "납부 예정일을 입력해주세요";
    return fallback;
  }

  if (parsed < 1 || parsed > 31) {
    errors[field] = "납부 예정일은 1일부터 31일 사이여야 해요";
    return fallback;
  }

  return parsed;
}
