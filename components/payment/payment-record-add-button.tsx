"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/providers/toast-provider";
import { Button } from "@/components/ui/button";
import type { CreatePaymentRecordResult } from "@/lib/types/homes";
import {
  TOAST_MESSAGES,
  getActionErrorMessage,
} from "@/lib/utils/toast-messages";

type PaymentRecordAddButtonProps = {
  homeId: string;
  yearMonth: string;
  action: (
    homeId: string,
    yearMonth: string,
  ) => Promise<CreatePaymentRecordResult>;
};

export function PaymentRecordAddButton({
  homeId,
  yearMonth,
  action,
}: PaymentRecordAddButtonProps) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const result = await action(homeId, yearMonth);

      if (result.success) {
        toast.success(TOAST_MESSAGES.saved);
        router.refresh();
      } else {
        toast.error(getActionErrorMessage(result.message));
      }
    } catch {
      toast.error(getActionErrorMessage());
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="secondary"
      className="shrink-0"
      loading={loading}
      loadingLabel="등록 중..."
      onClick={handleClick}
    >
      기록 추가
    </Button>
  );
}
