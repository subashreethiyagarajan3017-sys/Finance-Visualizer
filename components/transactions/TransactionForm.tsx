'use client';
// ============================================================================
// VantageFin Pro — Transaction Form (Add / Edit Modal)
// ============================================================================

import { useState, useEffect } from 'react';
import { useFinanceStore } from '@/lib/store';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/constants';

export default function TransactionForm() {
  const {
    addTransaction, updateTransaction, editingTransaction,
    showTransactionForm, setShowTransactionForm, setEditingTransaction,
  } = useFinanceStore();

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '', type: 'expense' as 'income' | 'expense',
    category: '', description: '',
    isRecurring: false, recurrence: '' as '' | 'weekly' | 'monthly' | 'yearly',
  });

  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        date: editingTransaction.date.split('T')[0],
        amount: String(editingTransaction.amount),
        type: editingTransaction.type, category: editingTransaction.category,
        description: editingTransaction.description,
        isRecurring: editingTransaction.isRecurring,
        recurrence: (editingTransaction.recurrence || '') as '' | 'weekly' | 'monthly' | 'yearly',
      });
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0], amount: '',
        type: 'expense', category: '', description: '',
        isRecurring: false, recurrence: '',
      });
    }
  }, [editingTransaction]);

  if (!showTransactionForm) return null;

  const categories = formData.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.category || !formData.description) return;
    const txnData = {
      date: formData.date, amount: parseFloat(formData.amount),
      type: formData.type, category: formData.category,
      description: formData.description, isRecurring: formData.isRecurring,
      recurrence: formData.recurrence || undefined,
    };
    if (editingTransaction) updateTransaction(editingTransaction.id, txnData);
    else addTransaction(txnData);
  };

  const handleClose = () => { setShowTransactionForm(false); setEditingTransaction(null); };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">
            {editingTransaction ? '✏️ Edit Transaction' : '➕ New Transaction'}
          </h2>
          <button onClick={handleClose} className="modal__close" aria-label="Close">×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal__form">
          <div className="form-group">
            <label className="form-label">Type</label>
            <div className="toggle-group">
              <button type="button" onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
                className={`toggle-btn ${formData.type === 'expense' ? 'toggle-btn--active toggle-btn--expense' : ''}`}>
                💸 Expense
              </button>
              <button type="button" onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
                className={`toggle-btn ${formData.type === 'income' ? 'toggle-btn--active toggle-btn--income' : ''}`}>
                📈 Income
              </button>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="txn-amount" className="form-label">Amount</label>
            <div className="input-with-prefix">
              <span className="input-prefix">$</span>
              <input id="txn-amount" type="number" step="0.01" min="0" value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00" className="form-input form-input--amount" required />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="txn-date" className="form-label">Date</label>
            <input id="txn-date" type="date" value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="form-input" required />
          </div>
          <div className="form-group">
            <label htmlFor="txn-category" className="form-label">Category</label>
            <select id="txn-category" value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="form-select" required>
              <option value="">Select category...</option>
              {categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="txn-desc" className="form-label">Description</label>
            <input id="txn-desc" type="text" value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g., Monthly rent payment" className="form-input" required />
          </div>
          <div className="form-group form-group--row">
            <label className="form-checkbox">
              <input type="checkbox" checked={formData.isRecurring}
                onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })} />
              <span className="form-checkbox__label">Recurring</span>
            </label>
            {formData.isRecurring && (
              <select value={formData.recurrence}
                onChange={(e) => setFormData({ ...formData, recurrence: e.target.value as 'weekly' | 'monthly' | 'yearly' })}
                className="form-select form-select--small">
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            )}
          </div>
          <div className="modal__actions">
            <button type="button" onClick={handleClose} className="btn btn--ghost">Cancel</button>
            <button type="submit" className="btn btn--primary">
              {editingTransaction ? 'Update' : 'Add'} Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
