import Link from "next/link";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/ui/page-header";

export type FormPageShellProps = {
  backHref: string;
  backLabel: string;
  title: string;
  description?: string;
  titleAddon?: ReactNode;
  children: ReactNode;
};

export function FormPageShell({
  backHref,
  backLabel,
  title,
  description,
  titleAddon,
  children,
}: FormPageShellProps) {
  return (
    <div className="ui-page">
      <section className="space-y-3">
        <Link href={backHref} className="ui-link-back">
          {backLabel}
        </Link>
        <PageHeader
          title={title}
          description={description}
          titleAddon={titleAddon}
        />
      </section>
      {children}
    </div>
  );
}
