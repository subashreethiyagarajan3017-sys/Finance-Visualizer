'use client';
// ============================================================================
// VantageFin Pro — Cash Flow Trend Chart (with Predictive Dotted Line)
// ============================================================================

import { useMemo } from 'react';
import { useFinanceStore } from '@/lib/store';
import { calculateMonthlyTrends } from '@/lib/finance-engine';
import { formatCurrency, CHART_COLORS } from '@/lib/constants';
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts';

export default function CashFlowTrend() {
  const { transactions } = useFinanceStore();
  const trends = useMemo(() => calculateMonthlyTrends(transactions), [transactions]);

  const actualData = trends.map((t) => ({
    ...t,
    actualIncome: t.isPredicted ? undefined : t.income,
    actualExpenses: t.isPredicted ? undefined : t.expenses,
    actualNet: t.isPredicted ? undefined : t.net,
    predictedIncome: t.isPredicted ? t.income : undefined,
    predictedExpenses: t.isPredicted ? t.expenses : undefined,
    predictedNet: t.isPredicted ? t.net : undefined,
  }));

  // Connect predicted line to last actual point
  if (actualData.length >= 2) {
    const lastActual = trends[trends.length - 2];
    const predIdx = actualData.length - 1;
    if (lastActual && actualData[predIdx]) {
      // Also set predicted values on last actual point for line continuity
      actualData[predIdx - 1] = {
        ...actualData[predIdx - 1],
        predictedIncome: lastActual.income,
        predictedExpenses: lastActual.expenses,
        predictedNet: lastActual.net,
      };
    }
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    const isPred = payload[0]?.payload?.isPredicted;
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip__label">{label} {isPred ? '(Predicted)' : ''}</p>
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
    <div className="chart-card">
      <div className="chart-card__header">
        <h3 className="chart-card__title">📈 Cash Flow Trend</h3>
        <div className="chart-card__legend-custom">
          <span className="chart-card__legend-item">
            <span className="chart-card__legend-dot" style={{ backgroundColor: CHART_COLORS.success }} />
            Income
          </span>
          <span className="chart-card__legend-item">
            <span className="chart-card__legend-dot" style={{ backgroundColor: CHART_COLORS.danger }} />
            Expenses
          </span>
          <span className="chart-card__legend-item">
            <span className="chart-card__legend-line" />
            Predicted
          </span>
        </div>
      </div>
      <div className="chart-card__body">
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={actualData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.danger} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CHART_COLORS.danger} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
            <XAxis dataKey="label" stroke={CHART_COLORS.text} fontSize={12} />
            <YAxis stroke={CHART_COLORS.text} fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <ReferenceLine y={0} stroke={CHART_COLORS.text} strokeDasharray="3 3" />
            {/* Actual data areas */}
            <Area type="monotone" dataKey="actualIncome" name="Income" stroke={CHART_COLORS.success} fill="url(#incomeGrad)" strokeWidth={2} connectNulls={false} />
            <Area type="monotone" dataKey="actualExpenses" name="Expenses" stroke={CHART_COLORS.danger} fill="url(#expenseGrad)" strokeWidth={2} connectNulls={false} />
            {/* Predicted lines (dashed) */}
            <Line type="monotone" dataKey="predictedIncome" name="Predicted Income" stroke={CHART_COLORS.success} strokeWidth={2} strokeDasharray="8 4" dot={{ r: 4, fill: CHART_COLORS.success, strokeWidth: 2 }} connectNulls={false} />
            <Line type="monotone" dataKey="predictedExpenses" name="Predicted Expenses" stroke={CHART_COLORS.danger} strokeWidth={2} strokeDasharray="8 4" dot={{ r: 4, fill: CHART_COLORS.danger, strokeWidth: 2 }} connectNulls={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
