import type { HTMLAttributes } from "react";

export type BadgeVariant =
  | "success"
  | "warning"
  | "warning-strong"
  | "info"
  | "pending"
  | "muted";

const variantClassName: Record<BadgeVariant, string> = {
  success: "ui-badge-success",
  warning: "ui-badge-warning",
  "warning-strong": "ui-badge-warning-strong",
  info: "ui-badge-info",
  pending: "ui-badge-info",
  muted: "ui-badge-muted",
};

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({
  variant = "muted",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={[variantClassName[variant], className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </span>
  );
}
