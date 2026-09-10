"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useToast } from "@/components/providers/toast-provider";
import { loginAction } from "@/lib/actions/auth";
import type { AuthFormResult } from "@/lib/types/auth";
import { getActionErrorMessage } from "@/lib/utils/toast-messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

async function loginFormAction(
  _prevState: AuthFormResult | null,
  formData: FormData,
): Promise<AuthFormResult | null> {
  const result = await loginAction(formData);

  if (!result.success) {
    return result;
  }

  return null;
}

export function LoginForm() {
  const toast = useToast();
  const [state, formAction, isPending] = useActionState(loginFormAction, null);

  useEffect(() => {
    if (state && !state.success) {
      toast.error(getActionErrorMessage(state.error));
    }
  }, [state, toast]);

  return (
    <section className="space-y-5 rounded-lg border border-border-default p-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-text-primary">로그인</h1>
        <p className="text-sm text-text-secondary">
          이메일과 비밀번호로 로그인해주세요.
        </p>
      </div>

      <form action={formAction} method="post" className="space-y-4">
        <Input
          name="email"
          label="이메일"
          type="email"
          autoComplete="email"
          required
        />
        <Input
          name="password"
          label="비밀번호"
          type="password"
          autoComplete="current-password"
          required
        />
        {state && !state.success ? (
          <p className="text-sm text-error" role="alert">
            {state.error}
          </p>
        ) : null}
        <Button type="submit" loading={isPending} className="w-full">
          로그인
        </Button>
      </form>

      <p className="text-center text-sm text-text-secondary">
        계정이 없으신가요?{" "}
        <Link href="/signup" className="ui-link font-medium">
          회원가입
        </Link>
      </p>
    </section>
  );
}
