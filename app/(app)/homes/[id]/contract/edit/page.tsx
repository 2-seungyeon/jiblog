import { notFound, redirect } from "next/navigation";
import { ContractEditForm } from "@/app/(app)/homes/[id]/contract/edit/contract-edit-form";
import { ContractGuidancePanel } from "@/components/contract/contract-guidance-panel";
import { FormPageShell } from "@/components/ui/form-page-shell";
import { getHomeDetail } from "@/lib/repositories/homes";
import { getContractEditPageDescription } from "@/lib/utils/contract-guidance";
import { getContractExpiryStatus } from "@/lib/utils/contract-status";

export default async function ContractEditPage({
  params,
}: PageProps<"/homes/[id]/contract/edit">) {
  const { id } = await params;
  const home = await getHomeDetail(id);

  if (!home) {
    notFound();
  }

  if (!home.contractDetail) {
    redirect(`/homes/${id}/contract/new`);
  }

  const expiryStatus = getContractExpiryStatus(home.contractDetail.endDate);
  const isRenewal = expiryStatus === "expired";
  const guidanceMode = isRenewal ? "renewal" : "edit";

  return (
    <FormPageShell
      backHref={`/homes/${id}`}
      backLabel={`← ${home.nickname}`}
      title={isRenewal ? "계약 갱신" : "계약 수정"}
      description={getContractEditPageDescription(guidanceMode)}
    >
      <ContractGuidancePanel
        homeId={home.id}
        mode={guidanceMode}
        status={isRenewal ? "expired" : expiryStatus}
      />
      <ContractEditForm
        homeId={home.id}
        homeNickname={home.nickname}
        contract={home.contractDetail}
        isRenewal={isRenewal}
      />
    </FormPageShell>
  );
}
