"use client";

import { useId, type TextareaHTMLAttributes } from "react";
import { FormField } from "@/components/ui/form-field";
import { fieldErrorClassName, textareaClassName } from "@/components/ui/field-styles";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  helperText?: string;
};

export function Textarea({
  label,
  error,
  helperText,
  id,
  disabled,
  className,
  required,
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;

  return (
    <FormField
      label={label}
      htmlFor={textareaId}
      error={error}
      helperText={helperText}
      required={required}
    >
      <textarea
        id={textareaId}
        disabled={disabled}
        required={required}
        aria-invalid={error ? true : undefined}
        className={[
          textareaClassName,
          error ? fieldErrorClassName : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
    </FormField>
  );
}
