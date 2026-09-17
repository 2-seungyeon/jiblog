import { getCurrentIsoDate } from "@/lib/utils/date";
import { isValidIsoDate } from "@/lib/utils/date-input";
import {
  normalizePaymentMemo,
  PAYMENT_MEMO_MAX_LENGTH,
} from "@/lib/utils/payment-record";
import type { CompletePaymentDetails } from "@/lib/types/homes";

export function parseCompletePaymentDetails(
  details?: CompletePaymentDetails,
):
  | { success: true; data: CompletePaymentDetails }
  | { success: false; message: string } {
  const paidAt = details?.paidAt?.trim() || getCurrentIsoDate();

  if (!isValidIsoDate(paidAt)) {
    return { success: false, message: "납부일 형식이 올바르지 않아요" };
  }

  const memo = normalizePaymentMemo(details?.memo);

  if (details?.memo && details.memo.trim().length > PAYMENT_MEMO_MAX_LENGTH) {
    return {
      success: false,
      message: `메모는 ${PAYMENT_MEMO_MAX_LENGTH}자까지 입력할 수 있어요`,
    };
  }

  return {
    success: true,
    data: {
      paidAt,
      memo: memo ?? undefined,
    },
  };
}
