// ============================================================================
// VantageFin Pro — Zustand Store with localStorage Persistence
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Company,
  Transaction,
  Scenario,
  ViewMode,
  FilterOptions,
} from './types';
import { STORAGE_KEY } from './constants';

// ── Unique ID Generator ──────────────────────────────────────────────────────
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// ── Store Interface ──────────────────────────────────────────────────────────
interface FinanceStore {
  // State
  company: Company;
  transactions: Transaction[];
  scenarios: Scenario[];
  currentView: ViewMode;
  selectedMonth: { year: number; month: number };
  filters: FilterOptions;
  isSetupComplete: boolean;
  editingTransaction: Transaction | null;
  showTransactionForm: boolean;
  sidebarCollapsed: boolean;

  // Company Actions
  updateCompany: (updates: Partial<Company>) => void;
  completeSetup: (name: string, budget: number) => void;

  // Transaction Actions
  addTransaction: (transaction: Omit<Transaction, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  setEditingTransaction: (transaction: Transaction | null) => void;
  setShowTransactionForm: (show: boolean) => void;

  // Scenario Actions
  addScenario: (scenario: Omit<Scenario, 'id' | 'companyId' | 'createdAt'>) => void;
  deleteScenario: (id: string) => void;

  // Navigation
  setCurrentView: (view: ViewMode) => void;
  setSelectedMonth: (year: number, month: number) => void;
  setFilters: (filters: Partial<FilterOptions>) => void;
  resetFilters: () => void;
  toggleSidebar: () => void;
}

const defaultFilters: FilterOptions = {
  dateFrom: '',
  dateTo: '',
  category: '',
  type: 'all',
  searchQuery: '',
};

// ── Store Creation ───────────────────────────────────────────────────────────
export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set) => ({
      // Default state
      company: {
        id: generateId(),
        name: '',
        monthlyBudget: 0,
        currency: 'USD',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      transactions: [],
      scenarios: [],
      currentView: 'dashboard',
      selectedMonth: {
        year: new Date().getFullYear(),
        month: new Date().getMonth(),
      },
      filters: { ...defaultFilters },
      isSetupComplete: false,
      editingTransaction: null,
      showTransactionForm: false,
      sidebarCollapsed: false,

      // ── Company ──────────────────────────
      updateCompany: (updates) =>
        set((state) => ({
          company: {
            ...state.company,
            ...updates,
            updatedAt: new Date().toISOString(),
          },
        })),

      completeSetup: (name, budget) =>
        set((state) => ({
          company: {
            ...state.company,
            name,
            monthlyBudget: budget,
            updatedAt: new Date().toISOString(),
          },
          isSetupComplete: true,
        })),

      // ── Transactions ─────────────────────
      addTransaction: (txn) =>
        set((state) => ({
          transactions: [
            ...state.transactions,
            {
              ...txn,
              id: generateId(),
              companyId: state.company.id,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
          showTransactionForm: false,
        })),

      updateTransaction: (id, updates) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id
              ? { ...t, ...updates, updatedAt: new Date().toISOString() }
              : t
          ),
          editingTransaction: null,
          showTransactionForm: false,
        })),

      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),

      setEditingTransaction: (transaction) =>
        set(() => ({
          editingTransaction: transaction,
          showTransactionForm: transaction !== null,
        })),

      setShowTransactionForm: (show) =>
        set(() => ({
          showTransactionForm: show,
          editingTransaction: show ? null : null,
        })),

      // ── Scenarios ────────────────────────
      addScenario: (scenario) =>
        set((state) => ({
          scenarios: [
            ...state.scenarios,
            {
              ...scenario,
              id: generateId(),
              companyId: state.company.id,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      deleteScenario: (id) =>
        set((state) => ({
          scenarios: state.scenarios.filter((s) => s.id !== id),
        })),

      // ── Navigation ───────────────────────
      setCurrentView: (view) => set(() => ({ currentView: view })),

      setSelectedMonth: (year, month) =>
        set(() => ({ selectedMonth: { year, month } })),

      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),

      resetFilters: () => set(() => ({ filters: { ...defaultFilters } })),

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: STORAGE_KEY,
    }
  )
);
