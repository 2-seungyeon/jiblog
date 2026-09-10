import { Panel } from "@/components/ui/panel";
import type { PaymentOverview } from "@/lib/repositories/payment-overview";
import { formatWon } from "@/lib/utils/format";

type PaymentOverviewPanelProps = {
  overview: PaymentOverview;
  hint?: string;
  footnote?: string;
  /** Dashboard: stack breakdown rows below 376px. Payment: same for /rent, /maintenance, /expenses. */
  variant?: "default" | "dashboard" | "payment";
};

export function PaymentOverviewPanel({
  overview,
  hint,
  footnote,
  variant = "default",
}: PaymentOverviewPanelProps) {
  const defaultHint =
    overview.scheduledCount > 0
      ? `납부 예정 ${overview.scheduledCount}건 · 완료 ${overview.completedCount}건`
      : overview.completedCount > 0
        ? `납부 완료 ${overview.completedCount}건`
        : "등록된 납부 일정이 없어요";

  return (
    <Panel>
      <p className="ui-period-label">{overview.yearMonthLabel}</p>
      <p className="mt-1 text-base text-text-secondary">이번 달 주거비</p>
      <p className="ui-summary-total mt-2">{formatWon(overview.totalAmount)}</p>

      <div
        className={[
          "ui-stat-grid",
          variant === "dashboard" ? "ui-stat-grid-dashboard" : "",
          variant === "payment" ? "ui-stat-grid-payment" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="ui-stat-cell">
          <p className="ui-stat-cell-label">월세</p>
          <p className="ui-stat-cell-value">
            {overview.rentAmount === 0 ? "—" : formatWon(overview.rentAmount)}
          </p>
        </div>
        <div className="ui-stat-cell">
          <p className="ui-stat-cell-label">관리비</p>
          <p className="ui-stat-cell-value">
            {overview.maintenanceAmount === 0 ? "—" : formatWon(overview.maintenanceAmount)}
          </p>
        </div>
        <div className="ui-stat-cell">
          <p className="ui-stat-cell-label">공과금</p>
          <p className="ui-stat-cell-value">
            {overview.utilityAmount === 0 ? "—" : formatWon(overview.utilityAmount)}
          </p>
        </div>
      </div>

      <p className="mt-3 text-sm text-text-secondary">{hint ?? defaultHint}</p>
      {footnote ? <p className="ui-caption mt-1">{footnote}</p> : null}
    </Panel>
  );
}
