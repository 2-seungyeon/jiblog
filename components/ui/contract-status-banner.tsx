import type { ReactNode } from "react";
import {
  getContractStatusMessage,
  type ContractExpiryStatus,
} from "@/lib/utils/contract-status";
import { getContractStatusBannerClassName } from "@/lib/utils/status-display";

type ContractStatusBannerProps = {
  status: ContractExpiryStatus;
  children?: ReactNode;
  className?: string;
};

export function ContractStatusBanner({
  status,
  children,
  className,
}: ContractStatusBannerProps) {
  const message = children ?? getContractStatusMessage(status);

  if (!message) {
    return null;
  }

  return (
    <div
      className={[
        getContractStatusBannerClassName(status),
        "text-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {message}
    </div>
  );
}
