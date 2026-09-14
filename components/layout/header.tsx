"use client";

import { usePathname } from "next/navigation";
import { AppBrand } from "@/components/layout/app-brand";
import { LogoutButton } from "@/components/layout/logout-button";
import { desktopNavItems, isNavActive } from "@/components/layout/nav-config";
import Link from "next/link";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 hidden h-(--header-height) border-b border-border-default bg-surface md:block">
      <div className="mx-auto flex h-full max-w-3xl items-center justify-between gap-4 px-6">
        <AppBrand className="shrink-0" />

        <div className="ui-header-actions">
          <nav aria-label="주요 메뉴" className="ui-nav-pill-group">
            {desktopNavItems.map((item) => {
              const active = isNavActive(pathname, item);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={
                    active ? "ui-nav-pill-active" : "ui-nav-pill-inactive"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <span className="ui-header-divider" aria-hidden="true" />

          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
