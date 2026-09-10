export type ResidenceStatus = "거주 중" | "이사 예정" | "과거 거주";

export const RESIDENCE_STATUS_OPTIONS: ResidenceStatus[] = [
  "거주 중",
  "이사 예정",
  "과거 거주",
];

export type ContractType = "월세" | "전세" | "반전세";

export const CONTRACT_TYPE_OPTIONS: ContractType[] = [
  "월세",
  "전세",
  "반전세",
];

export type HomeContractSummary =
  | {
      hasContract: true;
      type: ContractType;
      endDate: string;
    }
  | {
      hasContract: false;
    };

export type HomeListItem = {
  id: string;
  nickname: string;
  address: string;
  detailAddress?: string;
  isPrimary: boolean;
  residenceStatus: ResidenceStatus;
  contract: HomeContractSummary;
};

export type HomeContractDetail = {
  type: ContractType;
  startDate: string;
  endDate: string;
  deposit: number;
  monthlyRent: number;
  maintenanceFee: number;
  status: string;
};

export type HomePaymentSnapshot = {
  yearMonth: string;
  rentAmount: number;
  rentStatus: string;
  maintenanceAmount: number;
  utilityExpenseAmount: number;
  expenseCount: number;
};

export type HomeDetail = HomeListItem & {
  moveInDate?: string;
  detailAddress?: string;
  memo?: string;
  contractDetail: HomeContractDetail | null;
  paymentSnapshot: HomePaymentSnapshot | null;
};

export type CreateHomeInput = {
  nickname: string;
  address: string;
  detailAddress?: string;
  residenceStatus: ResidenceStatus;
  moveInDate?: string;
  isPrimary: boolean;
  memo?: string;
};

export type CreateHomeFieldErrors = {
  nickname?: string;
  address?: string;
};

export type CreateHomeResult =
  | { success: true; id: string }
  | { success: false; errors: CreateHomeFieldErrors };

export type UpdateHomeInput = CreateHomeInput;

export type UpdateHomeFieldErrors = CreateHomeFieldErrors;

export type UpdateHomeResult =
  | { success: true; homeId: string }
  | { success: false; errors: UpdateHomeFieldErrors };

export type HomeDeleteCheck = {
  canDelete: boolean;
  message: string;
};

export type DeleteHomeResult =
  | { success: true }
  | { success: false; message: string };

export type CreateContractInput = {
  type: ContractType;
  startDate: string;
  endDate: string;
  deposit: number;
  monthlyRent: number;
  maintenanceFee: number;
};

export type CreateContractFieldErrors = {
  type?: string;
  startDate?: string;
  endDate?: string;
  deposit?: string;
  monthlyRent?: string;
  maintenanceFee?: string;
};

export type CreateContractResult =
  | { success: true; homeId: string }
  | { success: false; errors: CreateContractFieldErrors };

export type UpdateContractInput = CreateContractInput;

export type UpdateContractFieldErrors = CreateContractFieldErrors;

export type UpdateContractResult = CreateContractResult;

export type RentPaymentStatus = "예정" | "완료";

export type RentPayment = {
  id: string;
  homeId: string;
  yearMonth: string;
  amount: number;
  dueDay: number;
  status: RentPaymentStatus;
  completedAt: string | null;
};

export type RentPaymentListItem = RentPayment & {
  homeNickname: string;
  contractType: ContractType;
};

export type RentPageData = {
  yearMonthLabel: string;
  totalAmount: number;
  summaryStatus: "납부 예정" | "납부 완료";
  payments: RentPaymentListItem[];
};

export type CompleteRentPaymentResult =
  | { success: true }
  | { success: false; message: string };

export type ExpenseCategory =
  | "관리비"
  | "전기"
  | "가스"
  | "수도"
  | "인터넷"
  | "기타";

export const EXPENSE_CATEGORY_OPTIONS: ExpenseCategory[] = [
  "관리비",
  "전기",
  "가스",
  "수도",
  "인터넷",
  "기타",
];

export type ExpensePaymentStatus = "예정" | "완료";

export type ExpensePayment = {
  id: string;
  homeId: string;
  yearMonth: string;
  category: ExpenseCategory;
  amount: number;
  dueDay: number;
  status: ExpensePaymentStatus;
  completedAt: string | null;
};

export type ExpensePaymentListItem = ExpensePayment & {
  homeNickname: string;
};

export type ExpensesPageData = {
  yearMonthLabel: string;
  totalAmount: number;
  summaryStatus: "납부 예정" | "납부 완료";
  payments: ExpensePaymentListItem[];
};

export type CompleteExpensePaymentResult =
  | { success: true }
  | { success: false; message: string };

export type ExpenseEligibleHome = {
  id: string;
  nickname: string;
};

export type CreateExpenseInput = {
  homeId: string;
  category: ExpenseCategory;
  amount: number;
  dueDay: number;
};

export type CreateExpenseFieldErrors = {
  homeId?: string;
  category?: string;
  amount?: string;
  dueDay?: string;
};

export type CreateExpenseResult =
  | { success: true }
  | { success: false; errors: CreateExpenseFieldErrors };
