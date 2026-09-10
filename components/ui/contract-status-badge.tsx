import { Badge } from "@/components/ui/badge";
import {
  getContractStatusBadgeLabel,
  getContractExpiryStatus,
  type ContractExpiryStatus,
} from "@/lib/utils/contract-status";
import { getContractStatusBadgeVariant } from "@/lib/utils/status-display";

type ContractStatusBadgeProps = {
  status: ContractExpiryStatus;
};

export function ContractStatusBadge({ status }: ContractStatusBadgeProps) {
  if (status === "unknown" || status === "normal") {
    return null;
  }

  return (
    <Badge variant={getContractStatusBadgeVariant(status)}>
      {getContractStatusBadgeLabel(status)}
    </Badge>
  );
}

type ContractStatusBadgeFromEndDateProps = {
  endDate: string;
};

export function ContractStatusBadgeFromEndDate({
  endDate,
}: ContractStatusBadgeFromEndDateProps) {
  return (
    <ContractStatusBadge status={getContractExpiryStatus(endDate)} />
  );
}
