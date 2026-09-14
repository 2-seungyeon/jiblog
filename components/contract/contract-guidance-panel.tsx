import Link from "next/link";
import {
  getContractGuidanceSteps,
  getContractGuidanceTitle,
  getContractHomeDetailGuidance,
  type ContractGuidanceMode,
} from "@/lib/utils/contract-guidance";
import type { ContractExpiryStatus } from "@/lib/utils/contract-status";

type ContractGuidancePanelProps = {
  homeId: string;
  mode: ContractGuidanceMode;
  status?: ContractExpiryStatus;
  title?: string;
  steps?: readonly string[];
  showHomeEditLink?: boolean;
  className?: string;
};

function getBannerClassName(
  mode: ContractGuidanceMode,
  status?: ContractExpiryStatus,
): string {
  if (mode === "renewal" || status === "expired") {
    return "ui-status-banner";
  }

  if (status === "warning") {
    return "ui-status-banner-warning-strong";
  }

  if (status === "notice") {
    return "ui-status-banner-warning";
  }

  return "ui-status-banner-warning";
}

export function ContractGuidancePanel({
  homeId,
  mode,
  status,
  title,
  steps,
  showHomeEditLink = mode === "edit",
  className,
}: ContractGuidancePanelProps) {
  const resolvedTitle = title ?? getContractGuidanceTitle(mode);
  const resolvedSteps = steps ?? getContractGuidanceSteps(mode);

  return (
    <aside
      className={[
        getBannerClassName(mode, status),
        "space-y-3 text-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={resolvedTitle}
    >
      <p className="font-medium text-text-primary">{resolvedTitle}</p>
      <ol className="list-decimal space-y-1.5 pl-5 text-text-secondary">
        {resolvedSteps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      {showHomeEditLink ? (
        <p className="text-text-secondary">
          퇴거·이사 후 정리는{" "}
          <Link href={`/homes/${homeId}/edit`} className="ui-link font-medium">
            집 정보 수정
          </Link>
          에서 할 수 있어요.
        </p>
      ) : null}
    </aside>
  );
}

export function ContractHomeDetailGuidance({
  homeId,
  status,
}: {
  homeId: string;
  status: ContractExpiryStatus;
}) {
  const guidance = getContractHomeDetailGuidance(status);

  if (!guidance) {
    return null;
  }

  return (
    <ContractGuidancePanel
      homeId={homeId}
      mode={status === "expired" ? "renewal" : "edit"}
      status={status}
      title={guidance.title}
      steps={guidance.steps}
      showHomeEditLink
      className="mt-4"
    />
  );
}
