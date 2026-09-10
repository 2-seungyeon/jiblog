import type { ReactNode } from "react";

export type FormSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <section className={["ui-form-section", className].filter(Boolean).join(" ")}>
      <div className="space-y-1">
        <h2 className="ui-section-title">{title}</h2>
        {description ? <p className="ui-metadata">{description}</p> : null}
      </div>
      <div className="ui-form-stack">{children}</div>
    </section>
  );
}
