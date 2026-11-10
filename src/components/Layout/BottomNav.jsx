import React from 'react';
import { LayoutDashboard, ArrowUpDown, PieChart, Mail } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Beranda', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transaksi', icon: ArrowUpDown },
  { id: 'analytics', label: 'Analitik', icon: PieChart },
  { id: 'budgets', label: 'Amplop', icon: Mail },
];

// Black bar on phones; the same element becomes the poster sidebar on desktop (see App.css)
const BottomNav = ({ activePage, onNavigate }) => {
  return (
    <nav className="bottom-nav">
      <div className="nav-brand">
        <div className="kicker">Money tracker</div>
        <div className="rule" style={{ color: 'var(--red)' }} />
        <div className="nav-wordmark">
          Nusa
          <br />
          <span>Track</span>
        </div>
      </div>

      {NAV_ITEMS.map((item, index) => {
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
            <span className="nav-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            <div className="nav-icon-wrap">
              <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className="nav-label">{item.label}</span>
          </button>
        );
      })}

      <div className="nav-foot">
        <div className="poster-pill">
          <span className="pill-name">Nusa Track</span>
          <span className="pill-sub">Dompet / Investasi / Amplop</span>
        </div>
        <div className="barcode" aria-hidden="true" />
        <div className="kicker" style={{ fontSize: '0.5625rem' }}>
          Satu dompet. Semua tercatat.
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
