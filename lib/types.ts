// ============================================================================
// VantageFin Pro — Type Definitions
// ============================================================================

export interface Company {
  id: string;
  name: string;
  monthlyBudget: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  companyId: string;
  date: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  isRecurring: boolean;
  recurrence?: 'weekly' | 'monthly' | 'yearly';
  createdAt: string;
  updatedAt: string;
}

export interface Scenario {
  id: string;
  companyId: string;
  name: string;
  description: string;
  variableExpenses: Record<string, number>;
  durationMonths: number;
  createdAt: string;
}

export interface BudgetSummary {
  totalBudget: number;
  totalExpenses: number;
  totalIncome: number;
  remaining: number;
  percentUsed: number;
  categoryBreakdown: CategoryTotal[];
  weeklySpending: WeeklySpend[];
}

export interface CategoryTotal {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  count: number;
}

export interface WeeklySpend {
  week: number;
  label: string;
  amount: number;
  budget: number;
  status: 'under' | 'on-track' | 'over';
}

export interface MonthlyTrend {
  month: string;
  label: string;
  income: number;
  expenses: number;
  net: number;
  isPredicted?: boolean;
}

export interface RunwayProjection {
  month: number;
  label: string;
  projectedBalance: number;
  burnRate: number;
  isRunwayEnd: boolean;
}

export interface WeeklyAlert {
  type: 'success' | 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  weekNumber: number;
  spentAmount: number;
  weeklyBudget: number;
  timestamp: string;
}

export type ViewMode = 'dashboard' | 'transactions' | 'reports' | 'sandbox';

export interface FilterOptions {
  dateFrom: string;
  dateTo: string;
  category: string;
  type: 'all' | 'income' | 'expense';
  searchQuery: string;
}
