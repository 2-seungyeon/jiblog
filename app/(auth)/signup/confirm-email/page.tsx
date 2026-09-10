import Link from "next/link";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

type ConfirmEmailPageProps = {
  searchParams: Promise<{ email?: string; status?: string }>;
};

export default async function ConfirmEmailPage({
  searchParams,
}: ConfirmEmailPageProps) {
  const params = await searchParams;
  const email = params.email?.trim() ?? "";
  const isPending = params.status === "pending";

  return (
    <Card className="space-y-5">
      <div className="space-y-2">
        <h1 className="text-xl font-bold text-text-primary">이메일을 확인해주세요</h1>
        <p className="text-sm text-text-secondary">
          입력하신 이메일로 인증 메일을 보냈어요.
          <br />
          이메일 인증을 완료한 후 로그인해주세요.
        </p>
      </div>

      {email ? (
        <p className="rounded-md bg-surface-muted px-4 py-3 text-sm text-text-primary">
          {email}
        </p>
      ) : null}

      {isPending ? (
        <p className="rounded-md bg-primary-50 px-4 py-3 text-sm text-primary-700">
          이미 가입 요청을 하셨다면 이메일을 확인하여 인증을 완료해주세요.
          인증 메일이 보이지 않으면 스팸함도 확인해주세요.
        </p>
      ) : (
        <p className="text-sm text-text-secondary">
          인증 메일이 보이지 않으면 스팸함을 확인하거나 잠시 후 다시 시도해주세요.
        </p>
      )}

      <Link
        href="/login"
        className="inline-flex h-12 w-full items-center justify-center rounded-button bg-primary-600 px-6 text-base font-medium text-text-inverse shadow-sm transition-colors hover:bg-primary-700"
      >
        로그인 페이지로 이동
      </Link>
    </Card>
  );
}
