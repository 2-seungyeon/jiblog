import type { InputHTMLAttributes, ReactNode } from "react";

export type CheckboxFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  label: ReactNode;
  helperText?: ReactNode;
};

export function CheckboxField({
  label,
  helperText,
  className,
  ...props
}: CheckboxFieldProps) {
  return (
    <label
      className={["ui-checkbox-field", className].filter(Boolean).join(" ")}
    >
      <span className="ui-checkbox-field-label">
        <input
          type="checkbox"
          className="size-4 rounded-sm border-border-default text-primary-600 focus:ring-primary-600 disabled:cursor-not-allowed disabled:opacity-70"
          {...props}
        />
        {label}
      </span>
      {helperText ? (
        <span className="ui-checkbox-field-helper">{helperText}</span>
      ) : null}
    </label>
  );
}
