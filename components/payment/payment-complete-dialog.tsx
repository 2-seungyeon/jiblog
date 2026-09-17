"use client";

import { useId, useRef, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import { Dialog, DialogActions } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { CompletePaymentDetails } from "@/lib/types/homes";
import { getCurrentIsoDate } from "@/lib/utils/date";
import { PAYMENT_MEMO_MAX_LENGTH } from "@/lib/utils/payment-record";
import { formatWon } from "@/lib/utils/format";

type PaymentCompleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle: string;
  amount: number;
  loading?: boolean;
  onConfirm: (details: CompletePaymentDetails) => void;
};

export function PaymentCompleteDialog({
  open,
  onOpenChange,
  title,
  subtitle,
  amount,
  loading = false,
  onConfirm,
}: PaymentCompleteDialogProps) {
  const formId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const defaultPaidAt = getCurrentIsoDate();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    onConfirm({
      paidAt: String(formData.get("paidAt") ?? "").trim(),
      memo: String(formData.get("memo") ?? "").trim() || undefined,
    });
  }

  return (
    <>
      <button ref={triggerRef} type="button" className="hidden" aria-hidden="true" />
      <Dialog
        open={open}
        returnFocusRef={triggerRef}
        onOpenChange={(nextOpen) => {
          if (!loading) {
            onOpenChange(nextOpen);
          }
        }}
        title="납부 완료 처리"
        description={`${title} · ${subtitle} · ${formatWon(amount)}`}
      >
        <form id={formId} key={open ? "open" : "closed"} onSubmit={handleSubmit}>
          <div className="mt-4 space-y-4">
            <DateInput
              name="paidAt"
              label="실제 납부일"
              defaultValue={defaultPaidAt}
              required
              disabled={loading}
            />
            <Textarea
              name="memo"
              label="메모 (선택)"
              placeholder="예: 카카오뱅크 송금, 관리실 방문 납부"
              rows={3}
              maxLength={PAYMENT_MEMO_MAX_LENGTH}
              disabled={loading}
              helperText="납부 방법이나 확인 메모를 남길 수 있어요."
            />
          </div>
        </form>
        <DialogActions>
          <Button
            type="button"
            variant="secondary"
            disabled={loading}
            onClick={() => onOpenChange(false)}
          >
            취소
          </Button>
          <Button type="submit" form={formId} loading={loading}>
            납부 완료
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
