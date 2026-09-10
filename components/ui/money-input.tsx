"use client";

import { useId, useState, type ChangeEvent } from "react";
import { FormField, getFormFieldDescribedById } from "@/components/ui/form-field";
import { fieldClassName, fieldErrorClassName } from "@/components/ui/field-styles";
import { formatAmountInput, parseAmountInput } from "@/lib/utils/format";

export type MoneyInputProps = {
  name: string;
  label?: string;
  error?: string;
  helperText?: string;
  defaultValue?: string | number;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

export function MoneyInput({
  name,
  label,
  error,
  helperText,
  defaultValue,
  placeholder = "0",
  required,
  disabled,
  className,
}: MoneyInputProps) {
  const generatedId = useId();
  const inputId = `${generatedId}-money`;
  const describedBy = getFormFieldDescribedById(inputId, error, helperText);
  const [displayValue, setDisplayValue] = useState(() =>
    formatAmountInput(defaultValue),
  );
  const rawValue = parseAmountInput(displayValue);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const digits = parseAmountInput(event.target.value);
    setDisplayValue(digits ? formatAmountInput(digits) : "");
  }

  return (
    <FormField
      label={label}
      htmlFor={inputId}
      error={error}
      helperText={helperText}
      required={required}
    >
      <div className="relative">
        <input type="hidden" name={name} value={rawValue} />
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required && !disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={[
            fieldClassName,
            "pr-10",
            "placeholder:text-text-tertiary",
            error ? fieldErrorClassName : "",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-text-tertiary"
        >
          원
        </span>
      </div>
    </FormField>
  );
}
