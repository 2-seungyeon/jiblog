import { PaymentOnboardingPanel } from "@/components/payment/payment-onboarding-panel";
import type { HomeListItem } from "@/lib/types/homes";
import type { RentEmptyReason } from "@/lib/utils/contract-display-status";

type RentEmptyStateProps = {
  reason: RentEmptyReason;
  primaryHomeId?: string;
  expiredHome?: HomeListItem | null;
};

export function RentEmptyState({
  reason,
  primaryHomeId,
  expiredHome,
}: RentEmptyStateProps) {
  switch (reason) {
    case "no-home":
      return (
        <PaymentOnboardingPanel
          title="등록된 집이 없어요"
          description="집을 등록하면 월세 납부 일정을 관리할 수 있어요."
          href="/homes/new"
          actionLabel="내 집 등록하기"
        />
      );

    case "no-contract":
      return primaryHomeId ? (
        <PaymentOnboardingPanel
          title="등록된 계약이 없어요"
          description="계약을 등록하면 월세 납부 일정을 관리할 수 있어요."
          href={`/homes/${primaryHomeId}/contract/new`}
          actionLabel="계약 등록하기"
        />
      ) : null;

    case "expired":
      if (!expiredHome) {
        return null;
      }

      return (
        <PaymentOnboardingPanel
          title="계약이 종료되었어요"
          description={`${expiredHome.nickname}의 계약 기간이 끝나 새로운 월세 일정이 생성되지 않아요.`}
          href={`/homes/${expiredHome.id}/contract/edit`}
          actionLabel="계약 갱신하기"
        />
      );

    case "jeonse-only":
      return (
        <PaymentOnboardingPanel
          title="관리할 월세가 없어요"
          description="전세 계약은 월세 납부 일정이 없어요. 공과금은 공과금 메뉴에서 관리할 수 있어요."
          href="/expenses"
          actionLabel="공과금 관리하기"
        />
      );

    case "active-no-payments":
      return (
        <PaymentOnboardingPanel
          title="이번 달 월세 일정이 없어요"
          description="계약 정보를 확인하거나 잠시 후 다시 불러와주세요."
          href="/homes"
          actionLabel="내 집 보기"
          variant="secondary"
        />
      );
  }
}
