import type { ReactNode } from "react";

export type PageHeaderProps = {
  title: string;
  description?: string;
  titleAddon?: ReactNode;
  action?: ReactNode;
};

export function PageHeader({
  title,
  description,
  titleAddon,
  action,
}: PageHeaderProps) {
  return (
    <section className="ui-page-header">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="ui-page-title">{title}</h1>
            {titleAddon}
          </div>
          {description ? (
            <p className="ui-page-description">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </section>
  );
}
