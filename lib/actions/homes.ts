"use server";

import {
  createContract as createContractInDb,
  createHome as createHomeInDb,
  deleteHome as deleteHomeInDb,
  updateContract as updateContractInDb,
  updateHome as updateHomeInDb,
} from "@/lib/repositories/homes";
import {
  completeExpensePayment as completeExpensePaymentInDb,
  createExpensePayment as createExpensePaymentInDb,
  uncompleteExpensePayment as uncompleteExpensePaymentInDb,
} from "@/lib/repositories/expenses";
import { createMaintenancePaymentForMonth as createMaintenancePaymentForMonthInDb } from "@/lib/repositories/maintenance";
import {
  completeRentPayment as completeRentPaymentInDb,
  createRentPaymentForMonth as createRentPaymentForMonthInDb,
  uncompleteRentPayment as uncompleteRentPaymentInDb,
} from "@/lib/repositories/rent";
import { AuthError } from "@/lib/auth/user";
import type {
  CompleteExpensePaymentResult,
  CompleteRentPaymentResult,
  ContractType,
  CreateContractFieldErrors,
  CreateContractResult,
  CreateExpenseFieldErrors,
  CreateExpenseResult,
  CreateHomeFieldErrors,
  CreateHomeResult,
  CreatePaymentRecordResult,
  DeleteHomeResult,
  UpdateContractResult,
  UpdateHomeFieldErrors,
  UpdateHomeResult,
} from "@/lib/types/homes";
import { resolveContractDueDays } from "@/lib/utils/contract-due-day";
import { isContractType, isExpenseCategory, isResidenceStatus } from "@/lib/utils/homes";
import { formatYearMonthLabel, parseYearMonthParam } from "@/lib/utils/year-month";

const AUTH_REQUIRED_MESSAGE = "로그인이 필요해요";

function parseFormDate(date: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function parseAmount(value: string): number | null {
  const normalized = value.replace(/,/g, "").trim();

  if (normalized === "") {
    return null;
  }

  const amount = Number(normalized);

  if (Number.isNaN(amount)) {
    return null;
  }

  return amount;
}

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

function validateContractForm(formData: FormData): {
  homeId: string;
  errors: CreateContractFieldErrors;
  contractType: ContractType | null;
  deposit: number | null;
  monthlyRent: number;
  maintenanceFee: number | null;
  rentDueDay: number;
  maintenanceDueDay: number;
  startDate: string;
  endDate: string;
} {
  const homeId = String(formData.get("homeId") ?? "").trim();
  const type = String(formData.get("type") ?? "");
  const startDate = String(formData.get("startDate") ?? "").trim();
  const endDate = String(formData.get("endDate") ?? "").trim();
  const depositValue = String(formData.get("deposit") ?? "").trim();
  const monthlyRentValue = String(formData.get("monthlyRent") ?? "").trim();
  const maintenanceFeeValue = String(formData.get("maintenanceFee") ?? "").trim();
  const rentDueDayValue = String(formData.get("rentDueDay") ?? "").trim();
  const maintenanceDueDayValue = String(formData.get("maintenanceDueDay") ?? "").trim();

  const errors: CreateContractFieldErrors = {};

  if (!homeId) {
    errors.type = "집 정보를 찾을 수 없어요";
  }

  if (!isContractType(type)) {
    errors.type = "계약 유형을 선택해주세요";
  }

  if (!startDate) {
    errors.startDate = "계약 시작일을 입력해주세요";
  }

  if (!endDate) {
    errors.endDate = "계약 종료일을 입력해주세요";
  }

  if (startDate && endDate) {
    const start = parseFormDate(startDate);
    const end = parseFormDate(endDate);

    if (end <= start) {
      errors.endDate = "계약 종료일은 계약 시작일보다 이후여야 합니다.";
    }
  }

  const deposit = parseAmount(depositValue);

  if (deposit === null) {
    errors.deposit = "보증금을 입력해주세요";
  } else if (deposit < 0) {
    errors.deposit = "보증금은 0원 이상이어야 해요";
  }

  const contractType = isContractType(type) ? type : null;
  let monthlyRent = 0;

  if (contractType === "전세") {
    monthlyRent = 0;
  } else if (contractType) {
    const parsedMonthlyRent = parseAmount(monthlyRentValue);

    if (parsedMonthlyRent === null) {
      errors.monthlyRent = "월세를 입력해주세요";
    } else if (parsedMonthlyRent < 0) {
      errors.monthlyRent = "월세는 0원 이상이어야 해요";
    } else {
      monthlyRent = parsedMonthlyRent;
    }
  }

  const parsedMaintenanceFee = parseAmount(maintenanceFeeValue ?? "0");
  const maintenanceFee =
    maintenanceFeeValue.trim() === "" ? 0 : parsedMaintenanceFee;

  if (maintenanceFee === null || maintenanceFee < 0) {
    errors.maintenanceFee = "관리비는 0원 이상이어야 해요";
  }

  const resolvedMaintenanceFee = maintenanceFee ?? 0;
  const dueDays = resolveContractDueDays({
    contractType,
    monthlyRent,
    maintenanceFee: resolvedMaintenanceFee,
    rentDueDayValue,
    maintenanceDueDayValue,
  });

  Object.assign(errors, dueDays.errors);

  return {
    homeId,
    errors,
    contractType,
    deposit,
    monthlyRent,
    maintenanceFee,
    rentDueDay: dueDays.rentDueDay,
    maintenanceDueDay: dueDays.maintenanceDueDay,
    startDate,
    endDate,
  };
}

export async function createHomeAction(
  formData: FormData,
): Promise<CreateHomeResult> {
  const nickname = String(formData.get("nickname") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const detailAddress = String(formData.get("detailAddress") ?? "").trim();
  const residenceStatus = String(formData.get("residenceStatus") ?? "");
  const moveInDate = String(formData.get("moveInDate") ?? "").trim();
  const memo = String(formData.get("memo") ?? "").trim();
  const isPrimary = formData.get("isPrimary") === "on";

  const errors: CreateHomeFieldErrors = {};

  if (!nickname) {
    errors.nickname = "별칭을 입력해주세요";
  }

  if (!address) {
    errors.address = "주소를 입력해주세요";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  const status = isResidenceStatus(residenceStatus)
    ? residenceStatus
    : "거주 중";

  try {
    const id = await createHomeInDb({
      nickname,
      address,
      detailAddress: detailAddress || undefined,
      residenceStatus: status,
      moveInDate: moveInDate || undefined,
      isPrimary,
      memo: memo || undefined,
    });

    return { success: true, id };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, errors: { nickname: AUTH_REQUIRED_MESSAGE } };
    }
    throw error;
  }
}

export async function updateHomeAction(
  formData: FormData,
): Promise<UpdateHomeResult> {
  const homeId = String(formData.get("homeId") ?? "").trim();
  const nickname = String(formData.get("nickname") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const detailAddress = String(formData.get("detailAddress") ?? "").trim();
  const residenceStatus = String(formData.get("residenceStatus") ?? "");
  const moveInDate = String(formData.get("moveInDate") ?? "").trim();
  const memo = String(formData.get("memo") ?? "").trim();
  const isPrimary = formData.get("isPrimary") === "on";

  const errors: UpdateHomeFieldErrors = {};

  if (!homeId) {
    return { success: false, errors: { nickname: "집 정보를 찾을 수 없어요" } };
  }

  if (!nickname) {
    errors.nickname = "별칭을 입력해주세요";
  }

  if (!address) {
    errors.address = "주소를 입력해주세요";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  const status = isResidenceStatus(residenceStatus)
    ? residenceStatus
    : "거주 중";

  try {
    const updated = await updateHomeInDb(homeId, {
      nickname,
      address,
      detailAddress: detailAddress || undefined,
      residenceStatus: status,
      moveInDate: moveInDate || undefined,
      isPrimary,
      memo: memo || undefined,
    });

    if (!updated) {
      return { success: false, errors: { nickname: "집 정보를 수정할 수 없어요" } };
    }

    return { success: true, homeId };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, errors: { nickname: AUTH_REQUIRED_MESSAGE } };
    }
    throw error;
  }
}

export async function deleteHomeAction(
  homeId: string,
): Promise<DeleteHomeResult> {
  const id = homeId.trim();

  if (!id) {
    return { success: false, message: "집 정보를 찾을 수 없어요" };
  }

  try {
    const result = await deleteHomeInDb(id);
    return result;
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, message: AUTH_REQUIRED_MESSAGE };
    }
    throw error;
  }
}

export async function createContractAction(
  formData: FormData,
): Promise<CreateContractResult> {
  const validated = validateContractForm(formData);

  if (Object.keys(validated.errors).length > 0) {
    return { success: false, errors: validated.errors };
  }

  const {
    homeId,
    contractType,
    deposit,
    monthlyRent,
    maintenanceFee,
    rentDueDay,
    maintenanceDueDay,
    startDate,
    endDate,
  } = validated;

  if (!contractType || deposit === null || maintenanceFee === null) {
    return { success: false, errors: { type: "입력값을 확인해주세요" } };
  }

  try {
    const created = await createContractInDb(homeId, {
      type: contractType,
      startDate,
      endDate,
      deposit,
      monthlyRent,
      maintenanceFee,
      rentDueDay,
      maintenanceDueDay,
    });

    if (!created) {
      return {
        success: false,
        errors: { type: "계약을 등록할 수 없어요" },
      };
    }

    return { success: true, homeId };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, errors: { type: AUTH_REQUIRED_MESSAGE } };
    }
    throw error;
  }
}

export async function updateContractAction(
  formData: FormData,
): Promise<UpdateContractResult> {
  const validated = validateContractForm(formData);

  if (Object.keys(validated.errors).length > 0) {
    return { success: false, errors: validated.errors };
  }

  const {
    homeId,
    contractType,
    deposit,
    monthlyRent,
    maintenanceFee,
    rentDueDay,
    maintenanceDueDay,
    startDate,
    endDate,
  } = validated;

  if (!contractType || deposit === null || maintenanceFee === null) {
    return { success: false, errors: { type: "입력값을 확인해주세요" } };
  }

  try {
    const updated = await updateContractInDb(homeId, {
      type: contractType,
      startDate,
      endDate,
      deposit,
      monthlyRent,
      maintenanceFee,
      rentDueDay,
      maintenanceDueDay,
    });

    if (!updated) {
      return {
        success: false,
        errors: { type: "계약을 수정할 수 없어요" },
      };
    }

    return { success: true, homeId };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, errors: { type: AUTH_REQUIRED_MESSAGE } };
    }
    throw error;
  }
}

export async function completeRentPaymentAction(
  paymentId: string,
): Promise<CompleteRentPaymentResult> {
  const id = paymentId.trim();

  if (!id) {
    return { success: false, message: "납부 정보를 찾을 수 없어요" };
  }

  try {
    const completed = await completeRentPaymentInDb(id);

    if (!completed) {
      return { success: false, message: "납부 완료 처리할 수 없어요" };
    }

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, message: AUTH_REQUIRED_MESSAGE };
    }
    throw error;
  }
}

export async function uncompleteRentPaymentAction(
  paymentId: string,
): Promise<CompleteRentPaymentResult> {
  const id = paymentId.trim();

  if (!id) {
    return { success: false, message: "납부 정보를 찾을 수 없어요" };
  }

  try {
    const uncompleted = await uncompleteRentPaymentInDb(id);

    if (!uncompleted) {
      return { success: false, message: "납부 취소할 수 없어요" };
    }

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, message: AUTH_REQUIRED_MESSAGE };
    }
    throw error;
  }
}

function mapCreatePaymentRecordError(
  code:
    | "home_not_found"
    | "no_contract"
    | "not_eligible"
    | "duplicate"
    | "future_month",
): string {
  switch (code) {
    case "duplicate":
      return "이미 등록된 납부 기록이에요";
    case "not_eligible":
      return "해당 월에는 계약 기간에 포함되지 않아요";
    case "future_month":
      return "아직 오지 않은 달은 등록할 수 없어요";
    case "no_contract":
      return "계약이 등록된 집만 선택할 수 있어요";
    default:
      return "집 정보를 찾을 수 없어요";
  }
}

export async function createRentPaymentAction(
  homeId: string,
  yearMonth: string,
): Promise<CreatePaymentRecordResult> {
  const id = homeId.trim();
  const month = parseYearMonthParam(yearMonth);

  if (!id) {
    return { success: false, message: "집 정보를 찾을 수 없어요" };
  }

  try {
    const created = await createRentPaymentForMonthInDb(id, month);

    if (!created.success) {
      return { success: false, message: mapCreatePaymentRecordError(created.code) };
    }

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, message: AUTH_REQUIRED_MESSAGE };
    }
    throw error;
  }
}

export async function createMaintenancePaymentAction(
  homeId: string,
  yearMonth: string,
): Promise<CreatePaymentRecordResult> {
  const id = homeId.trim();
  const month = parseYearMonthParam(yearMonth);

  if (!id) {
    return { success: false, message: "집 정보를 찾을 수 없어요" };
  }

  try {
    const created = await createMaintenancePaymentForMonthInDb(id, month);

    if (!created.success) {
      return { success: false, message: mapCreatePaymentRecordError(created.code) };
    }

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, message: AUTH_REQUIRED_MESSAGE };
    }
    throw error;
  }
}

export async function createExpenseAction(
  formData: FormData,
): Promise<CreateExpenseResult> {
  const homeId = String(formData.get("homeId") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const amountValue = String(formData.get("amount") ?? "").trim();
  const dueDayValue = String(formData.get("dueDay") ?? "").trim();
  const yearMonthRaw = String(formData.get("yearMonth") ?? "").trim();
  const yearMonth = yearMonthRaw ? parseYearMonthParam(yearMonthRaw) : undefined;

  const errors: CreateExpenseFieldErrors = {};

  if (!homeId) {
    errors.homeId = "집을 선택해주세요";
  }

  if (!isExpenseCategory(category)) {
    errors.category = "공과금 종류를 선택해주세요";
  }

  const amount = parseAmount(amountValue);

  if (amount === null) {
    errors.amount = "금액을 입력해주세요";
  } else if (!Number.isInteger(amount) || amount <= 0) {
    errors.amount = "금액은 1원 이상의 정수여야 해요";
  }

  const dueDay = parseDueDay(dueDayValue);

  if (dueDay === null) {
    errors.dueDay = "납부 예정일을 입력해주세요";
  } else if (dueDay < 1 || dueDay > 31) {
    errors.dueDay = "납부 예정일은 1일부터 31일 사이여야 해요";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  if (!isExpenseCategory(category) || amount === null || dueDay === null) {
    return { success: false, errors: { category: "입력값을 확인해주세요" } };
  }

  try {
    const created = await createExpensePaymentInDb({
      homeId,
      category,
      amount,
      dueDay,
      yearMonth,
    });

    if (!created.success) {
      const monthLabel = yearMonth ? formatYearMonthLabel(yearMonth) : "이번 달";

      if (created.code === "duplicate") {
        return {
          success: false,
          errors: { category: `${monthLabel}에 이미 등록된 공과금 항목입니다.` },
        };
      }

      if (created.code === "not_eligible") {
        return {
          success: false,
          errors: { homeId: "해당 월에는 계약 기간에 포함되지 않아요" },
        };
      }

      if (created.code === "future_month") {
        return {
          success: false,
          errors: { dueDay: "아직 오지 않은 달은 등록할 수 없어요" },
        };
      }

      if (created.code === "no_contract") {
        return {
          success: false,
          errors: { homeId: "계약이 등록된 집만 선택할 수 있어요" },
        };
      }

      return {
        success: false,
        errors: { homeId: "집 정보를 찾을 수 없어요" },
      };
    }

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, errors: { homeId: AUTH_REQUIRED_MESSAGE } };
    }
    throw error;
  }
}

export async function completeExpensePaymentAction(
  paymentId: string,
): Promise<CompleteExpensePaymentResult> {
  const id = paymentId.trim();

  if (!id) {
    return { success: false, message: "납부 정보를 찾을 수 없어요" };
  }

  try {
    const completed = await completeExpensePaymentInDb(id);

    if (!completed) {
      return { success: false, message: "납부 완료 처리할 수 없어요" };
    }

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, message: AUTH_REQUIRED_MESSAGE };
    }
    throw error;
  }
}

export async function uncompleteExpensePaymentAction(
  paymentId: string,
): Promise<CompleteExpensePaymentResult> {
  const id = paymentId.trim();

  if (!id) {
    return { success: false, message: "납부 정보를 찾을 수 없어요" };
  }

  try {
    const uncompleted = await uncompleteExpensePaymentInDb(id);

    if (!uncompleted) {
      return { success: false, message: "납부 취소할 수 없어요" };
    }

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, message: AUTH_REQUIRED_MESSAGE };
    }
    throw error;
  }
}
