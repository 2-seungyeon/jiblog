"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { FormField, getFormFieldDescribedById } from "@/components/ui/form-field";
import { fieldClassName, fieldErrorClassName } from "@/components/ui/field-styles";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type SelectProps = {
  name: string;
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
};

function ChevronDownIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={[
        "size-5 shrink-0 text-text-tertiary transition-transform",
        open ? "rotate-180" : "",
      ].join(" ")}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function Select({
  name,
  label,
  error,
  helperText,
  options,
  value,
  defaultValue = "",
  onChange,
  required,
  disabled,
  placeholder = "선택해주세요",
  id,
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const describedBy = getFormFieldDescribedById(selectId, error, helperText);
  const listboxId = `${selectId}-listbox`;
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [activeIndex, setActiveIndex] = useState(-1);

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;
  const selectedOption = options.find((option) => option.value === currentValue);
  const enabledOptions = options.filter((option) => !option.disabled);

  const setValue = useCallback(
    (nextValue: string) => {
      if (!isControlled) {
        setInternalValue(nextValue);
      }
      onChange?.(nextValue);
    },
    [isControlled, onChange],
  );

  function closeListbox() {
    setOpen(false);
    setActiveIndex(-1);
    triggerRef.current?.focus();
  }

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        closeListbox();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function handleSelect(nextValue: string) {
    setValue(nextValue);
    closeListbox();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) {
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!open) {
          setOpen(true);
          setActiveIndex(0);
          return;
        }
        setActiveIndex((prev) =>
          prev >= enabledOptions.length - 1 ? 0 : prev + 1,
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        if (!open) {
          setOpen(true);
          setActiveIndex(enabledOptions.length - 1);
          return;
        }
        setActiveIndex((prev) =>
          prev <= 0 ? enabledOptions.length - 1 : prev - 1,
        );
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (!open) {
          setOpen(true);
          return;
        }
        if (activeIndex >= 0 && enabledOptions[activeIndex]) {
          handleSelect(enabledOptions[activeIndex].value);
        }
        break;
      case "Escape":
        event.preventDefault();
        closeListbox();
        break;
      default:
        break;
    }
  }

  const activeOptionId =
    activeIndex >= 0 && enabledOptions[activeIndex]
      ? `${listboxId}-option-${enabledOptions[activeIndex].value}`
      : undefined;

  return (
    <FormField
      label={label}
      htmlFor={selectId}
      error={error}
      helperText={helperText}
      required={required}
    >
      <input type="hidden" name={name} value={currentValue} required={required && !disabled && !currentValue} />
      <div ref={containerRef} className="relative">
        <button
          ref={triggerRef}
          id={selectId}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-haspopup="listbox"
          aria-activedescendant={open ? activeOptionId : undefined}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          disabled={disabled}
          onClick={() => setOpen((prev) => !prev)}
          onKeyDown={handleKeyDown}
          className={[
            fieldClassName,
            "flex items-center justify-between gap-2 text-left",
            selectedOption ? "text-text-primary" : "text-text-tertiary",
            error ? fieldErrorClassName : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <span className="min-w-0 truncate">
            {selectedOption?.label ?? placeholder}
          </span>
          <ChevronDownIcon open={open} />
        </button>

        {open ? (
          <ul
            id={listboxId}
            role="listbox"
            className="ui-select-listbox"
          >
            {options.map((option) => {
              const enabledIndex = enabledOptions.findIndex(
                (item) => item.value === option.value,
              );
              const isSelected = option.value === currentValue;
              const isActive = enabledIndex === activeIndex;

              return (
                <li
                  key={option.value}
                  id={`${listboxId}-option-${option.value}`}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={option.disabled || undefined}
                  className={[
                    "ui-select-option",
                    isSelected ? "ui-select-option-selected" : "",
                    isActive ? "ui-select-option-active" : "",
                    option.disabled ? "ui-select-option-disabled" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onMouseEnter={() => {
                    if (!option.disabled && enabledIndex >= 0) {
                      setActiveIndex(enabledIndex);
                    }
                  }}
                  onClick={() => {
                    if (!option.disabled) {
                      handleSelect(option.value);
                    }
                  }}
                >
                  {option.label}
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </FormField>
  );
}
