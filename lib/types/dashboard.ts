export type DashboardState = "no-home" | "no-contract" | "ready";

export type PrimaryHome = {
  id: string;
  nickname: string;
  address: string;
  isPrimary: boolean;
};

export type Contract = {
  type: string;
  startDate: string;
  endDate: string;
  dDay: number;
  deposit: number;
  monthlyRent: number;
  maintenanceFee: number;
  status: string;
};

export type MonthlySummary = {
  yearMonth: string;
  total: number;
  rentAmount: number;
  maintenanceAmount: number;
  utilityExpenseAmount: number;
  expenseCount: number;
  rentStatus: string;
  paymentSummary: {
    scheduledAmount: number;
    completedAmount: number;
    scheduledCount: number;
    completedCount: number;
  };
};

export type UpcomingPayment = {
  type: string;
  amount: number;
  dueDate: string;
  relativeDate: string;
  status: string;
  homeNickname: string;
};

export type DashboardData = {
  userName: string;
  state: DashboardState;
  primaryHome: PrimaryHome | null;
  contract: Contract | null;
  monthlySummary: MonthlySummary | null;
  upcomingPayments: UpcomingPayment[];
};
