import Link from "next/link";
import { ExpensePaymentList } from "@/app/(app)/expenses/expense-payment-list";
import { PaymentCategoryListPanel } from "@/components/payment/payment-category-list-panel";
import { PaymentOnboardingPanel } from "@/components/payment/payment-onboarding-panel";
import { PaymentOverviewPanel } from "@/components/payment/payment-overview-panel";
import { PaymentSectionNav } from "@/components/payment/payment-section-nav";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { getExpenseEligibleHomes, getExpensesPageData } from "@/lib/repositories/expenses";
import { getMaintenancePageData } from "@/lib/repositories/maintenance";
import { getHomes } from "@/lib/repositories/homes";
import { getPaymentOverview } from "@/lib/repositories/payment-overview";
import { getOnboardingStep } from "@/lib/utils/onboarding";
import {
  getMaintenanceOverviewFootnote,
  sumContractMaintenanceFees,
} from "@/lib/utils/payment-overview-display";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const [{ payments }, overview, homes, eligibleHomes, maintenanceData] =
    await Promise.all([
      getExpensesPageData(),
      getPaymentOverview(),
      getHomes(),
      getExpenseEligibleHomes(),
      getMaintenancePageData(),
    ]);
  const maintenanceFootnote = getMaintenanceOverviewFootnote(
    overview.maintenanceAmount,
    sumContractMaintenanceFees(maintenanceData.contractFees),
  );
  const onboarding = getOnboardingStep(homes);
  const isEmpty = payments.length === 0;
  const canAddExpense = eligibleHomes.length > 0;

  return (
    <div className="ui-page">
      <PageHeader
        title="납부"
        description="전기·가스·수도 등 공과금 납부 현황"
        action={
          !isEmpty && canAddExpense ? (
            <Link href="/expenses/new">
              <Button type="button" variant="secondary" className="w-full md:w-auto">
                공과금 추가
              </Button>
            </Link>
          ) : undefined
        }
      />

      <PaymentSectionNav />

      {onboarding.step === "no-home" ? (
        <PaymentOnboardingPanel
          title="등록된 집이 없어요"
          description="집을 등록하면 공과금 납부 일정을 관리할 수 있어요."
          href="/homes/new"
          actionLabel="내 집 등록하기"
        />
      ) : onboarding.step === "no-contract" && onboarding.primaryHomeId ? (
        <PaymentOnboardingPanel
          title="등록된 계약이 없어요"
          description="계약을 등록하면 공과금 납부 일정을 추가할 수 있어요."
          href={`/homes/${onboarding.primaryHomeId}/contract/new`}
          actionLabel="계약 등록하기"
        />
      ) : (
        <div className="ui-payment-panels">
          <PaymentOverviewPanel
            overview={overview}
            footnote={maintenanceFootnote}
          />
          {isEmpty ? (
            <PaymentCategoryListPanel
              title="공과금 목록"
              summary="예정 0 · 완료 0"
              emptyMessage="등록된 공과금이 없어요."
              footer={
                canAddExpense ? (
                  <Link href="/expenses/new">
                    <Button type="button" className="w-full md:w-auto">
                      공과금 추가
                    </Button>
                  </Link>
                ) : undefined
              }
            />
          ) : (
            <ExpensePaymentList payments={payments} />
          )}
        </div>
      )}
    </div>
  );
}
