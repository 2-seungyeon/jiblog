import { PaymentStatus } from "@prisma/client";

export const PAYMENT_MEMO_MAX_LENGTH = 200;

export function getPaymentCompletedAtIso(
  status: PaymentStatus,
  paidAt: Date | null,
  updatedAt: Date,
): string | null {
  if (status !== PaymentStatus.COMPLETED) {
    return null;
  }

  return paidAt?.toISOString() ?? updatedAt.toISOString();
}

export function normalizePaymentMemo(memo?: string | null): string | null {
  const trimmed = memo?.trim();

  if (!trimmed) {
    return null;
  }

  return trimmed.slice(0, PAYMENT_MEMO_MAX_LENGTH);
}
