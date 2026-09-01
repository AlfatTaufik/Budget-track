import React, { useState } from 'react';
import { LogOut, ChevronDown, Wallet, Trash2 } from 'lucide-react';
import useStore from '../../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

const PAGE_TITLES = {
  dashboard: null,
  transactions: 'Transaksi',
  analytics: 'Analitik',
  budgets: 'Amplop & Tabungan',
};

const Header = ({ activePage }) => {
  const user = useStore((s) => s.user);
  const logout = useStore((s) => s.logout);
  const resetAllData = useStore((s) => s.resetAllData);
  const [showMenu, setShowMenu] = useState(false);

  const email = user?.email || '';
  const initials = email.slice(0, 2).toUpperCase();
  const firstName = email.split('@')[0];

  return (
    <>
      <header className="app-header">
        {activePage === 'dashboard' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#18181B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <Wallet size={15} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                Selamat datang,
              </div>
              <span className="logo" style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.9375rem' }}>
                {firstName}
              </span>
            </div>
          </div>
        ) : (
          <h2 style={{ fontSize: '1rem', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            {PAGE_TITLES[activePage]}
          </h2>
        )}

        {/* User Avatar + Menu (StudyTracker Zinc Style) */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              backgroundColor: 'var(--bg-card-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              padding: '3px 8px 3px 3px',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            aria-label="Menu pengguna"
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                backgroundColor: '#18181B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontSize: '0.625rem',
                fontWeight: 700,
              }}
            >
              {initials}
            </div>
            <ChevronDown
              size={12}
              color="var(--text-secondary)"
              style={{
                transform: showMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.15s',
              }}
            />
          </button>

          {/* Dropdown */}
          <AnimatePresence>
            {showMenu && (
              <>
                {/* Backdrop */}
                <div style={{ position: 'fixed', inset: 0, zIndex: 70 }} onClick={() => setShowMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.12 }}
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 6px)',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '6px',
                    minWidth: 180,
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 80,
                  }}
                >
                  <div
                    style={{
                      padding: '6px 8px 8px',
                      borderBottom: '1px solid var(--border-subtle)',
                      marginBottom: 4,
                    }}
                  >
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                      Login sebagai
                    </div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        wordBreak: 'break-all',
                      }}
                    >
                      {email}
                    </div>
                  </div>


                  <button
                    onClick={() => {
                      if (window.confirm('Kosongkan semua data transaksi, target, dan investasi?')) {
                        resetAllData();
                        setShowMenu(false);
                      }
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 8px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-card-subtle)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Trash2 size={13} />
                    Kosongkan Semua Data
                  </button>

                  <div style={{ height: 1, backgroundColor: 'var(--border-subtle)', margin: '4px 0' }} />

                  <button
                    onClick={() => {
                      setShowMenu(false);
                      logout();
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 8px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#E11D48',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FFF1F2')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <LogOut size={13} />
                    Keluar dari Akun
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </header>
    </>
  );
};

export default Header;
