import Link from "next/link";
import { AppLogoIcon } from "@/components/layout/app-logo-icon";

type AppBrandProps = {
  href?: string;
  showTagline?: boolean;
  size?: "sm" | "md";
  className?: string;
};

const sizeStyles = {
  sm: {
    logo: 24,
    title: "text-base",
    tagline: "text-xs",
    gap: "gap-2",
  },
  md: {
    logo: 28,
    title: "text-lg",
    tagline: "text-sm",
    gap: "gap-2.5",
  },
} as const;

export function AppBrand({
  href = "/dashboard",
  showTagline = false,
  size = "md",
  className,
}: AppBrandProps) {
  const styles = sizeStyles[size];

  const content = (
    <span
      className={[
        "inline-flex min-w-0 items-center",
        showTagline ? "flex-col items-start gap-0.5" : styles.gap,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className={["inline-flex min-w-0 items-center", styles.gap].join(" ")}>
        <AppLogoIcon size={styles.logo} />
        <span className={[styles.title, "font-bold text-text-primary"].join(" ")}>
          집로그
        </span>
      </span>
      {showTagline ? (
        <span className={[styles.tagline, "text-text-secondary"].join(" ")}>
          1인 가구 주거비 관리
        </span>
      ) : null}
    </span>
  );

  if (!href) {
    return content;
  }

  return (
    <Link
      href={href}
      className="inline-flex rounded-md no-underline transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
    >
      {content}
    </Link>
  );
}
