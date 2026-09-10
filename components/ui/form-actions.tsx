import type { ReactNode } from "react";

export type FormActionsProps = {
  children: ReactNode;
  className?: string;
};

export function FormActions({ children, className }: FormActionsProps) {
  return (
    <div className={["ui-form-actions", className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}
