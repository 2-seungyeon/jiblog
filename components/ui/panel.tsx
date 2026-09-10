import type { HTMLAttributes } from "react";

export type PanelProps = HTMLAttributes<HTMLElement> & {
  as?: "section" | "div" | "article";
  compact?: boolean;
};

/** 의미 있는 정보 그룹을 담는 Surface */
export function Panel({
  as: Tag = "section",
  compact = false,
  className,
  children,
  ...props
}: PanelProps) {
  return (
    <Tag
      className={[compact ? "ui-panel-compact" : "ui-panel", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </Tag>
  );
}
