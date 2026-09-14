"use client";

import { AppBrand } from "@/components/layout/app-brand";

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-border-default bg-surface md:hidden">
      <div className="mx-auto flex h-(--header-height) max-w-3xl items-center px-4">
        <AppBrand size="sm" />
      </div>
    </header>
  );
}
