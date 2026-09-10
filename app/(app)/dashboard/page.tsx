import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ContractStatusBadgeFromEndDate } from "@/components/ui/contract-status-badge";
import { PaymentOverviewPanel } from "@/components/payment/payment-overview-panel";
import { PanelNavLink } from "@/components/ui/panel-nav-link";
import { PaymentListItemLayout } from "@/components/ui/payment-list-item-layout";
import { Panel } from "@/components/ui/panel";
import { getPaymentRowClassName } from "@/lib/utils/payment-row";
import type {
  Contract,
  DashboardState,
  MonthlySummary,
  PrimaryHome,
  UpcomingPayment,
} from "@/lib/types/dashboard";
import type { PaymentOverview } from "@/lib/repositories/payment-overview";
import {
  formatDDay,
  getContractActionLabel,
  getContractExpiryStatus,
  getContractStatusMessage,
  type ContractExpiryStatus,
} from "@/lib/utils/contract-status";
import { getDashboardData } from "@/lib/repositories/dashboard";
import { getMaintenanceOverviewFootnote } from "@/lib/utils/payment-overview-display";

export const dynamic = "force-dynamic";

function getGreeting(
  userName: string,
  state: DashboardState,
  contractEndDate?: string,
): { nameLine: string; message: string } {
  const nameLine = `${userName}님,`;

  if (state === "ready" && contractEndDate) {
    const expiryStatus = getContractExpiryStatus(contractEndDate);

    if (expiryStatus === "expired") {
      return { nameLine, message: "계약 갱신이 필요해요" };
    }

    if (expiryStatus === "warning") {
      return { nameLine, message: "계약 종료일을 확인해주세요" };
    }
  }

  switch (state) {
    case "no-home":
      return { nameLine, message: "집로그에 오신 걸 환영해요" };
    case "no-contract":
      return { nameLine, message: "계약 정보를 등록해볼까요" };
    default:
      return { nameLine, message: "이번 달 주거비를 확인해보세요" };
  }
}

function EmptyPanel({
  title,
  description,
  href,
  actionLabel,
}: {
  title: string;
  description: string;
  href: string;
  actionLabel: string;
}) {
  return (
    <Panel className="ui-panel-empty-state">
      <div className="space-y-2">
        <h2 className="ui-panel-title">{title}</h2>
        <p className="ui-metadata">{description}</p>
      </div>
      <Link href={href}>
        <Button type="button" className="w-full sm:w-auto">
          {actionLabel}
        </Button>
      </Link>
    </Panel>
  );
}

function toPaymentOverview(summary: MonthlySummary): PaymentOverview {
  return {
    yearMonthLabel: summary.yearMonth,
    totalAmount: summary.total,
    rentAmount: summary.rentAmount,
    maintenanceAmount: summary.maintenanceAmount,
    utilityAmount: summary.utilityExpenseAmount,
    scheduledCount: summary.paymentSummary.scheduledCount,
    completedCount: summary.paymentSummary.completedCount,
  };
}

function TodoPanel({
  payments,
  paymentSummary,
  contractExpiryStatus,
}: {
  payments: UpcomingPayment[];
  paymentSummary: MonthlySummary["paymentSummary"];
  contractExpiryStatus?: ContractExpiryStatus;
}) {
  const totalCount =
    paymentSummary.scheduledCount + paymentSummary.completedCount;
  const allComplete = totalCount > 0 && paymentSummary.scheduledCount === 0;

  if (
    payments.length === 0 &&
    contractExpiryStatus === "expired"
  ) {
    return (
      <Panel>
        <div className="ui-panel-header">
          <h2 className="ui-panel-title">해야 할 일</h2>
        </div>
        <div className="ui-status-banner-warning-strong space-y-2">
          <p className="font-semibold text-text-primary">계약 갱신이 필요해요</p>
          <p className="ui-metadata">
            계약이 종료되어 새로운 월세 일정이 생성되지 않아요. 아래 내 계약에서
            갱신할 수 있어요.
          </p>
        </div>
      </Panel>
    );
  }

  if (payments.length > 0) {
    return (
      <Panel>
        <div className="ui-panel-header">
          <h2 className="ui-panel-title">해야 할 일</h2>
          <PanelNavLink href="/rent">납부 관리하기</PanelNavLink>
        </div>

        <ul className="ui-row-list-in-panel">
          {payments.slice(0, 5).map((payment) => (
            <li key={`${payment.type}-${payment.homeNickname}-${payment.dueDate}`}>
              <div className={getPaymentRowClassName("예정")}>
                <PaymentListItemLayout
                  title={payment.homeNickname}
                  contextLine={payment.type}
                  amount={payment.amount}
                  metaLine={`납부 예정일 ${payment.dueDate}`}
                  metaExtra={payment.relativeDate}
                  status="예정"
                />
              </div>
            </li>
          ))}
        </ul>

        {payments.length > 5 ? (
          <p className="ui-caption mt-3">외 {payments.length - 5}건 더 있어요</p>
        ) : null}
      </Panel>
    );
  }

  if (allComplete) {
    return (
      <Panel>
        <div className="ui-panel-header">
          <h2 className="ui-panel-title">해야 할 일</h2>
          <PanelNavLink href="/rent">납부 관리하기</PanelNavLink>
        </div>
        <p className="ui-metadata">이번 달 납부를 모두 완료했어요.</p>
      </Panel>
    );
  }

  return (
    <Panel>
      <div className="ui-panel-header">
        <h2 className="ui-panel-title">해야 할 일</h2>
        <PanelNavLink href="/rent">납부 관리하기</PanelNavLink>
      </div>
      <p className="ui-metadata">등록된 납부 일정이 없어요.</p>
    </Panel>
  );
}

function ContractPanel({
  contract,
  home,
}: {
  contract: Contract;
  home: PrimaryHome;
}) {
  const expiryStatus = getContractExpiryStatus(contract.endDate);
  const statusMessage = getContractStatusMessage(expiryStatus);
  const dDayLabel = formatDDay(contract.endDate);
  const needsAttention =
    expiryStatus === "notice" ||
    expiryStatus === "warning" ||
    expiryStatus === "expired";

  return (
    <Panel>
      <div className="ui-panel-header">
        <h2 className="ui-panel-title">내 계약</h2>
        <PanelNavLink href={`/homes/${home.id}`}>집 정보</PanelNavLink>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-base font-semibold text-text-primary">{home.nickname}</p>
          {needsAttention ? (
            <ContractStatusBadgeFromEndDate endDate={contract.endDate} />
          ) : null}
        </div>

        <p className="ui-home-secondary">{contract.type}</p>

        {dDayLabel !== "—" ? (
          <p
            className={[
              "ui-value-md",
              needsAttention ? "text-warning-strong" : "text-text-primary",
            ].join(" ")}
          >
            {dDayLabel}
          </p>
        ) : null}

        <p className="ui-caption">
          {contract.startDate} — {contract.endDate}
        </p>

        {needsAttention && statusMessage ? (
          <div
            className={
              expiryStatus === "expired"
                ? "ui-status-banner space-y-3"
                : "ui-status-banner-warning space-y-3"
            }
          >
            <p className="ui-metadata">{statusMessage}</p>
            <Link href={`/homes/${home.id}/contract/edit`}>
              <Button type="button" className="w-full sm:w-auto">
                {getContractActionLabel(expiryStatus)}
              </Button>
            </Link>
          </div>
        ) : null}
      </div>
    </Panel>
  );
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  const greeting = getGreeting(
    data.userName,
    data.state,
    data.contract?.endDate,
  );

  return (
    <div className="ui-page">
      <div className="ui-greeting">
        <p className="ui-greeting-name">{greeting.nameLine}</p>
        <p>{greeting.message}</p>
      </div>

      {data.state === "no-home" ? (
        <EmptyPanel
          title="등록된 집이 없어요"
          description="내 집을 등록하고 계약과 납부 정보를 관리해보세요."
          href="/homes/new"
          actionLabel="내 집 등록하기"
        />
      ) : null}

      {data.state === "no-contract" && data.primaryHome ? (
        <>
          <Panel>
            <p className="ui-panel-title">{data.primaryHome.nickname}</p>
            <p className="ui-metadata mt-1">{data.primaryHome.address}</p>
          </Panel>
          <EmptyPanel
            title="등록된 계약이 없어요"
            description="계약을 등록하면 월세와 공과금 일정을 관리할 수 있어요."
            href={`/homes/${data.primaryHome.id}/contract/new`}
            actionLabel="계약 등록하기"
          />
        </>
      ) : null}

      {data.state === "ready" &&
      data.contract &&
      data.monthlySummary &&
      data.primaryHome ? (
        <>
          <PaymentOverviewPanel
            overview={toPaymentOverview(data.monthlySummary)}
            footnote={getMaintenanceOverviewFootnote(
              data.monthlySummary.maintenanceAmount,
              data.contract.maintenanceFee,
            )}
          />

          <TodoPanel
            payments={data.upcomingPayments}
            paymentSummary={data.monthlySummary.paymentSummary}
            contractExpiryStatus={getContractExpiryStatus(data.contract.endDate)}
          />

          <ContractPanel contract={data.contract} home={data.primaryHome} />
        </>
      ) : null}
    </div>
  );
}
