import type { HTMLAttributes } from "react";

export type CardVariant = "default" | "emphasized" | "brand" | "status" | "muted";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
};

const variantClassName: Record<CardVariant, string> = {
  default: "",
  emphasized: "ui-card-emphasized",
  brand: "ui-card-brand",
  status: "ui-card-status",
  muted: "ui-card-muted",
};

export function Card({
  variant = "default",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={[
        "ui-card",
        variantClassName[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
