"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  addMonths,
  buildYearMonth,
  getYearMonthBounds,
  isCurrentYearMonth,
} from "@/lib/utils/year-month";
import { getYearMonthFromString } from "@/lib/utils/date";

type PaymentPeriodNavigatorProps = {
  yearMonth: string;
};

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => ({
  value: index + 1,
  label: `${index + 1}월`,
}));

function ChevronLeftIcon() {
  return (
    <svg
      className="size-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      className="size-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      className="ui-period-select-chevron"
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

type PeriodSelectProps = {
  id: string;
  value: number;
  onChange: (value: number) => void;
  children: ReactNode;
};

function PeriodSelect({ id, value, onChange, children }: PeriodSelectProps) {
  return (
    <span className="ui-period-select-root">
      <select
        id={id}
        className="ui-period-select"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      >
        {children}
      </select>
      <ChevronDownIcon />
    </span>
  );
}

export function PaymentPeriodNavigator({ yearMonth }: PaymentPeriodNavigatorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { year, month } = getYearMonthFromString(yearMonth);
  const { startYear, endYear } = getYearMonthBounds();
  const yearOptions = Array.from(
    { length: endYear - startYear + 1 },
    (_, index) => startYear + index,
  ).reverse();

  function navigate(nextYearMonth: string) {
    if (isCurrentYearMonth(nextYearMonth)) {
      router.push(pathname);
      return;
    }

    router.push(`${pathname}?month=${nextYearMonth}`);
  }

  return (
    <div className="space-y-2">
      <div className="ui-period-nav">
        <button
          type="button"
          className="ui-period-nav-button"
          aria-label="이전 달"
          onClick={() => navigate(addMonths(yearMonth, -1))}
        >
          <ChevronLeftIcon />
        </button>

        <div className="ui-period-nav-controls">
          <label className="sr-only" htmlFor={`period-year-${yearMonth}`}>
            연도
          </label>
          <PeriodSelect
            id={`period-year-${yearMonth}`}
            value={year}
            onChange={(nextYear) => navigate(buildYearMonth(nextYear, month))}
          >
            {yearOptions.map((optionYear) => (
              <option key={optionYear} value={optionYear}>
                {optionYear}년
              </option>
            ))}
          </PeriodSelect>

          <label className="sr-only" htmlFor={`period-month-${yearMonth}`}>
            월
          </label>
          <PeriodSelect
            id={`period-month-${yearMonth}`}
            value={month}
            onChange={(nextMonth) => navigate(buildYearMonth(year, nextMonth))}
          >
            {MONTH_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </PeriodSelect>
        </div>

        <button
          type="button"
          className="ui-period-nav-button"
          aria-label="다음 달"
          onClick={() => navigate(addMonths(yearMonth, 1))}
        >
          <ChevronRightIcon />
        </button>
      </div>

      {!isCurrentYearMonth(yearMonth) ? (
        <button
          type="button"
          className="ui-period-nav-today"
          onClick={() => router.push(pathname)}
        >
          이번 달로 돌아가기
        </button>
      ) : null}
    </div>
  );
}
