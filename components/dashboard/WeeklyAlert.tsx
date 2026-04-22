'use client';
// ============================================================================
// VantageFin Pro — Weekly Alert Notification
// ============================================================================

import { useMemo, useState, useEffect } from 'react';
import { useFinanceStore } from '@/lib/store';
import { generateWeeklyAlert } from '@/lib/finance-engine';
import { formatCurrency } from '@/lib/constants';

export default function WeeklyAlert() {
  const { transactions, company } = useFinanceStore();
  const [visible, setVisible] = useState(true);
  const [animate, setAnimate] = useState(false);

  const alert = useMemo(
    () => generateWeeklyAlert(transactions, company.monthlyBudget),
    [transactions, company.monthlyBudget]
  );

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  const colorMap = {
    success: { bg: 'rgba(34, 197, 94, 0.1)', border: '#22C55E', text: '#4ADE80' },
    info: { bg: 'rgba(59, 130, 246, 0.1)', border: '#3B82F6', text: '#60A5FA' },
    warning: { bg: 'rgba(245, 158, 11, 0.1)', border: '#F59E0B', text: '#FBBF24' },
    danger: { bg: 'rgba(239, 68, 68, 0.1)', border: '#EF4444', text: '#F87171' },
  };

  const colors = colorMap[alert.type];

  return (
    <div
      className={`weekly-alert ${animate ? 'weekly-alert--visible' : ''}`}
      style={{
        backgroundColor: colors.bg,
        borderColor: colors.border,
      }}
    >
      <div className="weekly-alert__content">
        <div className="weekly-alert__header">
          <span className="weekly-alert__title" style={{ color: colors.text }}>
            {alert.title}
          </span>
          <span className="weekly-alert__week">Week {alert.weekNumber}</span>
        </div>
        <p className="weekly-alert__message">{alert.message}</p>
        <div className="weekly-alert__stats">
          <div className="weekly-alert__stat">
            <span className="weekly-alert__stat-label">Spent this week</span>
            <span className="weekly-alert__stat-value" style={{ color: colors.text }}>
              {formatCurrency(alert.spentAmount)}
            </span>
          </div>
          <div className="weekly-alert__stat">
            <span className="weekly-alert__stat-label">Weekly budget</span>
            <span className="weekly-alert__stat-value">
              {formatCurrency(alert.weeklyBudget)}
            </span>
          </div>
        </div>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="weekly-alert__close"
        aria-label="Dismiss alert"
      >
        ×
      </button>
    </div>
  );
}
