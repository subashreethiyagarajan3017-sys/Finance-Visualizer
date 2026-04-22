'use client';
// ============================================================================
// VantageFin Pro — Quick Stats Cards
// ============================================================================

import { useMemo } from 'react';
import { useFinanceStore } from '@/lib/store';
import { calculateBudgetSummary } from '@/lib/finance-engine';
import { formatCurrency } from '@/lib/constants';

export default function QuickStats() {
  const { transactions, company, selectedMonth } = useFinanceStore();

  const summary = useMemo(
    () =>
      calculateBudgetSummary(
        transactions,
        company.monthlyBudget,
        selectedMonth.year,
        selectedMonth.month
      ),
    [transactions, company.monthlyBudget, selectedMonth]
  );

  const stats = [
    {
      label: 'Total Budget',
      value: formatCurrency(summary.totalBudget),
      icon: '🎯',
      color: 'blue',
      subtext: 'Monthly allocation',
    },
    {
      label: 'Total Income',
      value: formatCurrency(summary.totalIncome),
      icon: '📈',
      color: 'green',
      subtext: `${transactions.filter((t) => t.type === 'income').length} sources`,
    },
    {
      label: 'Total Expenses',
      value: formatCurrency(summary.totalExpenses),
      icon: '💸',
      color: 'red',
      subtext: `${summary.percentUsed.toFixed(1)}% of budget`,
    },
    {
      label: 'Remaining',
      value: formatCurrency(summary.remaining),
      icon: summary.remaining >= 0 ? '✅' : '⚠️',
      color: summary.remaining >= 0 ? 'emerald' : 'orange',
      subtext: summary.remaining >= 0 ? 'Under budget' : 'Over budget',
    },
  ];

  return (
    <div className="quick-stats">
      {stats.map((stat) => (
        <div key={stat.label} className={`stat-card stat-card--${stat.color}`}>
          <div className="stat-card__header">
            <span className="stat-card__icon">{stat.icon}</span>
            <span className="stat-card__label">{stat.label}</span>
          </div>
          <div className="stat-card__value">{stat.value}</div>
          <div className="stat-card__subtext">{stat.subtext}</div>
          {/* Progress bar for expenses */}
          {stat.label === 'Total Expenses' && (
            <div className="stat-card__progress">
              <div
                className="stat-card__progress-bar"
                style={{
                  width: `${Math.min(summary.percentUsed, 100)}%`,
                  backgroundColor:
                    summary.percentUsed > 90
                      ? '#EF4444'
                      : summary.percentUsed > 70
                      ? '#F59E0B'
                      : '#22C55E',
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
