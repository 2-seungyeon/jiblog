"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useToast } from "@/components/providers/toast-provider";
import type { CompletePaymentDetails } from "@/lib/types/homes";
import {
  TOAST_MESSAGES,
  getActionErrorMessage,
} from "@/lib/utils/toast-messages";

type PaymentActionResult =
  | { success: true }
  | { success: false; message: string };

type PaymentStatus = "예정" | "완료";

export function usePaymentStatus(
  completeAction: (
    paymentId: string,
    details?: CompletePaymentDetails,
  ) => Promise<PaymentActionResult>,
  uncompleteAction: (paymentId: string) => Promise<PaymentActionResult>,
) {
  const router = useRouter();
  const toast = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [loadingKind, setLoadingKind] = useState<"complete" | "uncomplete" | null>(
    null,
  );
  const [statusOverrides, setStatusOverrides] = useState<Map<string, PaymentStatus>>(
    () => new Map(),
  );

  const getDisplayStatus = useCallback(
    (paymentId: string, status: PaymentStatus): PaymentStatus => {
      return statusOverrides.get(paymentId) ?? status;
    },
    [statusOverrides],
  );

  const handleComplete = useCallback(
    async (
      paymentId: string,
      details?: CompletePaymentDetails,
    ): Promise<boolean> => {
      if (loadingId === paymentId) {
        return false;
      }

      const currentStatus = statusOverrides.get(paymentId);
      if (currentStatus === "완료") {
        return false;
      }

      setLoadingId(paymentId);
      setLoadingKind("complete");
      setStatusOverrides((prev) => new Map(prev).set(paymentId, "완료"));

      try {
        const result = await completeAction(paymentId, details);

        if (result.success) {
          toast.success(TOAST_MESSAGES.paymentComplete);
          router.refresh();
          return true;
        }

        setStatusOverrides((prev) => {
          const next = new Map(prev);
          next.delete(paymentId);
          return next;
        });
        toast.error(getActionErrorMessage(result.message));
        return false;
      } catch {
        setStatusOverrides((prev) => {
          const next = new Map(prev);
          next.delete(paymentId);
          return next;
        });
        toast.error(getActionErrorMessage());
        return false;
      } finally {
        setLoadingId(null);
        setLoadingKind(null);
      }
    },
    [completeAction, loadingId, router, statusOverrides, toast],
  );

  const handleUncomplete = useCallback(
    async (paymentId: string) => {
      if (loadingId === paymentId) {
        return;
      }

      const currentStatus = statusOverrides.get(paymentId);
      if (currentStatus === "예정") {
        return;
      }

      setLoadingId(paymentId);
      setLoadingKind("uncomplete");
      setStatusOverrides((prev) => new Map(prev).set(paymentId, "예정"));

      try {
        const result = await uncompleteAction(paymentId);

        if (result.success) {
          toast.success(TOAST_MESSAGES.paymentCancel);
          router.refresh();
        } else {
          setStatusOverrides((prev) => {
            const next = new Map(prev);
            next.delete(paymentId);
            return next;
          });
          toast.error(getActionErrorMessage(result.message));
        }
      } catch {
        setStatusOverrides((prev) => {
          const next = new Map(prev);
          next.delete(paymentId);
          return next;
        });
        toast.error(getActionErrorMessage());
      } finally {
        setLoadingId(null);
        setLoadingKind(null);
      }
    },
    [loadingId, router, statusOverrides, toast, uncompleteAction],
  );

  return {
    handleComplete,
    handleUncomplete,
    loadingId,
    loadingKind,
    getDisplayStatus,
  };
}
