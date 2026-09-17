import { RentPaymentList } from "@/app/(app)/rent/rent-payment-list";
import { PaymentOverviewPanel } from "@/components/payment/payment-overview-panel";
import { PaymentSectionNav } from "@/components/payment/payment-section-nav";
import { RentEmptyState } from "@/components/rent/rent-empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { getHomes } from "@/lib/repositories/homes";
import { getPaymentOverview } from "@/lib/repositories/payment-overview";
import { getRentPageData } from "@/lib/repositories/rent";
import { getMaintenancePageData } from "@/lib/repositories/maintenance";
import {
  getMaintenanceOverviewFootnote,
  sumContractMaintenanceFees,
} from "@/lib/utils/payment-overview-display";
import {
  findExpiredMonthlyHome,
  resolveRentEmptyReason,
} from "@/lib/utils/contract-display-status";
import { getOnboardingStep } from "@/lib/utils/onboarding";
import {
  getRentPageDescription,
  shouldShowRentOnboardingEmpty,
} from "@/lib/utils/payment-page-copy";
import { getMonthSearchParam } from "@/lib/utils/year-month";

export const dynamic = "force-dynamic";

export default async function RentPage({
  searchParams,
}: PageProps<"/rent">) {
  const month = getMonthSearchParam((await searchParams).month);
  const [{ payments }, overview, homes, maintenanceData] = await Promise.all([
    getRentPageData(month),
    getPaymentOverview(month),
    getHomes(),
    getMaintenancePageData(month),
  ]);
  const maintenanceFootnote = getMaintenanceOverviewFootnote(
    overview.maintenanceAmount,
    sumContractMaintenanceFees(maintenanceData.contractFees),
  );
  const onboarding = getOnboardingStep(homes);
  const emptyReason = resolveRentEmptyReason(homes, payments.length);
  const expiredHome = findExpiredMonthlyHome(homes);
  const showOnboardingEmpty = shouldShowRentOnboardingEmpty(
    emptyReason,
    overview.isCurrentMonth,
  );

  return (
    <div className="ui-page">
      <PageHeader
        title="납부"
        description={getRentPageDescription(overview.yearMonth)}
      />

      <PaymentSectionNav />

      {showOnboardingEmpty && emptyReason ? (
        <RentEmptyState
          reason={emptyReason}
          primaryHomeId={onboarding.primaryHomeId}
          expiredHome={expiredHome}
        />
      ) : (
        <div className="ui-payment-panels">
          <PaymentOverviewPanel
            variant="payment"
            overview={overview}
            footnote={maintenanceFootnote}
          />
          <RentPaymentList payments={payments} />
        </div>
      )}
    </div>
  );
}
