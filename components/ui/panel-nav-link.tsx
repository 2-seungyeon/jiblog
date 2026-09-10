import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

type PanelNavLinkProps = ComponentPropsWithoutRef<typeof Link>;

export function PanelNavLink({ className, children, ...props }: PanelNavLinkProps) {
  return (
    <Link
      className={["ui-panel-nav-link", className].filter(Boolean).join(" ")}
      {...props}
    >
      <span>{children}</span>
      <span className="ui-panel-nav-link-chevron" aria-hidden="true">
        ›
      </span>
    </Link>
  );
}
