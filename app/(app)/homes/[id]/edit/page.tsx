import { notFound } from "next/navigation";
import { HomeEditForm } from "@/app/(app)/homes/[id]/edit/home-edit-form";
import { FormPageShell } from "@/components/ui/form-page-shell";
import { Tag } from "@/components/ui/tag";
import { getHomeDetail } from "@/lib/repositories/homes";

export default async function HomeEditPage({
  params,
}: PageProps<"/homes/[id]/edit">) {
  const { id } = await params;
  const home = await getHomeDetail(id);

  if (!home) {
    notFound();
  }

  return (
    <FormPageShell
      backHref={`/homes/${home.id}`}
      backLabel={`← ${home.nickname}`}
      title="집 정보 수정"
      description="집의 기본 정보를 수정할 수 있어요."
      titleAddon={home.isPrimary ? <Tag variant="primary">대표</Tag> : undefined}
    >
      <HomeEditForm home={home} />
    </FormPageShell>
  );
}
