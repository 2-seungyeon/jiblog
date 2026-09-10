import Link from "next/link";
import { notFound } from "next/navigation";
import { HomeDeleteSection } from "@/components/homes/home-delete-section";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { Tag } from "@/components/ui/tag";
import { ContractStatusBadgeFromEndDate } from "@/components/ui/contract-status-badge";
import { ContractStatusBanner } from "@/components/ui/contract-status-banner";
import { DEFAULT_RENT_DUE_DAY } from "@/lib/constants/app";
import { formatWon } from "@/lib/utils/format";
import {
  formatContractAmounts,
  formatRentSnapshotDisplay,
} from "@/lib/utils/contract-display";
import { formatHomeAddress } from "@/lib/utils/home-display";
import { formatMonthlyRentDueDayLabel } from "@/lib/utils/payment-display";
import {
  formatDDay,
  getContractActionLabel,
  getContractExpiryStatus,
} from "@/lib/utils/contract-status";
import {
  type HomeContractDetail,
  type HomeDetail,
  type HomePaymentSnapshot,
} from "@/lib/types/homes";
import { getHomeDeleteCheck, getHomeDetail } from "@/lib/repositories/homes";

export const dynamic = "force-dynamic";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="ui-detail-row">
      <span className="shrink-0 text-text-secondary">{label}</span>
      <span className="min-w-0 text-right font-medium break-words text-text-primary">
        {value}
      </span>
    </div>
  );
}

function HomeHeader({ home }: { home: HomeDetail }) {
  return (
    <Panel>
      <Link href="/homes" className="ui-link-back">
        ← 내 집
      </Link>

      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="ui-page-title min-w-0 break-words">
              {home.nickname}
            </h1>
            {home.isPrimary ? <Tag variant="primary">대표</Tag> : null}
          </div>
          <p className="ui-home-secondary">{home.residenceStatus}</p>
          <p className="ui-home-address break-words">
            {formatHomeAddress(home.address, home.detailAddress)}
          </p>
        </div>
        <Link href={`/homes/${home.id}/edit`} className="shrink-0">
          <Button type="button" variant="secondary" className="w-full sm:w-auto">
            집 정보 수정
          </Button>
        </Link>
      </div>
    </Panel>
  );
}

function ContractSection({
  contract,
  homeId,
}: {
  contract: HomeContractDetail;
  homeId: string;
}) {
  const amounts = formatContractAmounts(contract);
  const expiryStatus = getContractExpiryStatus(contract.endDate);
  const dDayLabel = formatDDay(contract.endDate);
  const showDueDay = contract.type !== "전세";
  const needsBanner =
    expiryStatus === "notice" ||
    expiryStatus === "warning" ||
    expiryStatus === "expired";

  return (
    <Panel>
      <div className="ui-panel-header">
        <h2 className="ui-panel-title">계약</h2>
        <ContractStatusBadgeFromEndDate endDate={contract.endDate} />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="ui-home-secondary">{contract.type}</p>
          {dDayLabel !== "—" ? (
            <p
              className={[
                "ui-value-md",
                needsBanner ? "text-warning-strong" : "text-text-primary",
              ].join(" ")}
            >
              {dDayLabel}
            </p>
          ) : null}
          <p className="ui-caption">
            {contract.startDate} — {contract.endDate}
          </p>
        </div>
        <Link href={`/homes/${homeId}/contract/edit`}>
          <Button
            type="button"
            variant={expiryStatus === "expired" ? "primary" : "secondary"}
            className="w-full sm:w-auto"
          >
            {getContractActionLabel(expiryStatus)}
          </Button>
        </Link>
      </div>

      {needsBanner ? (
        <ContractStatusBanner status={expiryStatus} className="mt-4" />
      ) : null}

      <div className="ui-panel-divider mt-4 divide-y divide-border-default">
        <DetailRow label="보증금" value={amounts.deposit} />
        <DetailRow label="월세" value={amounts.monthlyRent} />
        <DetailRow label="관리비" value={amounts.maintenanceFee} />
        {showDueDay ? (
          <DetailRow
            label="월세 납부 예정일"
            value={formatMonthlyRentDueDayLabel(DEFAULT_RENT_DUE_DAY)}
          />
        ) : null}
      </div>
    </Panel>
  );
}

function ContractEmptySection({ homeId }: { homeId: string }) {
  return (
    <Panel className="space-y-4">
      <h2 className="ui-panel-title">계약</h2>
      <p className="ui-metadata">
        계약을 등록하면 월세와 주거비를 관리할 수 있어요.
      </p>
      <Link href={`/homes/${homeId}/contract/new`}>
        <Button type="button" className="w-full sm:w-auto">
          계약 등록하기
        </Button>
      </Link>
    </Panel>
  );
}

function PaymentSection({
  snapshot,
  contractType,
  contractMaintenanceFee,
}: {
  snapshot: HomePaymentSnapshot;
  contractType: HomeContractDetail["type"] | null;
  contractMaintenanceFee?: number | null;
}) {
  const maintenanceValue =
    snapshot.maintenanceAmount > 0
      ? formatWon(snapshot.maintenanceAmount)
      : contractMaintenanceFee && contractMaintenanceFee > 0
        ? `${formatWon(contractMaintenanceFee)} · 일정 미등록`
        : "등록 없음";

  return (
    <Panel>
      <p className="ui-period-label">{snapshot.yearMonth}</p>
      <h2 className="ui-panel-title mt-1">이번 달 납부</h2>

      <div className="ui-panel-divider mt-4 divide-y divide-border-default">
        <DetailRow
          label="월세"
          value={formatRentSnapshotDisplay(
            contractType,
            snapshot.rentAmount,
            snapshot.rentStatus,
          )}
        />
        <DetailRow label="관리비" value={maintenanceValue} />
        <DetailRow
          label="공과금"
          value={
            snapshot.utilityExpenseAmount > 0
              ? `${formatWon(snapshot.utilityExpenseAmount)} · ${snapshot.expenseCount}건`
              : "등록 없음"
          }
        />
      </div>
    </Panel>
  );
}

function BasicInfoSection({ home }: { home: HomeDetail }) {
  if (!home.moveInDate && !home.memo) {
    return null;
  }

  return (
    <Panel>
      <h2 className="ui-panel-title">추가 정보</h2>
      <div className="ui-panel-divider mt-4 divide-y divide-border-default">
        {home.moveInDate ? (
          <DetailRow label="입주일" value={home.moveInDate} />
        ) : null}
        {home.memo ? <DetailRow label="메모" value={home.memo} /> : null}
      </div>
    </Panel>
  );
}

export default async function HomeDetailPage({
  params,
}: PageProps<"/homes/[id]">) {
  const { id } = await params;
  const home = await getHomeDetail(id);

  if (!home) {
    notFound();
  }

  const deleteCheck = await getHomeDeleteCheck(id);
  const hasContract = home.contractDetail !== null;

  return (
    <div className="ui-page">
      <HomeHeader home={home} />

      {hasContract && home.contractDetail ? (
        <ContractSection contract={home.contractDetail} homeId={home.id} />
      ) : (
        <ContractEmptySection homeId={home.id} />
      )}

      {home.paymentSnapshot ? (
        <PaymentSection
          snapshot={home.paymentSnapshot}
          contractType={home.contractDetail?.type ?? null}
          contractMaintenanceFee={home.contractDetail?.maintenanceFee}
        />
      ) : null}

      <BasicInfoSection home={home} />

      {deleteCheck ? (
        <HomeDeleteSection
          homeId={home.id}
          homeNickname={home.nickname}
          canDelete={deleteCheck.canDelete}
          blockedMessage={deleteCheck.message}
        />
      ) : null}
    </div>
  );
}
