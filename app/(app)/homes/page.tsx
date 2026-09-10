import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { HomeListCard } from "@/components/homes/home-list-card";
import { getHomes } from "@/lib/repositories/homes";

export const dynamic = "force-dynamic";

function EmptyState() {
  return (
    <Panel className="ui-panel-empty-state">
      <div className="space-y-2">
        <p className="ui-panel-title">아직 등록된 집이 없어요</p>
        <p className="ui-metadata">
          집을 등록하고 계약·월세·공과금을 한곳에서 관리해보세요.
        </p>
      </div>
      <Link href="/homes/new">
        <Button type="button" className="w-full md:w-auto">
          집 등록하기
        </Button>
      </Link>
    </Panel>
  );
}

export default async function HomesPage() {
  const homes = await getHomes();
  const isEmpty = homes.length === 0;

  return (
    <div className="ui-page">
      <PageHeader
        title="내 집"
        description={`관리 중인 집 ${homes.length}개`}
        action={
          !isEmpty ? (
            <Link href="/homes/new">
              <Button type="button" variant="secondary" className="w-full md:w-auto">
                새 집 등록
              </Button>
            </Link>
          ) : undefined
        }
      />

      {isEmpty ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {homes.map((home) => (
            <HomeListCard key={home.id} home={home} />
          ))}
        </div>
      )}
    </div>
  );
}
