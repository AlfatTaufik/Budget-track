import React from 'react';
import { LayoutDashboard, ArrowUpDown, PieChart, Mail, Wallet } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Beranda', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transaksi', icon: ArrowUpDown },
  { id: 'analytics', label: 'Analitik', icon: PieChart },
  { id: 'budgets', label: 'Amplop', icon: Mail },
];

// Bottom bar on phones; the same element becomes the sidebar on desktop (see App.css)
const BottomNav = ({ activePage, onNavigate }) => {
  return (
    <nav className="bottom-nav">
      <div className="nav-brand">
        <div className="brand-mark">
          <Wallet size={17} strokeWidth={2.5} />
        </div>
        <span className="brand-name">Nusa Track</span>
      </div>

      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activePage === item.id;
        return (
          <button
            key={item.id}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <div className="nav-icon-wrap">
              <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span>{item.label}</span>
          </button>
        );
      })}

      <div className="nav-foot">
        Satu dompet.
        <br />
        Semua tercatat.
      </div>
    </nav>
  );
};

export default BottomNav;
