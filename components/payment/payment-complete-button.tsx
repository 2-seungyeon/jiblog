"use client";

import { Button } from "@/components/ui/button";

type PaymentCompleteButtonProps = {
  loading?: boolean;
  onClick: () => void;
};

export function PaymentCompleteButton({
  loading = false,
  onClick,
}: PaymentCompleteButtonProps) {
  return (
    <Button
      type="button"
      variant="accent"
      className="ui-payment-complete-button"
      loading={loading}
      loadingLabel="처리 중..."
      onClick={onClick}
    >
      납부하기
    </Button>
  );
}
