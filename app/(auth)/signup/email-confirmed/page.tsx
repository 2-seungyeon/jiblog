import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function EmailConfirmedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isSignedIn = Boolean(user?.email_confirmed_at);

  return (
    <section className="space-y-5 rounded-lg border border-border-default p-6">
      <div className="space-y-2">
        <h1 className="text-xl font-bold text-text-primary">이메일 인증이 완료됐어요</h1>
        <p className="text-sm text-text-secondary">
          {isSignedIn
            ? "이제 집로그에서 주거비 관리를 시작할 수 있어요."
            : "인증이 완료됐어요. 로그인한 후 서비스를 이용해주세요."}
        </p>
      </div>

      <p className="rounded-md bg-primary-50 px-4 py-3 text-sm text-primary-700">
        가입해 주셔서 감사합니다. 집과 계약 정보를 등록하면 월세·관리비·공과금을 한곳에서 관리할 수
        있어요.
      </p>

      {isSignedIn ? (
        <Link
          href="/dashboard"
          className="inline-flex h-12 w-full items-center justify-center rounded-button bg-primary-600 px-6 text-base font-medium text-text-inverse shadow-sm transition-colors hover:bg-primary-700"
        >
          대시보드로 이동
        </Link>
      ) : (
        <Link
          href="/login"
          className="inline-flex h-12 w-full items-center justify-center rounded-button bg-primary-600 px-6 text-base font-medium text-text-inverse shadow-sm transition-colors hover:bg-primary-700"
        >
          로그인하기
        </Link>
      )}
    </section>
  );
}
