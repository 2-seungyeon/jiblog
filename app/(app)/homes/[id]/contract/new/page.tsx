import { notFound, redirect } from "next/navigation";
import { ContractNewForm } from "@/app/(app)/homes/[id]/contract/new/contract-new-form";
import { FormPageShell } from "@/components/ui/form-page-shell";
import { getHomeDetail } from "@/lib/repositories/homes";

export default async function ContractNewPage({
  params,
}: PageProps<"/homes/[id]/contract/new">) {
  const { id } = await params;
  const home = await getHomeDetail(id);

  if (!home) {
    notFound();
  }

  if (home.contractDetail) {
    redirect(`/homes/${id}`);
  }

  return (
    <FormPageShell
      backHref={`/homes/${id}`}
      backLabel={`← ${home.nickname}`}
      title="계약 등록"
      description="계약 정보를 등록하면 D-Day와 월세 일정을 관리할 수 있어요."
    >
      <ContractNewForm homeId={home.id} homeNickname={home.nickname} />
    </FormPageShell>
  );
}
