"use client";

import Link from "next/link";
import { useState } from "react";
import { ConfirmEmailPanel } from "@/app/(auth)/signup/confirm-email/confirm-email-panel";
import { AUTH_MESSAGES } from "@/lib/utils/auth-validation";

const SAMPLE_EMAIL = "iris@example.com";

type PreviewTab =
  | "flow"
  | "confirm-new"
  | "confirm-pending"
  | "confirm-error"
  | "confirmed-guest"
  | "confirmed-session"
  | "login-unverified";

const tabs: Array<{ id: PreviewTab; label: string }> = [
  { id: "flow", label: "전체 흐름" },
  { id: "confirm-new", label: "1. 가입 후 안내" },
  { id: "confirm-pending", label: "2. 미인증 로그인" },
  { id: "confirm-error", label: "3. 링크 오류" },
  { id: "confirmed-guest", label: "4a. 인증 완료" },
  { id: "confirmed-session", label: "4b. 인증+세션" },
  { id: "login-unverified", label: "로그인 오류 UI" },
];

function EmailConfirmedPreview({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="space-y-5 rounded-lg border border-border-default p-6">
      <div className="space-y-2">
        <h1 className="text-xl font-bold text-text-primary">이메일 인증이 완료됐어요</h1>
        <p className="text-sm text-text-secondary">
          {signedIn
            ? "이제 집로그에서 주거비 관리를 시작할 수 있어요."
            : "인증이 완료됐어요. 로그인한 후 서비스를 이용해주세요."}
        </p>
      </div>

      <p className="rounded-md bg-primary-50 px-4 py-3 text-sm text-primary-700">
        가입해 주셔서 감사합니다. 집과 계약 정보를 등록하면 월세·관리비·공과금을 한곳에서 관리할 수
        있어요.
      </p>

      <span className="inline-flex h-12 w-full items-center justify-center rounded-button bg-primary-600 px-6 text-base font-medium text-text-inverse">
        {signedIn ? "대시보드로 이동" : "로그인하기"}
      </span>
    </section>
  );
}

function LoginUnverifiedPreview() {
  const confirmEmailUrl = `/signup/confirm-email?${new URLSearchParams({
    email: SAMPLE_EMAIL,
    status: "pending",
  }).toString()}`;

  return (
    <section className="space-y-5 rounded-lg border border-border-default p-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-text-primary">로그인</h1>
        <p className="text-sm text-text-secondary">이메일과 비밀번호로 로그인해주세요.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-primary">이메일</label>
          <div className="h-12 rounded-md border border-border-default bg-surface px-3 py-2 text-sm text-text-primary">
            {SAMPLE_EMAIL}
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-primary">비밀번호</label>
          <div className="h-12 rounded-md border border-border-default bg-surface px-3 py-2 text-sm text-text-tertiary">
            ••••••••
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-error" role="alert">
            {AUTH_MESSAGES.emailNotConfirmed}
          </p>
          <p className="text-sm text-text-secondary">
            <Link href={confirmEmailUrl} className="ui-link font-medium">
              이메일 인증 안내 페이지로 이동
            </Link>
          </p>
        </div>
        <span className="inline-flex h-12 w-full items-center justify-center rounded-button bg-primary-600 text-base font-medium text-text-inverse">
          로그인
        </span>
      </div>
    </section>
  );
}

function FlowOverview() {
  const steps = [
    {
      title: "회원가입",
      detail: "앱 코드에서 인증 후 돌아올 주소를 /auth/callback으로 지정 (이미 적용됨)",
    },
    {
      title: "/signup/confirm-email",
      detail: "인증 메일 안내 + 재발송 (status=new | pending | error)",
    },
    {
      title: "이메일 링크 클릭",
      detail: "Supabase → /auth/callback → 세션 생성",
    },
    {
      title: "/signup/email-confirmed",
      detail: "인증 완료 안내 → 대시보드 또는 로그인",
    },
  ];

  return (
    <div className="space-y-4 rounded-lg border border-border-default p-6">
      <div>
        <h2 className="text-lg font-bold text-text-primary">STEP 41 이메일 인증 흐름</h2>
        <p className="mt-1 text-sm text-text-secondary">
          실제 가입 없이 아래 탭에서 각 화면 UI를 확인할 수 있어요.
        </p>
      </div>

      <ol className="space-y-3">
        {steps.map((step, index) => (
          <li key={step.title} className="flex gap-3 text-sm">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-semibold text-primary-700">
              {index + 1}
            </span>
            <div>
              <p className="font-medium text-text-primary">{step.title}</p>
              <p className="text-text-secondary">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="space-y-2 border-t border-border-default pt-4 text-sm">
        <p className="font-medium text-text-primary">Supabase에서 직접 할 일 (배포 시 1회)</p>
        <p className="text-text-secondary">
          Supabase 대시보드 → Authentication → URL Configuration → Redirect URLs에{" "}
          <code className="text-text-primary">http://localhost:3000/auth/callback</code> 과 배포
          도메인의 <code className="text-text-primary">/auth/callback</code> 을 추가하세요. 코드
          설정과 별개로, Supabase가 이 주소로 리다이렉트를 허용해야 이메일 링크가 동작합니다.
        </p>
      </div>

      <div className="space-y-2 border-t border-border-default pt-4 text-sm">
        <p className="font-medium text-text-primary">실제 URL (바로 열기)</p>
        <ul className="space-y-1 text-text-secondary">
          <li>
            <Link
              href={`/signup/confirm-email?email=${encodeURIComponent(SAMPLE_EMAIL)}&status=new`}
              className="ui-link"
            >
              /signup/confirm-email?status=new
            </Link>
          </li>
          <li>
            <Link
              href={`/signup/confirm-email?email=${encodeURIComponent(SAMPLE_EMAIL)}&status=pending`}
              className="ui-link"
            >
              /signup/confirm-email?status=pending
            </Link>
          </li>
          <li>
            <Link href="/signup/confirm-email?status=error" className="ui-link">
              /signup/confirm-email?status=error
            </Link>
          </li>
          <li>
            <Link href="/signup/email-confirmed" className="ui-link">
              /signup/email-confirmed
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

export function EmailAuthPreview() {
  const [tab, setTab] = useState<PreviewTab>("flow");

  return (
    <div className="mx-auto w-full max-w-md space-y-4 pb-8">
      <p className="rounded-md border border-border-default bg-surface-muted px-3 py-2 text-xs text-text-secondary">
        개발용 미리보기 — production에서는 접근할 수 없어요.
      </p>

      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={[
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              tab === item.id
                ? "bg-primary-600 text-text-inverse"
                : "bg-surface-muted text-text-secondary hover:text-text-primary",
            ].join(" ")}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "flow" ? <FlowOverview /> : null}
      {tab === "confirm-new" ? (
        <ConfirmEmailPanel email={SAMPLE_EMAIL} status="new" />
      ) : null}
      {tab === "confirm-pending" ? (
        <ConfirmEmailPanel email={SAMPLE_EMAIL} status="pending" />
      ) : null}
      {tab === "confirm-error" ? (
        <ConfirmEmailPanel
          email={SAMPLE_EMAIL}
          status="error"
          errorMessage="이메일 인증 링크가 만료되었거나 올바르지 않아요."
        />
      ) : null}
      {tab === "confirmed-guest" ? <EmailConfirmedPreview signedIn={false} /> : null}
      {tab === "confirmed-session" ? <EmailConfirmedPreview signedIn={true} /> : null}
      {tab === "login-unverified" ? <LoginUnverifiedPreview /> : null}
    </div>
  );
}
