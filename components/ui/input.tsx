"use client";

import { useId, type InputHTMLAttributes } from "react";
import { FormField, getFormFieldDescribedById } from "@/components/ui/form-field";
import { fieldClassName, fieldErrorClassName } from "@/components/ui/field-styles";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  id,
  disabled,
  className,
  required,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const describedBy = getFormFieldDescribedById(inputId, error, helperText);

  return (
    <FormField
      label={label}
      htmlFor={inputId}
      error={error}
      helperText={helperText}
      required={required}
    >
      <input
        id={inputId}
        disabled={disabled}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={[
          fieldClassName,
          "placeholder:text-text-tertiary",
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
