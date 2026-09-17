"use client";

import { Button } from "@/components/ui/button";

type PaymentCancelButtonProps = {
  loading?: boolean;
  onClick: () => void;
};

export function PaymentCancelButton({
  loading = false,
  onClick,
}: PaymentCancelButtonProps) {
  return (
    <Button
      type="button"
      variant="secondary"
      className="ui-payment-cancel-button"
      loading={loading}
      loadingLabel="처리 중..."
      onClick={onClick}
    >
      납부 취소
    </Button>
  );
}
