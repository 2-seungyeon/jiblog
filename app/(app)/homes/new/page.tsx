import { HomeNewForm } from "@/app/(app)/homes/new/home-new-form";
import { FormPageShell } from "@/components/ui/form-page-shell";
import { getDefaultIsPrimary } from "@/lib/repositories/homes";

export const dynamic = "force-dynamic";

export default async function HomeNewPage() {
  const defaultIsPrimary = await getDefaultIsPrimary();

  return (
    <FormPageShell
      backHref="/homes"
      backLabel="← 내 집"
      title="집 등록"
      description="집을 등록한 뒤 계약과 월세를 관리할 수 있어요."
    >
      <HomeNewForm defaultIsPrimary={defaultIsPrimary} />
    </FormPageShell>
  );
}
