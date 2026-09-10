import { MaintenancePaymentList } from "@/app/(app)/maintenance/maintenance-payment-list";
import { PaymentOnboardingPanel } from "@/components/payment/payment-onboarding-panel";
import { PaymentOverviewPanel } from "@/components/payment/payment-overview-panel";
import { PaymentSectionNav } from "@/components/payment/payment-section-nav";
import { PageHeader } from "@/components/ui/page-header";
import { getMaintenancePageData } from "@/lib/repositories/maintenance";
import { getPaymentOverview } from "@/lib/repositories/payment-overview";
import { getHomes } from "@/lib/repositories/homes";
import { getOnboardingStep } from "@/lib/utils/onboarding";
import {
  getMaintenanceOverviewFootnote,
  sumContractMaintenanceFees,
} from "@/lib/utils/payment-overview-display";

export const dynamic = "force-dynamic";

export default async function MaintenancePage() {
  const [maintenanceData, overview, homes] = await Promise.all([
    getMaintenancePageData(),
    getPaymentOverview(),
    getHomes(),
  ]);
  const onboarding = getOnboardingStep(homes);
  const hasHomes = homes.length > 0;
  const hasContract = onboarding.step !== "no-home" && onboarding.step !== "no-contract";
  const contractMaintenanceTotal = sumContractMaintenanceFees(
    maintenanceData.contractFees,
  );
  const maintenanceFootnote = getMaintenanceOverviewFootnote(
    overview.maintenanceAmount,
    contractMaintenanceTotal,
  );

  return (
    <div className="ui-page">
      <PageHeader
        title="납부"
        description="이번 달 관리비 납부 현황"
      />

      <PaymentSectionNav />

      {!hasHomes ? (
        <PaymentOnboardingPanel
          title="등록된 집이 없어요"
          description="집을 등록하면 관리비 납부 일정을 관리할 수 있어요."
          href="/homes/new"
          actionLabel="내 집 등록하기"
        />
      ) : !hasContract ? (
        <PaymentOnboardingPanel
          title="등록된 계약이 없어요"
          description="계약을 등록하면 관리비 정보를 확인할 수 있어요."
          href={
            onboarding.primaryHomeId
              ? `/homes/${onboarding.primaryHomeId}/contract/new`
              : "/homes"
          }
          actionLabel="계약 등록하기"
        />
      ) : (
        <div className="ui-payment-panels">
          <PaymentOverviewPanel
            variant="payment"
            overview={overview}
            hint={
              maintenanceData.payments.some((p) => p.status === "예정")
                ? "관리비 납부 예정 항목을 확인해주세요"
                : undefined
            }
            footnote={maintenanceFootnote}
          />
          <MaintenancePaymentList
            payments={maintenanceData.payments}
            contractFees={maintenanceData.contractFees}
          />
        </div>
      )}
    </div>
  );
}
