import { Panel } from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";

function PaymentTabNavSkeleton() {
  const tabWidths = ["w-10", "w-12", "w-14"];

  return (
    <div className="ui-payment-section-nav" aria-hidden="true">
      <div className="ui-payment-tab-group">
        {tabWidths.map((width, index) => (
          <div key={index} className="flex min-h-11 items-center justify-center py-3.5">
            <Skeleton className={`h-5 ${width} rounded-sm`} />
          </div>
        ))}
      </div>
    </div>
  );
}

function PanelHeaderSkeleton({ action = false }: { action?: boolean }) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-3">
      <Skeleton className="h-6 w-28" />
      {action ? <Skeleton className="h-4 w-20" /> : null}
    </div>
  );
}

function StatGridSkeleton({
  dashboard = false,
  payment = false,
}: {
  dashboard?: boolean;
  payment?: boolean;
}) {
  return (
    <div
      className={[
        "ui-stat-grid",
        dashboard ? "ui-stat-grid-dashboard" : "",
        payment ? "ui-stat-grid-payment" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="ui-stat-cell space-y-2">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  );
}

function SummaryPanelSkeleton({
  dashboard = false,
  payment = false,
}: {
  dashboard?: boolean;
  payment?: boolean;
}) {
  return (
    <Panel aria-busy="true" aria-label="주거비 정보 불러오는 중">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="mt-2 h-4 w-24" />
      <Skeleton className="ui-summary-total mt-2 h-10 w-36 max-w-full md:h-12" />
      <div className="mt-4">
        <StatGridSkeleton dashboard={dashboard} payment={payment} />
      </div>
      <Skeleton className="mt-3 h-4 w-40" />
    </Panel>
  );
}

function ListRowSkeleton() {
  return (
    <div className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-3.5 w-32" />
      </div>
      <div className="grid w-full shrink-0 grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-2 sm:flex sm:w-auto sm:flex-col sm:items-end sm:gap-2">
        <Skeleton className="col-start-1 row-start-1 h-7 w-24" />
        <Skeleton className="col-start-2 row-start-1 h-5 w-16 rounded-md" />
      </div>
    </div>
  );
}

function ListPanelSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <Panel aria-busy="true" aria-label="목록 불러오는 중">
      <PanelHeaderSkeleton action />
      <div className="divide-y divide-border-default">
        {Array.from({ length: rows }).map((_, index) => (
          <ListRowSkeleton key={index} />
        ))}
      </div>
    </Panel>
  );
}

export function DashboardLoadingSkeleton() {
  return (
    <div className="ui-page" aria-busy="true" aria-label="대시보드 불러오는 중">
      <Skeleton className="h-4 w-56 max-w-full" />
      <SummaryPanelSkeleton dashboard />
      <ListPanelSkeleton rows={2} />
      <Panel aria-busy="true" aria-label="계약 정보 불러오는 중">
        <PanelHeaderSkeleton action />
        <div className="space-y-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-3.5 w-40" />
        </div>
      </Panel>
    </div>
  );
}

export function HomesLoadingSkeleton() {
  return (
    <div className="ui-page" aria-busy="true" aria-label="집 목록 불러오는 중">
      <section className="ui-page-header">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-12 w-28 rounded-button" />
        </div>
      </section>

      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Panel key={index} compact>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-5 w-10 rounded-full" />
              </div>
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-52" />
              <Skeleton className="h-4 w-full max-w-md" />
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

export function PaymentPageLoadingSkeleton({
  descriptionWidth = "w-40",
}: {
  descriptionWidth?: string;
}) {
  return (
    <div className="ui-page" aria-busy="true" aria-label="납부 정보 불러오는 중">
      <section className="ui-page-header">
        <div className="space-y-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className={`h-4 ${descriptionWidth}`} />
        </div>
      </section>

      <PaymentTabNavSkeleton />

      <div className="ui-payment-panels">
        <SummaryPanelSkeleton payment />
        <ListPanelSkeleton rows={3} />
      </div>
    </div>
  );
}

export function HomeDetailLoadingSkeleton() {
  return (
    <div className="ui-page" aria-busy="true" aria-label="집 상세 불러오는 중">
      <Panel>
        <Skeleton className="h-4 w-16" />
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-full max-w-sm" />
          </div>
          <Skeleton className="h-12 w-28 rounded-button" />
        </div>
      </Panel>

      <Panel>
        <PanelHeaderSkeleton />
        <div className="space-y-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-3.5 w-44" />
        </div>
        <div className="ui-panel-divider mt-4 space-y-4 pt-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between gap-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <Skeleton className="h-3 w-16" />
        <Skeleton className="mt-2 h-6 w-28" />
        <div className="ui-panel-divider mt-4 space-y-4 pt-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between gap-3">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
