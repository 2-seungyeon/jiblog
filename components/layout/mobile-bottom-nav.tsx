"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutIcon } from "@/components/layout/logout-icon";
import { LogoutSubmitButton } from "@/components/layout/logout-submit-button";
import {
  isMobileNavActive,
  mobileNavItems,
} from "@/components/layout/nav-config";

const iconClass = "size-6 shrink-0";

function DashboardIcon() {
  return (
    <svg
      className={iconClass}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg
      className={iconClass}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
      />
    </svg>
  );
}

function PaymentIcon() {
  return (
    <svg
      className={iconClass}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden="true"
    >
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <path strokeLinecap="round" d="M6 12h.01M18 12h.01" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg
      className={iconClass}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden="true"
    >
      <circle cx="12" cy="5" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="12" cy="19" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}

function NavIcon({
  href,
  placeholder,
}: {
  href?: string;
  placeholder?: boolean;
}) {
  if (placeholder) {
    return <MoreIcon />;
  }

  switch (href) {
    case "/dashboard":
      return <DashboardIcon />;
    case "/homes":
      return <HomeIcon />;
    case "/rent":
      return <PaymentIcon />;
    default:
      return <MoreIcon />;
  }
}

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="하단 메뉴"
      className="fixed inset-x-0 bottom-0 z-10 border-t border-border-default bg-surface pb-[env(safe-area-inset-bottom,0px)] md:hidden"
    >
      <ul className="mx-auto grid h-(--bottom-nav-height) max-w-lg grid-cols-4">
        {mobileNavItems.map((item) => {
          const active = isMobileNavActive(pathname, item);

          if (item.placeholder) {
            return (
              <li key={item.label}>
                <LogoutSubmitButton className="ui-bottom-nav-link ui-bottom-nav-link-inactive h-full w-full border-0 bg-transparent">
                  <LogoutIcon className={iconClass} />
                  <span className="text-xs font-medium">로그아웃</span>
                </LogoutSubmitButton>
              </li>
            );
          }

          return (
            <li key={item.href}>
              <Link
                href={item.href!}
                aria-current={active ? "page" : undefined}
                className={[
                  "ui-bottom-nav-link",
                  active
                    ? "ui-bottom-nav-link-active"
                    : "ui-bottom-nav-link-inactive",
                ].join(" ")}
              >
                <NavIcon href={item.href} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
