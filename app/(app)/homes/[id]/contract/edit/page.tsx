import { notFound, redirect } from "next/navigation";
import { ContractEditForm } from "@/app/(app)/homes/[id]/contract/edit/contract-edit-form";
import { FormPageShell } from "@/components/ui/form-page-shell";
import { getHomeDetail } from "@/lib/repositories/homes";
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

  return (
    <FormPageShell
      backHref={`/homes/${id}`}
      backLabel={`← ${home.nickname}`}
      title={isRenewal ? "계약 갱신" : "계약 수정"}
      description={
        isRenewal
          ? "계약 기간과 금액을 업데이트하면 월세 일정을 다시 관리할 수 있어요. 이미 완료한 납부 기록은 변경되지 않아요."
          : "계약 정보를 수정하면 예정 상태의 월세 금액이 함께 반영돼요. 이미 완료한 납부 기록은 변경되지 않아요."
      }
    >
      <ContractEditForm
        homeId={home.id}
        homeNickname={home.nickname}
        contract={home.contractDetail}
        isRenewal={isRenewal}
      />
    </FormPageShell>
  );
}
