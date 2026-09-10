import type { HTMLAttributes } from "react";

export type TagProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "primary";
};

/** 집 속성 라벨 */
export function Tag({
  variant = "default",
  className,
  children,
  ...props
}: TagProps) {
  const classNames =
    variant === "primary"
      ? "ui-primary-home-badge"
      : "ui-label-side";

  return (
    <span className={[classNames, className].filter(Boolean).join(" ")} {...props}>
      {children}
    </span>
  );
}
