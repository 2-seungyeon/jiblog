import type { ExpenseCategory } from "@/lib/types/homes";

export const MAINTENANCE_CATEGORY: ExpenseCategory = "관리비";

export function isMaintenanceCategory(category: ExpenseCategory): boolean {
  return category === MAINTENANCE_CATEGORY;
}

export function splitExpensePayments<
  T extends { category: ExpenseCategory; amount: number },
>(payments: T[]) {
  const maintenance = payments.filter((payment) =>
    isMaintenanceCategory(payment.category),
  );
  const utilities = payments.filter(
    (payment) => !isMaintenanceCategory(payment.category),
  );

  return {
    maintenance,
    utilities,
    maintenanceAmount: maintenance.reduce((sum, p) => sum + p.amount, 0),
    utilityAmount: utilities.reduce((sum, p) => sum + p.amount, 0),
  };
}
