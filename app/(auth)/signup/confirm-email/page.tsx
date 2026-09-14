import { ConfirmEmailPanel } from "@/app/(auth)/signup/confirm-email/confirm-email-panel";

export const dynamic = "force-dynamic";

type ConfirmEmailPageProps = {
  searchParams: Promise<{ email?: string; status?: string; message?: string }>;
};

function resolveStatus(
  status: string | undefined,
): "new" | "pending" | "error" {
  if (status === "pending" || status === "error") {
    return status;
  }

  return "new";
}

export default async function ConfirmEmailPage({
  searchParams,
}: ConfirmEmailPageProps) {
  const params = await searchParams;
  const email = params.email?.trim() ?? "";
  const status = resolveStatus(params.status);
  const errorMessage = params.message?.trim();

  return (
    <ConfirmEmailPanel
      email={email}
      status={status}
      errorMessage={errorMessage}
    />
  );
}
