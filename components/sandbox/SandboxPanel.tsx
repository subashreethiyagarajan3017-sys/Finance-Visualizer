'use client';
// ============================================================================
// VantageFin Pro — Sandbox Panel (What-If Controls)
// ============================================================================

import { useState, useMemo } from 'react';
import { useFinanceStore } from '@/lib/store';
import { calculateBudgetSummary, calculateRunwayProjection } from '@/lib/finance-engine';
import { formatCurrency, CHART_COLORS } from '@/lib/constants';
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';

export default function SandboxPanel() {
  const { transactions, company, selectedMonth } = useFinanceStore();

  const summary = useMemo(
    () => calculateBudgetSummary(transactions, company.monthlyBudget, selectedMonth.year, selectedMonth.month),
    [transactions, company.monthlyBudget, selectedMonth]
  );

  // Sandbox sliders
  const [variableExpense, setVariableExpense] = useState(0);
  const [incomeAdjust, setIncomeAdjust] = useState(0);
  const [projMonths, setProjMonths] = useState(6);

  const avgMonthlyIncome = useMemo(() => {
    const months = new Set(transactions.filter(t => t.type === 'income').map(t => {
      const d = new Date(t.date);
      return `${d.getFullYear()}-${d.getMonth()}`;
    }));
    const totalInc = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    return months.size > 0 ? totalInc / months.size : 0;
  }, [transactions]);

  const currentBalance = summary.totalIncome - summary.totalExpenses;

  const projections = useMemo(
    () => calculateRunwayProjection(
      Math.max(currentBalance, 0),
      avgMonthlyIncome + incomeAdjust,
      summary.totalExpenses,
      variableExpense,
      projMonths
    ),
    [currentBalance, avgMonthlyIncome, incomeAdjust, summary.totalExpenses, variableExpense, projMonths]
  );

  const runwayMonth = projections.find(p => p.isRunwayEnd);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip__label">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} style={{ color: entry.color }} className="chart-tooltip__value">
            {entry.name}: {formatCurrency(entry.value || 0)}
          </p>
        ))}
      </div>
    );
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <div className="sandbox">
      <div className="sandbox__intro">
        <h2 className="sandbox__title">🧪 What-If Sandbox</h2>
        <p className="sandbox__desc">
          Adjust the sliders below to simulate different financial scenarios and see how they affect your runway.
        </p>
      </div>

      <div className="sandbox__grid">
        {/* Controls */}
        <div className="sandbox__controls">
          <div className="sandbox__control">
            <label className="sandbox__label">
              Additional Monthly Expenses
              <span className="sandbox__label-value">{formatCurrency(variableExpense)}</span>
            </label>
            <input type="range" min="0" max="10000" step="100" value={variableExpense}
              onChange={(e) => setVariableExpense(Number(e.target.value))}
              className="sandbox__slider sandbox__slider--expense" />
            <div className="sandbox__slider-range">
              <span>$0</span><span>$10,000</span>
            </div>
          </div>

          <div className="sandbox__control">
            <label className="sandbox__label">
              Income Adjustment
              <span className="sandbox__label-value">{formatCurrency(incomeAdjust)}</span>
            </label>
            <input type="range" min="-5000" max="10000" step="100" value={incomeAdjust}
              onChange={(e) => setIncomeAdjust(Number(e.target.value))}
              className="sandbox__slider sandbox__slider--income" />
            <div className="sandbox__slider-range">
              <span>-$5,000</span><span>+$10,000</span>
            </div>
          </div>

          <div className="sandbox__control">
            <label className="sandbox__label">
              Projection Period
              <span className="sandbox__label-value">{projMonths} months</span>
            </label>
            <input type="range" min="3" max="12" step="1" value={projMonths}
              onChange={(e) => setProjMonths(Number(e.target.value))}
              className="sandbox__slider" />
            <div className="sandbox__slider-range">
              <span>3 mo</span><span>12 mo</span>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="sandbox__summary">
            <div className="sandbox__summary-card">
              <span className="sandbox__summary-label">Avg Burn Rate</span>
              <span className="sandbox__summary-value sandbox__summary-value--expense">
                {formatCurrency(projections.length > 0 ? projections[0].burnRate : 0)}/mo
              </span>
            </div>
            <div className="sandbox__summary-card">
              <span className="sandbox__summary-label">Final Balance</span>
              <span className={`sandbox__summary-value ${projections[projections.length - 1]?.projectedBalance >= 0 ? 'sandbox__summary-value--positive' : 'sandbox__summary-value--negative'}`}>
                {formatCurrency(projections[projections.length - 1]?.projectedBalance || 0)}
              </span>
            </div>
            {runwayMonth && (
              <div className="sandbox__summary-card sandbox__summary-card--danger">
                <span className="sandbox__summary-label">⚠️ Runway Ends</span>
                <span className="sandbox__summary-value sandbox__summary-value--negative">
                  Month {runwayMonth.month} ({runwayMonth.label})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Chart */}
        <div className="sandbox__chart">
          <div className="chart-card">
            <div className="chart-card__header">
              <h3 className="chart-card__title">🚀 Runway Projection</h3>
            </div>
            <div className="chart-card__body">
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={projections} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                  <XAxis dataKey="label" stroke={CHART_COLORS.text} fontSize={12} />
                  <YAxis stroke={CHART_COLORS.text} fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={0} stroke={CHART_COLORS.danger} strokeDasharray="4 4" label={{ value: 'Zero', fill: CHART_COLORS.danger, fontSize: 11 }} />
                  <Area type="monotone" dataKey="projectedBalance" name="Balance" stroke={CHART_COLORS.primary} fill="url(#balGrad)" strokeWidth={2} />
                  <Line type="monotone" dataKey="burnRate" name="Burn Rate" stroke={CHART_COLORS.warning} strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
