"use client";

import { useEffect, useId, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import { ko } from "date-fns/locale";

import { FormField } from "@/components/ui/form-field";
import { fieldClassName, fieldErrorClassName } from "@/components/ui/field-styles";
import { getKSTToday } from "@/lib/utils/date";
import {
  formatDateDisplay,
  isoDateToLocalDate,
  localDateToIsoDate,
} from "@/lib/utils/date-input";

export type DateInputProps = {
  name: string;
  label?: string;
  error?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

function CalendarIcon() {
  return (
    <svg
      className="size-5 shrink-0 text-text-tertiary"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 3v2M16 3v2M4.5 9h15M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
      />
    </svg>
  );
}

export function DateInput({
  name,
  label,
  error,
  defaultValue = "",
  placeholder = "날짜를 선택해주세요",
  required,
  disabled,
  className,
}: DateInputProps) {
  const generatedId = useId();
  const inputId = `${generatedId}-date`;
  const containerRef = useRef<HTMLDivElement>(null);
  const [isoValue, setIsoValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(
    () => isoDateToLocalDate(defaultValue) ?? getKSTToday(),
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    if (!open) {
      return;
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const selected = isoDateToLocalDate(isoValue);
  const displayValue = isoValue ? formatDateDisplay(isoValue) : "";

  function handleSelect(date: Date | undefined) {
    if (!date) {
      return;
    }

    setIsoValue(localDateToIsoDate(date));
    setMonth(date);
    setOpen(false);
  }

  return (
    <FormField
      label={label}
      htmlFor={inputId}
      error={error}
      required={required}
    >
      <input
        type="hidden"
        name={name}
        value={isoValue}
        required={required && !disabled}
      />
      <div ref={containerRef} className="relative">
        <button
          id={inputId}
          type="button"
          disabled={disabled}
          aria-expanded={open}
          aria-haspopup="dialog"
          onClick={() => setOpen((prev) => !prev)}
          className={[
            fieldClassName,
            "flex items-center gap-3 text-left",
            displayValue ? "text-text-primary" : "text-text-tertiary",
            error ? fieldErrorClassName : "",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <CalendarIcon />
          <span className="flex-1">{displayValue || placeholder}</span>
        </button>
        {open ? (
          <div className="absolute top-[calc(100%+4px)] left-0 z-30 w-[min(100%,320px)] rounded-lg border border-border-default bg-surface p-3 shadow-md">
            <DayPicker
              mode="single"
              className="jiblog-day-picker"
              locale={ko}
              month={month}
              onMonthChange={setMonth}
              selected={selected}
              onSelect={handleSelect}
              today={getKSTToday()}
              showOutsideDays
              navLayout="around"
              fixedWeeks
            />
          </div>
        ) : null}
      </div>
    </FormField>
  );
}
