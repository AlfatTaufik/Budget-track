import React, { useState, useEffect, Component } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './App.css';

import Header from './components/Layout/Header';
import BottomNav from './components/Layout/BottomNav';
import AddTransactionModal from './components/Modal/AddTransactionModal';
import DashboardPage from './pages/DashboardPage';
import TransactionList from './components/Transaction/TransactionList';
import AnalyticsPage from './components/Analytics/AnalyticsPage';
import BudgetsPage from './components/Budgets/BudgetsPage';
import LoginPage from './components/Auth/LoginPage';
import Toast from './components/Common/Toast';
import useStore from './store/useStore';
import { Plus, Loader2, Wallet, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-base)',
            padding: 24,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#18181B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              marginBottom: 16,
            }}
          >
            <Wallet size={24} />
          </div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
            Terjadi Kesalahan Tampilan
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', maxWidth: 320, marginBottom: 20, lineHeight: 1.5 }}>
            Halaman sedang diperbarui. Silakan muat ulang untuk memulihkan tampilan.
          </p>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 18px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#18181B',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} /> Muat Ulang Aplikasi
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.12 } },
};

const PAGES = {
  dashboard: DashboardPage,
  transactions: TransactionList,
  analytics: AnalyticsPage,
  budgets: BudgetsPage,
};

function AppContent() {
  const [activePage, setActivePage] = useState('dashboard');
  const [showModal, setShowModal] = useState(false);

  const user = useStore((s) => s.user);
  const authLoading = useStore((s) => s.authLoading);
  const setAuthLoading = useStore((s) => s.setAuthLoading);
  const setUser = useStore((s) => s.setUser);

  // Safety Timeout: Never hang loading screen indefinitely
  useEffect(() => {
    const timer = setTimeout(() => {
      if (useStore.getState().authLoading) {
        setAuthLoading(false);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [setAuthLoading]);

  // Loading Screen (StudyTracker Clean Zinc Style)
  if (authLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-base)',
          gap: 12,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#18181B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <Wallet size={22} strokeWidth={2.2} />
        </div>
        <Loader2 size={18} color="#18181B" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 500 }}>
          Memuat FlowWallet...
        </p>
      </div>
    );
  }

  // Auth Guard
  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  const PageComponent = PAGES[activePage] || DashboardPage;

  return (
    <>
      <Header activePage={activePage} />

      <AnimatePresence mode="wait">
        <motion.div
          key={activePage}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
        >
          {activePage === 'dashboard' ? (
            <DashboardPage onNavigate={setActivePage} />
          ) : (
            <PageComponent />
          )}
        </motion.div>
      </AnimatePresence>

      {/* FAB (Zinc-900 / StudyTracker Style) */}
      <button className="fab" onClick={() => setShowModal(true)} aria-label="Tambah Transaksi">
        <motion.div
          animate={{ rotate: showModal ? 45 : 0 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        >
          <Plus size={22} strokeWidth={2.5} />
        </motion.div>
      </button>

      <BottomNav activePage={activePage} onNavigate={setActivePage} />

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {showModal && <AddTransactionModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>

      {/* Global Instant Feedback Toast */}
      <Toast />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
