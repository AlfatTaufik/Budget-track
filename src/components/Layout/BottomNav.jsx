import React from 'react';
import { LayoutDashboard, ArrowUpDown, PieChart, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Beranda', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transaksi', icon: ArrowUpDown },
  { id: 'analytics', label: 'Analitik', icon: PieChart },
  { id: 'budgets', label: 'Amplop', icon: Mail },
];

const BottomNav = ({ activePage, onNavigate }) => {
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activePage === item.id;
        return (
          <button
            key={item.id}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
            aria-label={item.label}
          >
            <div className="nav-icon-wrap">
              {isActive ? (
                <motion.div layoutId="navIndicator" style={{ display: 'flex' }}>
                  <Icon size={20} strokeWidth={2.5} />
                </motion.div>
              ) : (
                <Icon size={20} strokeWidth={1.75} />
              )}
            </div>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
