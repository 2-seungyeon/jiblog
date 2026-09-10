import type { BadgeVariant } from "@/components/ui/badge";
import {
  getContractStatusBadgeLabel,
  type ContractExpiryStatus,
} from "@/lib/utils/contract-status";

export function getContractStatusBadgeVariant(
  status: ContractExpiryStatus,
): BadgeVariant {
  switch (status) {
    case "expired":
      return "muted";
    case "warning":
      return "warning-strong";
    case "notice":
      return "warning";
    default:
      return "success";
  }
}

export function getContractStatusBannerClassName(
  status: ContractExpiryStatus,
): string {
  switch (status) {
    case "warning":
      return "ui-status-banner-warning-strong";
    case "notice":
      return "ui-status-banner-warning";
    case "expired":
      return "ui-status-banner";
    default:
      return "ui-status-banner";
  }
}

export function getPaymentStatusBadgeVariant(): BadgeVariant {
  return "muted";
}

export function getContractDateLineClassName(
  status: ContractExpiryStatus | null,
): string {
  switch (status) {
    case "warning":
      return "ui-contract-date-warning";
    case "notice":
      return "ui-contract-date-notice";
    case "expired":
      return "ui-contract-date-expired";
    default:
      return "ui-contract-date-normal";
  }
}

export function getRenewalHintClassName(
  status: "expired" | "warning",
): string {
  return status === "expired"
    ? "ui-renewal-hint-expired"
    : "ui-renewal-hint-warning";
}

export {
  getContractStatusBadgeLabel,
};
