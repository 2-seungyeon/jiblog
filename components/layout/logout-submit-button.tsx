"use client";

import { useTransition, type ReactNode } from "react";
import { LogoutIcon } from "@/components/layout/logout-icon";
import { logoutAction } from "@/lib/actions/auth";

type LogoutSubmitButtonProps = {
  className?: string;
  children?: ReactNode;
  pendingLabel?: string;
};

export function LogoutSubmitButton({
  className,
  children,
  pendingLabel = "처리 중...",
}: LogoutSubmitButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      aria-busy={isPending || undefined}
      className={className}
      onClick={() => {
        startTransition(() => {
          void logoutAction();
        });
      }}
    >
      {children ?? (
        <>
          <LogoutIcon className="size-5 shrink-0" />
          <span>{isPending ? pendingLabel : "로그아웃"}</span>
        </>
      )}
    </button>
  );
}
