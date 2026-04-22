'use client';
// ============================================================================
// VantageFin Pro — TopBar with Alerts & Month Selector
// ============================================================================

import { useMemo } from 'react';
import { useFinanceStore } from '@/lib/store';
import { generateWeeklyAlert } from '@/lib/finance-engine';
import { formatCurrency, getMonthLabel } from '@/lib/constants';

export default function TopBar() {
  const {
    company,
    transactions,
    selectedMonth,
    setSelectedMonth,
    setShowTransactionForm,
    currentView,
  } = useFinanceStore();

  const alert = useMemo(
    () => generateWeeklyAlert(transactions, company.monthlyBudget),
    [transactions, company.monthlyBudget]
  );

  const handlePrevMonth = () => {
    let { year, month } = selectedMonth;
    month -= 1;
    if (month < 0) {
      month = 11;
      year -= 1;
    }
    setSelectedMonth(year, month);
  };

  const handleNextMonth = () => {
    let { year, month } = selectedMonth;
    month += 1;
    if (month > 11) {
      month = 0;
      year += 1;
    }
    setSelectedMonth(year, month);
  };

  const viewTitles: Record<string, string> = {
    dashboard: 'Dashboard',
    transactions: 'Transactions',
    reports: 'Reports & Analytics',
    sandbox: 'What-If Sandbox',
  };

  return (
    <header className="topbar">
      <div className="topbar__left">
        <h1 className="topbar__title">{viewTitles[currentView]}</h1>
        <div className="topbar__month-selector">
          <button onClick={handlePrevMonth} className="topbar__month-btn" aria-label="Previous month">
            ‹
          </button>
          <span className="topbar__month-label">
            {getMonthLabel(
              new Date(selectedMonth.year, selectedMonth.month, 1)
            )}
          </span>
          <button onClick={handleNextMonth} className="topbar__month-btn" aria-label="Next month">
            ›
          </button>
        </div>
      </div>

      <div className="topbar__right">
        {/* Weekly Alert Badge */}
        <div className={`topbar__alert topbar__alert--${alert.type}`}>
          <span className="topbar__alert-title">{alert.title}</span>
          <span className="topbar__alert-amount">
            {formatCurrency(alert.spentAmount)} / {formatCurrency(alert.weeklyBudget)}
          </span>
        </div>

        {/* Add Transaction Button */}
        <button
          onClick={() => setShowTransactionForm(true)}
          className="topbar__add-btn"
          aria-label="Add transaction"
        >
          <span className="topbar__add-icon">+</span>
          <span className="topbar__add-text">Add Transaction</span>
        </button>
      </div>
    </header>
  );
}
