"use client";

import { useState } from "react";
import { PaymentCompleteButton } from "@/components/payment/payment-complete-button";
import { PaymentCompleteDialog } from "@/components/payment/payment-complete-dialog";
import type { CompletePaymentDetails } from "@/lib/types/homes";

type PaymentCompleteTriggerProps = {
  title: string;
  subtitle: string;
  amount: number;
  loading?: boolean;
  onConfirm: (details: CompletePaymentDetails) => Promise<boolean>;
};

export function PaymentCompleteTrigger({
  title,
  subtitle,
  amount,
  loading = false,
  onConfirm,
}: PaymentCompleteTriggerProps) {
  const [open, setOpen] = useState(false);

  async function handleConfirm(details: CompletePaymentDetails) {
    const success = await onConfirm(details);
    if (success) {
      setOpen(false);
    }
  }

  return (
    <>
      <PaymentCompleteButton loading={loading} onClick={() => setOpen(true)} />
      <PaymentCompleteDialog
        open={open}
        title={title}
        subtitle={subtitle}
        amount={amount}
        loading={loading}
        onOpenChange={setOpen}
        onConfirm={handleConfirm}
      />
    </>
  );
}
