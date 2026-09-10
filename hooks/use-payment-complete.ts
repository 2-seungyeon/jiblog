"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useToast } from "@/components/providers/toast-provider";
import {
  TOAST_MESSAGES,
  getActionErrorMessage,
} from "@/lib/utils/toast-messages";

type CompleteActionResult =
  | { success: true }
  | { success: false; message: string };

type PaymentStatus = "예정" | "완료";

export function usePaymentComplete(
  completeAction: (paymentId: string) => Promise<CompleteActionResult>,
) {
  const router = useRouter();
  const toast = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [optimisticCompletedIds, setOptimisticCompletedIds] = useState<Set<string>>(
    () => new Set(),
  );

  const getDisplayStatus = useCallback(
    (paymentId: string, status: PaymentStatus): PaymentStatus => {
      if (optimisticCompletedIds.has(paymentId)) {
        return "완료";
      }

      return status;
    },
    [optimisticCompletedIds],
  );

  const handleComplete = useCallback(
    async (paymentId: string) => {
      if (loadingId === paymentId || optimisticCompletedIds.has(paymentId)) {
        return;
      }

      setLoadingId(paymentId);
      setOptimisticCompletedIds((prev) => new Set(prev).add(paymentId));

      try {
        const result = await completeAction(paymentId);

        if (result.success) {
          toast.success(TOAST_MESSAGES.paymentComplete);
          router.refresh();
        } else {
          setOptimisticCompletedIds((prev) => {
            const next = new Set(prev);
            next.delete(paymentId);
            return next;
          });
          toast.error(getActionErrorMessage(result.message));
        }
      } catch {
        setOptimisticCompletedIds((prev) => {
          const next = new Set(prev);
          next.delete(paymentId);
          return next;
        });
        toast.error(getActionErrorMessage());
      } finally {
        setLoadingId(null);
      }
    },
    [completeAction, loadingId, optimisticCompletedIds, router, toast],
  );

  return {
    handleComplete,
    loadingId,
    getDisplayStatus,
  };
}
