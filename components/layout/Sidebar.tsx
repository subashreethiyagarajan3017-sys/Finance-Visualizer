'use client';
// ============================================================================
// VantageFin Pro — Sidebar Navigation
// ============================================================================

import { useFinanceStore } from '@/lib/store';
import { ViewMode } from '@/lib/types';

const navItems: { id: ViewMode; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'transactions', label: 'Transactions', icon: '💳' },
  { id: 'reports', label: 'Reports', icon: '📄' },
  { id: 'sandbox', label: 'Sandbox', icon: '🧪' },
];

export default function Sidebar() {
  const { currentView, setCurrentView, company, sidebarCollapsed, toggleSidebar } =
    useFinanceStore();

  return (
    <aside
      className={`sidebar ${sidebarCollapsed ? 'sidebar--collapsed' : ''}`}
    >
      {/* Logo */}
      <div className="sidebar__logo">
        <div className="sidebar__logo-icon">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="url(#logoGrad)" />
            <path d="M8 20V10l6 4-6 6zm6-6l6-4v10l-6-6z" fill="white" fillOpacity="0.9" />
            <defs>
              <linearGradient id="logoGrad" x1="0" y1="0" x2="28" y2="28">
                <stop stopColor="#6366F1" />
                <stop offset="1" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        {!sidebarCollapsed && (
          <div className="sidebar__logo-text">
            <span className="sidebar__brand">VantageFin</span>
            <span className="sidebar__pro-badge">PRO</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="sidebar__toggle"
          aria-label="Toggle sidebar"
        >
          {sidebarCollapsed ? '→' : '←'}
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`sidebar__nav-item ${
              currentView === item.id ? 'sidebar__nav-item--active' : ''
            }`}
            title={item.label}
          >
            <span className="sidebar__nav-icon">{item.icon}</span>
            {!sidebarCollapsed && (
              <span className="sidebar__nav-label">{item.label}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Profile Footer */}
      {!sidebarCollapsed && (
        <div className="sidebar__footer">
          <div className="sidebar__profile">
            <div className="sidebar__avatar">
              {company.name ? company.name[0].toUpperCase() : 'V'}
            </div>
            <div className="sidebar__profile-info">
              <span className="sidebar__profile-name">
                {company.name || 'VantageFin User'}
              </span>
              <span className="sidebar__profile-role">Owner</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
