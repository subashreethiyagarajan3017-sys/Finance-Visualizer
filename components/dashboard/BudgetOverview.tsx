'use client';
// ============================================================================
// VantageFin Pro — Budget Overview Card
// ============================================================================

import { useMemo } from 'react';
import { useFinanceStore } from '@/lib/store';
import { calculateBudgetSummary } from '@/lib/finance-engine';
import { formatCurrency } from '@/lib/constants';

export default function BudgetOverview() {
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

  const gaugePercent = Math.min(summary.percentUsed, 100);
  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (gaugePercent / 100) * circumference;

  const gaugeColor =
    gaugePercent > 90
      ? '#EF4444'
      : gaugePercent > 70
      ? '#F59E0B'
      : gaugePercent > 50
      ? '#3B82F6'
      : '#22C55E';

  return (
    <div className="budget-overview">
      <div className="budget-overview__header">
        <h3 className="budget-overview__title">Budget Overview</h3>
        <span className="budget-overview__period">
          {new Date(selectedMonth.year, selectedMonth.month).toLocaleDateString(
            'en-US',
            { month: 'long', year: 'numeric' }
          )}
        </span>
      </div>

      <div className="budget-overview__content">
        {/* Circular Gauge */}
        <div className="budget-overview__gauge">
          <svg viewBox="0 0 160 160" className="budget-overview__gauge-svg">
            {/* Background ring */}
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="#1E293B"
              strokeWidth="12"
            />
            {/* Progress ring */}
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke={gaugeColor}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 80 80)"
              className="budget-overview__gauge-progress"
            />
            {/* Center text */}
            <text
              x="80"
              y="72"
              textAnchor="middle"
              className="budget-overview__gauge-percent"
              fill={gaugeColor}
            >
              {gaugePercent.toFixed(0)}%
            </text>
            <text
              x="80"
              y="95"
              textAnchor="middle"
              className="budget-overview__gauge-label"
              fill="#94A3B8"
            >
              used
            </text>
          </svg>
        </div>

        {/* Budget Details */}
        <div className="budget-overview__details">
          <div className="budget-overview__detail-row">
            <span className="budget-overview__detail-label">Budget</span>
            <span className="budget-overview__detail-value">
              {formatCurrency(summary.totalBudget)}
            </span>
          </div>
          <div className="budget-overview__detail-row">
            <span className="budget-overview__detail-label">Spent</span>
            <span className="budget-overview__detail-value budget-overview__detail-value--expense">
              {formatCurrency(summary.totalExpenses)}
            </span>
          </div>
          <div className="budget-overview__detail-row budget-overview__detail-row--highlight">
            <span className="budget-overview__detail-label">Remaining</span>
            <span
              className={`budget-overview__detail-value ${
                summary.remaining >= 0
                  ? 'budget-overview__detail-value--positive'
                  : 'budget-overview__detail-value--negative'
              }`}
            >
              {formatCurrency(summary.remaining)}
            </span>
          </div>
        </div>
      </div>

      {/* Weekly breakdown */}
      <div className="budget-overview__weekly">
        <h4 className="budget-overview__weekly-title">Weekly Pace</h4>
        <div className="budget-overview__weekly-bars">
          {summary.weeklySpending.map((week) => (
            <div key={week.week} className="budget-overview__week">
              <div className="budget-overview__week-bar-container">
                <div
                  className={`budget-overview__week-bar budget-overview__week-bar--${week.status}`}
                  style={{
                    height: `${Math.min(
                      (week.amount / (week.budget || 1)) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
              <span className="budget-overview__week-label">{week.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
