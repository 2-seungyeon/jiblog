export type NavItem = {
  href: string;
  label: string;
  matchPrefixes?: string[];
};

export const desktopNavItems: NavItem[] = [
  { href: "/dashboard", label: "대시보드" },
  { href: "/homes", label: "내 집", matchPrefixes: ["/homes"] },
  {
    href: "/rent",
    label: "납부",
    matchPrefixes: ["/rent", "/maintenance", "/expenses"],
  },
];

export type MobileNavItem = {
  href?: string;
  label: string;
  placeholder?: boolean;
};

export const mobileNavItems: MobileNavItem[] = [
  { href: "/dashboard", label: "홈" },
  { href: "/homes", label: "내 집" },
  { href: "/rent", label: "납부" },
  { label: "더보기", placeholder: true },
];

export function isNavActive(pathname: string, item: NavItem): boolean {
  if (pathname === item.href) {
    return true;
  }

  if (!item.matchPrefixes) {
    return false;
  }

  return item.matchPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isMobileNavActive(
  pathname: string,
  item: MobileNavItem,
): boolean {
  if (!item.href || item.placeholder) {
    return false;
  }

  return isNavActive(pathname, {
    href: item.href,
    label: item.label,
    matchPrefixes:
      item.href === "/homes"
        ? ["/homes"]
        : item.href === "/rent"
          ? ["/rent", "/maintenance", "/expenses"]
          : undefined,
  });
}
