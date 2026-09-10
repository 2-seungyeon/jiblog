import "server-only";

import {
  ContractStatus,
  ContractType,
  ExpenseCategory,
  PaymentStatus,
  ResidenceStatus,
  type Contract,
  type RentPayment,
} from "@prisma/client";

import type {
  ContractType as ContractTypeLabel,
  ExpenseCategory as ExpenseCategoryLabel,
  HomeContractDetail,
  HomeContractSummary,
  RentPaymentStatus,
  ResidenceStatus as ResidenceStatusLabel,
} from "@/lib/types/homes";

export const RESIDENCE_STATUS_LABEL: Record<
  ResidenceStatus,
  ResidenceStatusLabel
> = {
  [ResidenceStatus.RESIDING]: "거주 중",
  [ResidenceStatus.MOVING_OUT]: "이사 예정",
  [ResidenceStatus.PAST]: "과거 거주",
};

export const RESIDENCE_STATUS_PRISMA: Record<
  ResidenceStatusLabel,
  ResidenceStatus
> = {
  "거주 중": ResidenceStatus.RESIDING,
  "이사 예정": ResidenceStatus.MOVING_OUT,
  "과거 거주": ResidenceStatus.PAST,
};

export const CONTRACT_TYPE_LABEL: Record<ContractType, ContractTypeLabel> = {
  [ContractType.MONTHLY]: "월세",
  [ContractType.JEONSE]: "전세",
  [ContractType.SEMI_JEONSE]: "반전세",
};

export const CONTRACT_TYPE_PRISMA: Record<ContractTypeLabel, ContractType> = {
  월세: ContractType.MONTHLY,
  전세: ContractType.JEONSE,
  반전세: ContractType.SEMI_JEONSE,
};

export const CONTRACT_STATUS_LABEL: Record<ContractStatus, string> = {
  [ContractStatus.ACTIVE]: "계약 진행 중",
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, RentPaymentStatus> = {
  [PaymentStatus.SCHEDULED]: "예정",
  [PaymentStatus.COMPLETED]: "완료",
};

export const EXPENSE_CATEGORY_LABEL: Record<
  ExpenseCategory,
  ExpenseCategoryLabel
> = {
  [ExpenseCategory.MAINTENANCE]: "관리비",
  [ExpenseCategory.ELECTRICITY]: "전기",
  [ExpenseCategory.GAS]: "가스",
  [ExpenseCategory.WATER]: "수도",
  [ExpenseCategory.INTERNET]: "인터넷",
  [ExpenseCategory.OTHER]: "기타",
};

export const EXPENSE_CATEGORY_PRISMA: Record<
  ExpenseCategoryLabel,
  ExpenseCategory
> = {
  관리비: ExpenseCategory.MAINTENANCE,
  전기: ExpenseCategory.ELECTRICITY,
  가스: ExpenseCategory.GAS,
  수도: ExpenseCategory.WATER,
  인터넷: ExpenseCategory.INTERNET,
  기타: ExpenseCategory.OTHER,
};

export function formatStoredDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
}

export function toContractSummary(contract: Contract | null): HomeContractSummary {
  if (!contract) {
    return { hasContract: false };
  }

  return {
    hasContract: true,
    type: CONTRACT_TYPE_LABEL[contract.type],
    endDate: formatStoredDate(contract.endDate),
  };
}

export function toContractDetail(contract: Contract): HomeContractDetail {
  return {
    type: CONTRACT_TYPE_LABEL[contract.type],
    startDate: formatStoredDate(contract.startDate),
    endDate: formatStoredDate(contract.endDate),
    deposit: contract.deposit,
    monthlyRent: contract.monthlyRent,
    maintenanceFee: contract.maintenanceFee,
    status: CONTRACT_STATUS_LABEL[contract.status],
  };
}

export function getRentStatusLabel(
  rentPayment: RentPayment | undefined,
  contractDetail: HomeContractDetail | null,
): string {
  if (
    !contractDetail ||
    contractDetail.type === "전세" ||
    contractDetail.monthlyRent === 0
  ) {
    return "해당 없음";
  }

  if (!rentPayment) {
    return "납부 예정";
  }

  return PAYMENT_STATUS_LABEL[rentPayment.status] === "완료"
    ? "납부 완료"
    : "납부 예정";
}
