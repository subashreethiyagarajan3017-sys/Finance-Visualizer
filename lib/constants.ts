// ============================================================================
// VantageFin Pro — Constants & Configuration
// ============================================================================

export const APP_NAME = 'VantageFin Pro';
export const APP_VERSION = '1.0.0';
export const STORAGE_KEY = 'vantagefin_pro_data';

// ── Expense Categories ──────────────────────────────────────────────────────
export const EXPENSE_CATEGORIES = [
  'Housing',
  'Transportation',
  'Food & Dining',
  'Utilities',
  'Healthcare',
  'Insurance',
  'Entertainment',
  'Shopping',
  'Education',
  'Personal Care',
  'Subscriptions',
  'Savings',
  'Investments',
  'Debt Payments',
  'Gifts & Donations',
  'Travel',
  'Business',
  'Miscellaneous',
] as const;

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Investments',
  'Rental Income',
  'Business Revenue',
  'Side Hustle',
  'Dividends',
  'Other Income',
] as const;

// ── Category Colors (HSL-based for executive dark theme) ─────────────────
export const CATEGORY_COLORS: Record<string, string> = {
  'Housing':          '#6366F1', // Indigo
  'Transportation':   '#8B5CF6', // Violet
  'Food & Dining':    '#F59E0B', // Amber
  'Utilities':        '#10B981', // Emerald
  'Healthcare':       '#EF4444', // Red
  'Insurance':        '#3B82F6', // Blue
  'Entertainment':    '#EC4899', // Pink
  'Shopping':         '#F97316', // Orange
  'Education':        '#14B8A6', // Teal
  'Personal Care':    '#A855F7', // Purple
  'Subscriptions':    '#06B6D4', // Cyan
  'Savings':          '#22C55E', // Green
  'Investments':      '#84CC16', // Lime
  'Debt Payments':    '#DC2626', // Red-darker
  'Gifts & Donations':'#E879F9', // Fuchsia
  'Travel':           '#0EA5E9', // Sky
  'Business':         '#6D28D9', // Violet-dark
  'Miscellaneous':    '#78716C', // Stone
  // Income categories
  'Salary':           '#22D3EE', // Cyan-light
  'Freelance':        '#34D399', // Emerald-light
  'Rental Income':    '#A78BFA', // Violet-light
  'Business Revenue': '#60A5FA', // Blue-light
  'Side Hustle':      '#FBBF24', // Amber-light
  'Dividends':        '#4ADE80', // Green-light
  'Other Income':     '#94A3B8', // Slate
};

// ── Chart Theme ──────────────────────────────────────────────────────────────
export const CHART_COLORS = {
  primary:    '#3B82F6',
  secondary:  '#8B5CF6',
  success:    '#22C55E',
  danger:     '#EF4444',
  warning:    '#F59E0B',
  info:       '#06B6D4',
  grid:       '#1E293B',
  text:       '#94A3B8',
  background: '#0F172A',
  tooltip:    '#1E293B',
  predictive: '#6366F1',
};

// ── Default Budget Categories with suggested allocations ─────────────────
export const DEFAULT_BUDGET_ALLOCATIONS: Record<string, number> = {
  'Housing':          30,
  'Transportation':   15,
  'Food & Dining':    12,
  'Utilities':        5,
  'Healthcare':       5,
  'Insurance':        5,
  'Entertainment':    5,
  'Shopping':         5,
  'Education':        3,
  'Personal Care':    2,
  'Subscriptions':    3,
  'Savings':          10,
};

// ── Currency formatter ───────────────────────────────────────────────────────
export const formatCurrency = (
  amount: number,
  currency: string = 'USD'
): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

// ── Date helpers ─────────────────────────────────────────────────────────────
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const getMonthLabel = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
};

export const getCurrentWeekNumber = (): number => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return Math.ceil((now.getDate() + start.getDay()) / 7);
};

export const getWeeksInMonth = (year: number, month: number): number => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  return Math.ceil((lastDay.getDate() + firstDay.getDay()) / 7);
};
