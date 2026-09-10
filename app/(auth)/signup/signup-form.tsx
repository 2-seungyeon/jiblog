"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useToast } from "@/components/providers/toast-provider";
import { signUpAction, type SignUpFieldErrors } from "@/lib/actions/auth";
import { getActionErrorMessage } from "@/lib/utils/toast-messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SignUpForm() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<SignUpFieldErrors>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setErrors({});

    const formData = new FormData(event.currentTarget);
    const result = await signUpAction(formData);

    if (!result.success) {
      if (result.errors) {
        setErrors(result.errors);
      }

      if (result.error) {
        setError(result.error);
        toast.error(getActionErrorMessage(result.error));
      }

      setLoading(false);
    }
  }

  return (
    <section className="space-y-5 rounded-lg border border-border-default p-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-text-primary">회원가입</h1>
        <p className="text-sm text-text-secondary">
          이름, 이메일, 비밀번호로 계정을 만들어주세요.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="name"
          label="이름"
          type="text"
          autoComplete="name"
          required
          error={errors.name}
        />
        <Input
          name="email"
          label="이메일"
          type="email"
          autoComplete="email"
          required
          error={errors.email}
        />
        <Input
          name="password"
          label="비밀번호"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
          error={errors.password}
        />
        <Input
          name="passwordConfirm"
          label="비밀번호 확인"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
          error={errors.passwordConfirm}
        />
        {error ? (
          <p className="text-sm text-error" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" loading={loading} className="w-full">
          회원가입
        </Button>
      </form>

      <p className="text-center text-sm text-text-secondary">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="ui-link font-medium">
          로그인
        </Link>
      </p>
    </section>
  );
}
