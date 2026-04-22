// ============================================================================
// VantageFin Pro — Finance Engine (All Calculations)
// ============================================================================

import {
  Transaction,
  BudgetSummary,
  CategoryTotal,
  WeeklySpend,
  MonthlyTrend,
  RunwayProjection,
  WeeklyAlert,
} from './types';
import {
  CATEGORY_COLORS,
  getCurrentWeekNumber,
  getWeeksInMonth,
} from './constants';

// ── Budget Summary Calculator ────────────────────────────────────────────────
export function calculateBudgetSummary(
  transactions: Transaction[],
  monthlyBudget: number,
  year: number,
  month: number
): BudgetSummary {
  const monthTransactions = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const totalExpenses = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const remaining = monthlyBudget - totalExpenses;
  const percentUsed = monthlyBudget > 0 ? (totalExpenses / monthlyBudget) * 100 : 0;

  const categoryBreakdown = calculateCategoryBreakdown(
    monthTransactions.filter((t) => t.type === 'expense')
  );

  const weeklySpending = calculateWeeklySpending(
    monthTransactions.filter((t) => t.type === 'expense'),
    monthlyBudget,
    year,
    month
  );

  return {
    totalBudget: monthlyBudget,
    totalExpenses,
    totalIncome,
    remaining,
    percentUsed: Math.min(percentUsed, 100),
    categoryBreakdown,
    weeklySpending,
  };
}

// ── Category Breakdown ───────────────────────────────────────────────────────
export function calculateCategoryBreakdown(
  expenses: Transaction[]
): CategoryTotal[] {
  const totals = new Map<string, { amount: number; count: number }>();

  expenses.forEach((t) => {
    const existing = totals.get(t.category) || { amount: 0, count: 0 };
    totals.set(t.category, {
      amount: existing.amount + t.amount,
      count: existing.count + 1,
    });
  });

  const totalAmount = expenses.reduce((sum, t) => sum + t.amount, 0);

  return Array.from(totals.entries())
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
      color: CATEGORY_COLORS[category] || '#78716C',
      count: data.count,
    }))
    .sort((a, b) => b.amount - a.amount);
}

// ── Weekly Spending Analysis ─────────────────────────────────────────────────
export function calculateWeeklySpending(
  expenses: Transaction[],
  monthlyBudget: number,
  year: number,
  month: number
): WeeklySpend[] {
  const totalWeeks = getWeeksInMonth(year, month);
  const weeklyBudget = monthlyBudget / totalWeeks;
  const weeks: WeeklySpend[] = [];

  for (let w = 1; w <= totalWeeks; w++) {
    const weekStart = new Date(year, month, (w - 1) * 7 + 1);
    const weekEnd = new Date(year, month, w * 7);
    const lastDay = new Date(year, month + 1, 0);
    if (weekEnd > lastDay) weekEnd.setTime(lastDay.getTime());

    const weekExpenses = expenses.filter((t) => {
      const d = new Date(t.date);
      return d >= weekStart && d <= weekEnd;
    });

    const amount = weekExpenses.reduce((sum, t) => sum + t.amount, 0);
    let status: 'under' | 'on-track' | 'over' = 'under';
    if (amount > weeklyBudget * 1.1) status = 'over';
    else if (amount >= weeklyBudget * 0.8) status = 'on-track';

    weeks.push({
      week: w,
      label: `Week ${w}`,
      amount,
      budget: weeklyBudget,
      status,
    });
  }

  return weeks;
}

// ── Monthly Trends (6 months history + 1 predicted) ──────────────────────────
export function calculateMonthlyTrends(
  transactions: Transaction[]
): MonthlyTrend[] {
  const now = new Date();
  const trends: MonthlyTrend[] = [];

  // Last 6 months of actual data
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth();

    const monthTxns = transactions.filter((t) => {
      const td = new Date(t.date);
      return td.getFullYear() === year && td.getMonth() === month;
    });

    const income = monthTxns
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = monthTxns
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    trends.push({
      month: `${year}-${String(month + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      income,
      expenses,
      net: income - expenses,
      isPredicted: false,
    });
  }

  // Predict next month using linear regression
  const predicted = predictNextMonth(trends);
  trends.push(predicted);

  return trends;
}

// ── Simple Linear Regression Predictor ───────────────────────────────────────
function predictNextMonth(trends: MonthlyTrend[]): MonthlyTrend {
  const n = trends.length;
  if (n === 0) {
    const next = new Date();
    next.setMonth(next.getMonth() + 1);
    return {
      month: `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`,
      label: next.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      income: 0,
      expenses: 0,
      net: 0,
      isPredicted: true,
    };
  }

  // Linear regression for expenses
  const xValues = trends.map((_, i) => i);
  const expValues = trends.map((t) => t.expenses);
  const incValues = trends.map((t) => t.income);

  const predictedExpenses = Math.max(0, linearRegPredict(xValues, expValues, n));
  const predictedIncome = Math.max(0, linearRegPredict(xValues, incValues, n));

  const next = new Date();
  next.setMonth(next.getMonth() + 1);

  return {
    month: `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`,
    label: next.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    income: Math.round(predictedIncome),
    expenses: Math.round(predictedExpenses),
    net: Math.round(predictedIncome - predictedExpenses),
    isPredicted: true,
  };
}

function linearRegPredict(x: number[], y: number[], nextX: number): number {
  const n = x.length;
  if (n === 0) return 0;
  if (n === 1) return y[0];

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
  const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);

  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return sumY / n;

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  return slope * nextX + intercept;
}

// ── Runway Projection (Sandbox Mode) ─────────────────────────────────────────
export function calculateRunwayProjection(
  currentBalance: number,
  monthlyIncome: number,
  fixedExpenses: number,
  variableExpenseAdjustment: number,
  months: number = 6
): RunwayProjection[] {
  const projections: RunwayProjection[] = [];
  let balance = currentBalance;

  const baseBurn = fixedExpenses + variableExpenseAdjustment;
  const inflationFactor = 1.02;

  for (let i = 1; i <= months; i++) {
    const adjustedBurn = baseBurn * Math.pow(inflationFactor, i - 1);
    const netCashFlow = monthlyIncome - adjustedBurn;
    balance += netCashFlow;

    const monthDate = new Date();
    monthDate.setMonth(monthDate.getMonth() + i);

    projections.push({
      month: i,
      label: monthDate.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      }),
      projectedBalance: Math.round(balance * 100) / 100,
      burnRate: Math.round(adjustedBurn * 100) / 100,
      isRunwayEnd: balance <= 0,
    });
  }

  return projections;
}

// ── Weekly Alert Generator ───────────────────────────────────────────────────
export function generateWeeklyAlert(
  transactions: Transaction[],
  monthlyBudget: number
): WeeklyAlert {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const weekNum = getCurrentWeekNumber();
  const totalWeeks = getWeeksInMonth(year, month);
  const weeklyBudget = monthlyBudget / totalWeeks;

  // Get this week's spending
  const dayOfWeek = now.getDay();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - dayOfWeek);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const weekExpenses = transactions
    .filter((t) => {
      const d = new Date(t.date);
      return t.type === 'expense' && d >= weekStart && d <= weekEnd;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const percentOfBudget = weeklyBudget > 0 ? (weekExpenses / weeklyBudget) * 100 : 0;

  let type: WeeklyAlert['type'];
  let title: string;
  let message: string;

  if (percentOfBudget < 50) {
    type = 'success';
    title = '🟢 Great Week!';
    message = `You've only spent ${percentOfBudget.toFixed(0)}% of your weekly budget. Keep it up!`;
  } else if (percentOfBudget < 80) {
    type = 'info';
    title = '🔵 On Track';
    message = `You've used ${percentOfBudget.toFixed(0)}% of your weekly budget. Stay mindful of spending.`;
  } else if (percentOfBudget < 100) {
    type = 'warning';
    title = '🟡 Approaching Limit';
    message = `You've used ${percentOfBudget.toFixed(0)}% of your weekly budget. Consider reducing spending.`;
  } else {
    type = 'danger';
    title = '🔴 Over Budget!';
    message = `You've exceeded your weekly budget by ${(percentOfBudget - 100).toFixed(0)}%. Review your expenses.`;
  }

  return {
    type,
    title,
    message,
    weekNumber: weekNum,
    spentAmount: weekExpenses,
    weeklyBudget,
    timestamp: now.toISOString(),
  };
}

// ── Spending Heatmap Data ────────────────────────────────────────────────────
export function generateHeatmapData(
  transactions: Transaction[],
  year: number,
  month: number
): { day: number; amount: number; intensity: number }[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dailySpend = new Map<number, number>();

  transactions
    .filter((t) => {
      const d = new Date(t.date);
      return (
        t.type === 'expense' &&
        d.getFullYear() === year &&
        d.getMonth() === month
      );
    })
    .forEach((t) => {
      const day = new Date(t.date).getDate();
      dailySpend.set(day, (dailySpend.get(day) || 0) + t.amount);
    });

  const maxSpend = Math.max(...Array.from(dailySpend.values()), 1);

  const data = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const amount = dailySpend.get(d) || 0;
    data.push({
      day: d,
      amount,
      intensity: maxSpend > 0 ? amount / maxSpend : 0,
    });
  }

  return data;
}
