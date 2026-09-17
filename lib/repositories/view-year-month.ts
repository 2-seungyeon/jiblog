import "server-only";

import { ensureCurrentMonthRentPayments } from "@/lib/repositories/ensure-current-month-rent";
import {
  formatYearMonthLabel,
  isCurrentYearMonth,
  parseYearMonthParam,
} from "@/lib/utils/year-month";

export type ViewYearMonth = {
  yearMonth: string;
  yearMonthLabel: string;
  isCurrentMonth: boolean;
};

export async function resolveViewYearMonth(
  userId: string,
  param?: string | null,
): Promise<ViewYearMonth> {
  const yearMonth = parseYearMonthParam(param);
  const isCurrentMonth = isCurrentYearMonth(yearMonth);

  if (isCurrentMonth) {
    await ensureCurrentMonthRentPayments(userId);
  }

  return {
    yearMonth,
    yearMonthLabel: formatYearMonthLabel(yearMonth),
    isCurrentMonth,
  };
}
