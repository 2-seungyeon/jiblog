import Link from "next/link";
import { ContractStatusBadgeFromEndDate } from "@/components/ui/contract-status-badge";
import { Tag } from "@/components/ui/tag";
import type { HomeListItem } from "@/lib/types/homes";
import {
  formatHomeContractLine,
  getHomeContractExpiryStatus,
  getHomeContractLineClassName,
} from "@/lib/utils/contract-display-status";
import { getRenewalHintClassName } from "@/lib/utils/status-display";
import { formatHomeAddress } from "@/lib/utils/home-display";

export function HomeListCard({ home }: { home: HomeListItem }) {
  const expiryStatus = getHomeContractExpiryStatus(home.contract);
  const showRenewalHint =
    expiryStatus === "expired" || expiryStatus === "warning";
  const contractLine = formatHomeContractLine(home.contract);
  const needsAttention =
    expiryStatus === "notice" ||
    expiryStatus === "warning" ||
    expiryStatus === "expired";

  return (
    <Link
      href={`/homes/${home.id}`}
      className={[
        "ui-home-item",
        home.isPrimary ? "ui-home-item-primary" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="ui-home-title min-w-0 break-words">
            {home.nickname}
          </h2>
          {home.isPrimary ? <Tag variant="primary">대표</Tag> : null}
        </div>

        <div className="space-y-1.5">
          <p className="ui-home-secondary">
            {home.contract.hasContract ? (
              <>
                {home.contract.type}
                <span className="text-text-tertiary"> · </span>
                {home.residenceStatus}
              </>
            ) : (
              <>계약 미등록 · {home.residenceStatus}</>
            )}
          </p>

          {home.contract.hasContract ? (
            <div className="flex flex-wrap items-center gap-2">
              {needsAttention ? (
                <ContractStatusBadgeFromEndDate endDate={home.contract.endDate} />
              ) : null}
              <p
                className={[
                  "ui-home-date",
                  getHomeContractLineClassName(home.contract),
                ].join(" ")}
              >
                {contractLine}
              </p>
            </div>
          ) : null}
        </div>

        <p className="ui-home-address break-words border-t border-border-default pt-3">
          {formatHomeAddress(home.address, home.detailAddress)}
        </p>

        {showRenewalHint && home.contract.hasContract ? (
          <p
            className={[
              "text-sm",
              getRenewalHintClassName(expiryStatus as "expired" | "warning"),
            ].join(" ")}
          >
            {expiryStatus === "expired"
              ? "계약 갱신이 필요해요"
              : "계약 종료 전 갱신을 확인해주세요"}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
