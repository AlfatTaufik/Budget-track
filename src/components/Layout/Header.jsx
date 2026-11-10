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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div className="brand-mark header-brand">
              <Wallet size={17} strokeWidth={2.5} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1.2 }}>
                Selamat datang,
              </div>
              <div
                className="logo"
                style={{ fontSize: '1rem', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                {firstName}
              </div>
            </div>
          </div>
        ) : (
          <h2 style={{ fontSize: '1.25rem' }}>{PAGE_TITLES[activePage]}</h2>
        )}

        {/* User Avatar + Menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              backgroundColor: '#FFFFFF',
              border: '2px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-xs)',
              padding: '3px 8px 3px 3px',
              cursor: 'pointer',
              flexShrink: 0,
            }}
            aria-label="Menu pengguna"
          >
            <div
              style={{
                width: 26,
                height: 26,
                backgroundColor: 'var(--block-pink)',
                border: '2px solid var(--ink)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ink)',
                fontFamily: 'var(--font-display)',
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
                    border: '2px solid var(--border-subtle)',
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
                    onClick={async () => {
                      if (window.confirm('PERINGATAN: Apakah Anda yakin ingin menghapus SEMUA data transaksi, kantong tabungan, amplop, dan investasi secara permanen dari aplikasi dan database cloud?')) {
                        await resetAllData();
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
                      color: 'var(--color-expense)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-card-subtle)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Trash2 size={13} color="var(--color-expense)" />
                    Reset Data Permanen
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
                      color: '#C1123A',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FFD0D6')}
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
