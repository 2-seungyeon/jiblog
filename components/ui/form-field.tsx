import type { ReactNode } from "react";

export type FormFieldProps = {
  label?: string;
  htmlFor?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
};

export function FormField({
  label,
  htmlFor,
  error,
  helperText,
  required,
  children,
  className,
}: FormFieldProps) {
  const helperId = htmlFor ? `${htmlFor}-helper` : undefined;
  const errorId = htmlFor ? `${htmlFor}-error` : undefined;

  return (
    <div className={["ui-form-field", className].filter(Boolean).join(" ")}>
      {label ? (
        <label htmlFor={htmlFor} className="ui-form-label">
          {label}
          {required ? <span className="text-error"> *</span> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <p id={errorId} className="ui-form-error" role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="ui-form-helper">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
