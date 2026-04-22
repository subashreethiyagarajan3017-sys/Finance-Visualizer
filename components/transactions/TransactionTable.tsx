'use client';
// ============================================================================
// VantageFin Pro — Transaction Table (Sortable, Filterable)
// ============================================================================

import { useMemo, useState } from 'react';
import { useFinanceStore } from '@/lib/store';
import { formatCurrency, formatDate, CATEGORY_COLORS } from '@/lib/constants';

type SortKey = 'date' | 'amount' | 'category' | 'type';

export default function TransactionTable() {
  const { transactions, selectedMonth, deleteTransaction, setEditingTransaction, filters, setFilters } = useFinanceStore();
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = useMemo(() => {
    let txns = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getFullYear() === selectedMonth.year && d.getMonth() === selectedMonth.month;
    });

    if (filters.type !== 'all') txns = txns.filter((t) => t.type === filters.type);
    if (filters.category) txns = txns.filter((t) => t.category === filters.category);
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      txns = txns.filter((t) => t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q));
    }

    txns.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'date') cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      else if (sortKey === 'amount') cmp = a.amount - b.amount;
      else if (sortKey === 'category') cmp = a.category.localeCompare(b.category);
      else if (sortKey === 'type') cmp = a.type.localeCompare(b.type);
      return sortAsc ? cmp : -cmp;
    });

    return txns;
  }, [transactions, selectedMonth, filters, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const sortIcon = (key: SortKey) => sortKey === key ? (sortAsc ? ' ↑' : ' ↓') : '';

  return (
    <div className="txn-table-container">
      {/* Filters */}
      <div className="txn-filters">
        <div className="txn-filters__search">
          <span className="txn-filters__search-icon">🔍</span>
          <input type="text" placeholder="Search transactions..."
            value={filters.searchQuery}
            onChange={(e) => setFilters({ searchQuery: e.target.value })}
            className="form-input form-input--search" />
        </div>
        <div className="txn-filters__group">
          <select value={filters.type}
            onChange={(e) => setFilters({ type: e.target.value as 'all' | 'income' | 'expense' })}
            className="form-select form-select--small">
            <option value="all">All Types</option>
            <option value="expense">Expenses</option>
            <option value="income">Income</option>
          </select>
          <select value={filters.category}
            onChange={(e) => setFilters({ category: e.target.value })}
            className="form-select form-select--small">
            <option value="">All Categories</option>
            {Array.from(new Set(transactions.map((t) => t.category))).sort().map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="txn-table__empty">
          <span className="txn-table__empty-icon">📋</span>
          <p>No transactions found</p>
          <p className="txn-table__empty-sub">Add your first transaction to get started</p>
        </div>
      ) : (
        <div className="txn-table-wrapper">
          <table className="txn-table">
            <thead>
              <tr>
                <th onClick={() => toggleSort('date')} className="txn-table__th txn-table__th--sortable">
                  Date{sortIcon('date')}
                </th>
                <th className="txn-table__th">Description</th>
                <th onClick={() => toggleSort('category')} className="txn-table__th txn-table__th--sortable">
                  Category{sortIcon('category')}
                </th>
                <th onClick={() => toggleSort('type')} className="txn-table__th txn-table__th--sortable">
                  Type{sortIcon('type')}
                </th>
                <th onClick={() => toggleSort('amount')} className="txn-table__th txn-table__th--sortable txn-table__th--right">
                  Amount{sortIcon('amount')}
                </th>
                <th className="txn-table__th txn-table__th--right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((txn) => (
                <tr key={txn.id} className="txn-table__row">
                  <td className="txn-table__td txn-table__td--date">{formatDate(txn.date)}</td>
                  <td className="txn-table__td">
                    <div className="txn-table__desc">
                      {txn.description}
                      {txn.isRecurring && <span className="txn-table__recurring" title="Recurring">🔄</span>}
                    </div>
                  </td>
                  <td className="txn-table__td">
                    <span className="category-badge" style={{ backgroundColor: `${CATEGORY_COLORS[txn.category] || '#78716C'}22`, color: CATEGORY_COLORS[txn.category] || '#78716C', borderColor: `${CATEGORY_COLORS[txn.category] || '#78716C'}44` }}>
                      {txn.category}
                    </span>
                  </td>
                  <td className="txn-table__td">
                    <span className={`type-badge type-badge--${txn.type}`}>
                      {txn.type === 'income' ? '↑' : '↓'} {txn.type}
                    </span>
                  </td>
                  <td className={`txn-table__td txn-table__td--right txn-table__td--amount txn-table__td--${txn.type}`}>
                    {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                  </td>
                  <td className="txn-table__td txn-table__td--right txn-table__td--actions">
                    <button onClick={() => setEditingTransaction(txn)} className="action-btn action-btn--edit" title="Edit">✏️</button>
                    <button onClick={() => { if (confirm('Delete this transaction?')) deleteTransaction(txn.id); }} className="action-btn action-btn--delete" title="Delete">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="txn-table__footer">
        <span>{filtered.length} transaction{filtered.length !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
}
