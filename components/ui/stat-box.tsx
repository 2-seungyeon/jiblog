import { formatWon } from "@/lib/utils/format";

export type StatBoxProps = {
  label: string;
  count: number;
  amount: number;
  tone?: "default" | "muted" | "pending";
};

export function StatBox({
  label,
  count,
  amount,
  tone = "default",
}: StatBoxProps) {
  return (
    <div
      className={[
        "ui-stat-box",
        tone === "muted" ? "ui-stat-box-muted" : "",
        tone === "pending" ? "ui-stat-box-pending" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <p className="ui-stat-box-label">{label}</p>
      <p className="ui-stat-box-value">{count}건</p>
      <p className="ui-stat-box-meta">{formatWon(amount)}</p>
    </div>
  );
}
