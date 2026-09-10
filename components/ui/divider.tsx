import type { HTMLAttributes } from "react";

export type DividerProps = HTMLAttributes<HTMLHRElement>;

export function Divider({ className, ...props }: DividerProps) {
  return <hr className={["ui-divider", className].filter(Boolean).join(" ")} {...props} />;
}
