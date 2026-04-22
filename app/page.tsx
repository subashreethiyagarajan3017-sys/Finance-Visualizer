'use client';
// ============================================================================
// VantageFin Pro — Main Dashboard Page
// ============================================================================

import { useFinanceStore } from '@/lib/store';
import SetupScreen from '@/components/SetupScreen';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import QuickStats from '@/components/dashboard/QuickStats';
import BudgetOverview from '@/components/dashboard/BudgetOverview';
import WeeklyAlert from '@/components/dashboard/WeeklyAlert';
import TransactionForm from '@/components/transactions/TransactionForm';
import TransactionTable from '@/components/transactions/TransactionTable';
import CashFlowTrend from '@/components/charts/CashFlowTrend';
import CategoryBreakdown from '@/components/charts/CategoryBreakdown';
import SpendingHeatmap from '@/components/charts/SpendingHeatmap';
import SandboxPanel from '@/components/sandbox/SandboxPanel';
import ReportGenerator from '@/components/reports/ReportGenerator';

function DashboardView() {
  return (
    <div className="view-dashboard">
      <WeeklyAlert />
      <QuickStats />
      <div className="dashboard-grid">
        <div className="dashboard-grid__main">
          <CashFlowTrend />
          <SpendingHeatmap />
        </div>
        <div className="dashboard-grid__side">
          <BudgetOverview />
          <CategoryBreakdown />
        </div>
      </div>
    </div>
  );
}

function TransactionsView() {
  return (
    <div className="view-transactions">
      <QuickStats />
      <TransactionTable />
    </div>
  );
}

function ReportsView() {
  return (
    <div className="view-reports">
      <ReportGenerator />
    </div>
  );
}

function SandboxView() {
  return (
    <div className="view-sandbox">
      <SandboxPanel />
    </div>
  );
}

export default function Home() {
  const { isSetupComplete, currentView } = useFinanceStore();

  if (!isSetupComplete) {
    return <SetupScreen />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView />;
      case 'transactions': return <TransactionsView />;
      case 'reports': return <ReportsView />;
      case 'sandbox': return <SandboxView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <TopBar />
        <main className="app-content">
          {renderView()}
        </main>
      </div>
      <TransactionForm />
    </div>
  );
}
