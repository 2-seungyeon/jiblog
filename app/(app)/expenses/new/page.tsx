import Link from "next/link";
import { ExpenseNewForm } from "@/app/(app)/expenses/new/expense-new-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormPageShell } from "@/components/ui/form-page-shell";
import { getExpenseEligibleHomes } from "@/lib/repositories/expenses";
import { getHomes } from "@/lib/repositories/homes";
import { getOnboardingStep } from "@/lib/utils/onboarding";

export const dynamic = "force-dynamic";

function NoContractEmptyState({
  step,
  primaryHomeId,
}: {
  step: ReturnType<typeof getOnboardingStep>["step"];
  primaryHomeId?: string;
}) {
  if (step === "no-home") {
    return (
      <Card variant="status" className="space-y-4 p-8 text-center">
        <div className="space-y-2">
          <p className="text-lg font-semibold text-text-primary">
            등록된 집이 없어요
          </p>
          <p className="ui-metadata">
            집을 등록하면 공과금 납부 일정을 추가할 수 있어요.
          </p>
        </div>
        <Link href="/homes/new">
          <Button type="button" className="w-full md:w-auto">
            내 집 등록하기
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card variant="status" className="space-y-4 p-8 text-center">
      <div className="space-y-2">
        <p className="text-lg font-semibold text-text-primary">
          공과금을 등록할 수 있는 집이 없어요
        </p>
        <p className="ui-metadata">
          계약이 등록된 집이 있어야 공과금을 추가할 수 있어요.
        </p>
      </div>
      {primaryHomeId ? (
        <Link href={`/homes/${primaryHomeId}/contract/new`}>
          <Button type="button" className="w-full md:w-auto">
            계약 등록하기
          </Button>
        </Link>
      ) : (
        <Link href="/homes">
          <Button type="button" className="w-full md:w-auto">
            내 집 보기
          </Button>
        </Link>
      )}
    </Card>
  );
}

export default async function ExpenseNewPage() {
  const [homes, eligibleHomes] = await Promise.all([
    getHomes(),
    getExpenseEligibleHomes(),
  ]);
  const onboarding = getOnboardingStep(homes);
  const hasEligibleHomes = eligibleHomes.length > 0;

  return (
    <FormPageShell
      backHref="/expenses"
      backLabel="← 공과금"
      title="공과금 추가"
      description="이번 달 공과금 납부 항목을 등록하세요."
    >
      {hasEligibleHomes ? (
        <ExpenseNewForm homes={eligibleHomes} />
      ) : (
        <NoContractEmptyState
          step={onboarding.step}
          primaryHomeId={onboarding.primaryHomeId}
        />
      )}
    </FormPageShell>
  );
}
