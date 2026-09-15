"use client";

import { useId, useState, type ChangeEvent } from "react";
import { FormField, getFormFieldDescribedById } from "@/components/ui/form-field";
import { fieldErrorClassName, moneyInputFieldClassName } from "@/components/ui/field-styles";
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
  onRawValueChange?: (rawValue: string) => void;
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
  onRawValueChange,
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
    onRawValueChange?.(digits);
  }

  return (
    <FormField
      label={label}
      htmlFor={inputId}
      error={error}
      helperText={helperText}
      required={required}
    >
      <div className={["relative", disabled ? "opacity-40" : ""].filter(Boolean).join(" ")}>
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
            moneyInputFieldClassName,
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
