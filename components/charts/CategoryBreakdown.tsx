'use client';
// ============================================================================
// VantageFin Pro — Category Breakdown Pie Chart
// ============================================================================

import { useMemo } from 'react';
import { useFinanceStore } from '@/lib/store';
import { calculateBudgetSummary } from '@/lib/finance-engine';
import { formatCurrency, CHART_COLORS } from '@/lib/constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function CategoryBreakdown() {
  const { transactions, company, selectedMonth } = useFinanceStore();

  const summary = useMemo(
    () => calculateBudgetSummary(transactions, company.monthlyBudget, selectedMonth.year, selectedMonth.month),
    [transactions, company.monthlyBudget, selectedMonth]
  );

  const data = summary.categoryBreakdown.slice(0, 8);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload[0]) return null;
    const d = payload[0].payload;
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip__label">{d.category}</p>
        <p className="chart-tooltip__value" style={{ color: d.color }}>
          {formatCurrency(d.amount)} ({d.percentage.toFixed(1)}%)
        </p>
        <p className="chart-tooltip__sub">{d.count} transaction{d.count !== 1 ? 's' : ''}</p>
      </div>
    );
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <h3 className="chart-card__title">🍩 Spending by Category</h3>
      </div>
      <div className="chart-card__body chart-card__body--pie">
        {data.length === 0 ? (
          <div className="chart-card__empty">
            <p>No expense data yet</p>
            <p className="chart-card__empty-sub">Add transactions to see breakdown</p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={95}
                  paddingAngle={3} dataKey="amount" nameKey="category"
                  stroke={CHART_COLORS.background} strokeWidth={2}>
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="category-legend">
              {data.map((cat) => (
                <div key={cat.category} className="category-legend__item">
                  <span className="category-legend__dot" style={{ backgroundColor: cat.color }} />
                  <span className="category-legend__name">{cat.category}</span>
                  <span className="category-legend__value">{formatCurrency(cat.amount)}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
