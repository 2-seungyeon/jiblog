"use client";

import Link from "next/link";
import { useState } from "react";
import { resendConfirmationEmailAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ConfirmEmailPanelProps = {
  email: string;
  status: "new" | "pending" | "error";
  errorMessage?: string;
};

export function ConfirmEmailPanel({
  email,
  status,
  errorMessage,
}: ConfirmEmailPanelProps) {
  const [resendEmail, setResendEmail] = useState(email);
  const [loading, setLoading] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);

  async function handleResend() {
    setLoading(true);
    setResendError(null);
    setResendSuccess(false);

    const result = await resendConfirmationEmailAction(resendEmail);

    if (result.success) {
      setResendSuccess(true);
    } else {
      setResendError(result.error);
    }

    setLoading(false);
  }

  return (
    <section className="space-y-5 rounded-lg border border-border-default p-6">
      <div className="space-y-2">
        <h1 className="text-xl font-bold text-text-primary">이메일을 확인해주세요</h1>
        <p className="text-sm text-text-secondary">
          {status === "pending"
            ? "아직 이메일 인증이 완료되지 않았어요. 받은 편지함에서 인증 링크를 눌러주세요."
            : "입력하신 이메일로 인증 메일을 보냈어요. 인증을 완료한 후 로그인해주세요."}
        </p>
      </div>

      {email ? (
        <p className="rounded-md bg-surface-muted px-4 py-3 text-sm text-text-primary">
          {email}
        </p>
      ) : null}

      {status === "error" ? (
        <p className="rounded-md bg-error-bg px-4 py-3 text-sm text-error" role="alert">
          {errorMessage ??
            "이메일 인증 링크가 만료되었거나 올바르지 않아요. 인증 메일을 다시 요청해주세요."}
        </p>
      ) : (
        <p className="text-sm text-text-secondary">
          인증 메일이 보이지 않으면 스팸함을 확인하거나 아래에서 다시 보내주세요.
        </p>
      )}

      <div className="space-y-3 rounded-md border border-border-default bg-surface-muted/40 p-4">
        <p className="text-sm font-medium text-text-primary">인증 메일 다시 받기</p>
        <Input
          name="resendEmail"
          label="이메일"
          type="email"
          autoComplete="email"
          value={resendEmail}
          onChange={(event) => setResendEmail(event.target.value)}
          required
        />
        {resendError ? (
          <p className="text-sm text-error" role="alert">
            {resendError}
          </p>
        ) : null}
        {resendSuccess ? (
          <p className="text-sm text-primary-700" role="status">
            인증 메일을 다시 보냈어요. 받은 편지함을 확인해주세요.
          </p>
        ) : null}
        <Button type="button" loading={loading} className="w-full" onClick={handleResend}>
          인증 메일 다시 보내기
        </Button>
      </div>

      <Link
        href="/login"
        className="inline-flex h-12 w-full items-center justify-center rounded-button border border-border-strong bg-surface px-6 text-base font-medium text-text-primary shadow-sm transition-colors hover:bg-surface-muted"
      >
        로그인 페이지로 이동
      </Link>
    </section>
  );
}
