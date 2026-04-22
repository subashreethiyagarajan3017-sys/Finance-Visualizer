'use client';
// ============================================================================
// VantageFin Pro — Report Generator Panel
// ============================================================================

import { useMemo } from 'react';
import { useFinanceStore } from '@/lib/store';
import { calculateBudgetSummary } from '@/lib/finance-engine';
import { generateFinancialReport } from '@/lib/report-engine';
import { formatCurrency } from '@/lib/constants';

export default function ReportGenerator() {
  const { transactions, company, selectedMonth } = useFinanceStore();

  const summary = useMemo(
    () => calculateBudgetSummary(transactions, company.monthlyBudget, selectedMonth.year, selectedMonth.month),
    [transactions, company.monthlyBudget, selectedMonth]
  );

  const monthLabel = new Date(selectedMonth.year, selectedMonth.month).toLocaleDateString('en-US', {
    month: 'long', year: 'numeric',
  });

  const handleGenerate = () => {
    generateFinancialReport(
      company.name, company.monthlyBudget, transactions,
      summary, selectedMonth.year, selectedMonth.month
    );
  };

  const topCategories = summary.categoryBreakdown.slice(0, 5);

  return (
    <div className="report">
      <div className="report__header">
        <div>
          <h2 className="report__title">📄 Financial Report</h2>
          <p className="report__subtitle">Detailed breakdown for {monthLabel}</p>
        </div>
        <button onClick={handleGenerate} className="btn btn--primary btn--lg" id="generate-report-btn">
          <span>📥</span> Generate PDF Report
        </button>
      </div>

      {/* Report Preview */}
      <div className="report__grid">
        {/* Overview Card */}
        <div className="report__card">
          <h3 className="report__card-title">💰 Financial Summary</h3>
          <div className="report__summary-rows">
            <div className="report__row">
              <span>Monthly Budget</span>
              <span className="report__row-value">{formatCurrency(summary.totalBudget)}</span>
            </div>
            <div className="report__row">
              <span>Total Income</span>
              <span className="report__row-value report__row-value--income">{formatCurrency(summary.totalIncome)}</span>
            </div>
            <div className="report__row">
              <span>Total Expenses</span>
              <span className="report__row-value report__row-value--expense">{formatCurrency(summary.totalExpenses)}</span>
            </div>
            <div className="report__row report__row--highlight">
              <span>Net Remaining</span>
              <span className={`report__row-value ${summary.remaining >= 0 ? 'report__row-value--income' : 'report__row-value--expense'}`}>
                {formatCurrency(summary.remaining)}
              </span>
            </div>
            <div className="report__row">
              <span>Budget Utilization</span>
              <span className="report__row-value">{summary.percentUsed.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Top Categories */}
        <div className="report__card">
          <h3 className="report__card-title">📊 Top Spending Categories</h3>
          {topCategories.length === 0 ? (
            <p className="report__empty">No expense data for this month</p>
          ) : (
            <div className="report__categories">
              {topCategories.map((cat) => (
                <div key={cat.category} className="report__category">
                  <div className="report__category-header">
                    <span className="report__category-name">
                      <span className="report__category-dot" style={{ backgroundColor: cat.color }} />
                      {cat.category}
                    </span>
                    <span className="report__category-amount">{formatCurrency(cat.amount)}</span>
                  </div>
                  <div className="report__category-bar-bg">
                    <div className="report__category-bar"
                      style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }} />
                  </div>
                  <div className="report__category-meta">
                    <span>{cat.percentage.toFixed(1)}% of total</span>
                    <span>{cat.count} txn{cat.count !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Weekly Breakdown */}
        <div className="report__card report__card--wide">
          <h3 className="report__card-title">📅 Weekly Spending Breakdown</h3>
          <div className="report__weekly-grid">
            {summary.weeklySpending.map((week) => (
              <div key={week.week} className={`report__weekly-card report__weekly-card--${week.status}`}>
                <span className="report__weekly-label">{week.label}</span>
                <span className="report__weekly-amount">{formatCurrency(week.amount)}</span>
                <span className="report__weekly-budget">of {formatCurrency(week.budget)}</span>
                <span className={`report__weekly-status report__weekly-status--${week.status}`}>
                  {week.status === 'under' ? '✅ Under' : week.status === 'on-track' ? '🔵 On Track' : '🔴 Over'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
