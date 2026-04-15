export interface User {
  id: string;
  email: string;
  username: string;
  monthlyIncome: number;
  emailNotifications: boolean;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string | null;
  isCustom: boolean;
  createdByUserId: string | null;
  createdAt: string;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  date: string;
  receiptPath: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  categoryId: string;
  category: Category;
}

export interface Budget {
  id: string;
  limit: number;
  spent: number;
  month: number;
  year: number;
  alertSent80: boolean;
  alertSent100: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  categoryId: string;
  category: Category;
}

export interface BudgetSummary extends Budget {
  percentage: string;
  remaining: string;
  status: string;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    lastpage: number;
    limit: number;
  };
}

export interface DashboardStats {
  currentMonth: {
    totalSpent: number;
    totalBudget: number;
    budgetUtilization: string | number;
    expenseCount: number;
    averageExpense: number;
  };
  categoryBreakdown: CategoryBreakdown[];
  topExpenses: Expense[];
}

export interface CategoryBreakdown {
  categoryName: string;
  categoryIcon: string;
  categoryId: string;
  totalSpent: string;
  expenseCount: string;
}

export interface SpendingTrend {
  month: string;
  totalSpent: number;
}

export interface FilterExpenseParams {
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateExpenseDto {
  amount: number;
  description: string;
  categoryId: string;
  date: string;
}

export interface UpdateExpenseDto {
  amount?: number;
  description?: string;
  categoryId?: string;
  date?: string;
}

export interface CreateCategoryDto {
  name: string;
  icon?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  icon?: string;
}

export interface CreateBudgetDto {
  categoryId: string;
  limit: number;
  month: number;
  year: number;
}

export interface UpdateBudgetDto {
  limit?: number;
}

export interface SignUpDto {
  email: string;
  username: string;
  password: string;
  monthlyIncome?: number;
  emailNotifications?: boolean;
}

export interface SignInDto {
  email: string;
  password: string;
}

export interface UpdateProfileDto {
  username?: string;
  monthlyIncome?: number;
  emailNotifications?: boolean;
}

export interface AuthResponse {
  accessToken: string;
}
