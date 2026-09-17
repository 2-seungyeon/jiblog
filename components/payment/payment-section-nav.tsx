"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { isCurrentYearMonth } from "@/lib/utils/year-month";

const tabs = [
  { href: "/rent", label: "월세", match: (path: string) => path === "/rent" || path.startsWith("/rent/") },
  {
    href: "/maintenance",
    label: "관리비",
    match: (path: string) =>
      path === "/maintenance" || path.startsWith("/maintenance/"),
  },
  {
    href: "/expenses",
    label: "공과금",
    match: (path: string) =>
      path === "/expenses" || path.startsWith("/expenses/"),
  },
] as const;

function PaymentSectionNavInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const month = searchParams.get("month");
  const monthQuery =
    month && !isCurrentYearMonth(month) ? `?month=${month}` : "";

  return (
    <nav aria-label="납부 구분" className="ui-payment-section-nav">
      <div className="ui-payment-tab-group">
        {tabs.map((tab) => {
          const active = tab.match(pathname);

          return (
            <Link
              key={tab.href}
              href={`${tab.href}${monthQuery}`}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "ui-payment-tab ui-payment-tab-active"
                  : "ui-payment-tab ui-payment-tab-inactive"
              }
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function PaymentSectionNav() {
  return (
    <Suspense
      fallback={
        <nav aria-label="납부 구분" className="ui-payment-section-nav">
          <div className="ui-payment-tab-group" />
        </nav>
      }
    >
      <PaymentSectionNavInner />
    </Suspense>
  );
}
