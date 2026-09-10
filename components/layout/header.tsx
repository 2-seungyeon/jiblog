"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/layout/logout-button";
import { desktopNavItems, isNavActive } from "@/components/layout/nav-config";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 hidden h-(--header-height) border-b border-border-default bg-surface md:block">
      <div className="mx-auto flex h-full max-w-3xl items-center justify-between gap-4 px-6">
        <Link
          href="/dashboard"
          className="inline-flex shrink-0 items-center gap-2 rounded-md text-lg font-bold text-text-primary no-underline transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          <Image
            src="/favicon.ico"
            alt=""
            width={28}
            height={28}
            className="size-7 shrink-0 rounded-sm"
            aria-hidden
          />
          <span>집로그</span>
        </Link>

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
