import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, TrendingUp, TrendingDown, Wallet, Coins, Target, ChevronRight, Info } from 'lucide-react';
import useStore from '../../store/useStore';
import { formatIDR, formatCompact } from '../../utils/formatters';
import { WALLETS } from '../../utils/categories';
import AppIcon from '../Common/AppIcon';

const HeroCard = () => {
  const getNetWorth = useStore((s) => s.getNetWorth);
  const getTotalLiquidBalance = useStore((s) => s.getTotalLiquidBalance);
  const getTotalGoalsSaved = useStore((s) => s.getTotalGoalsSaved);
  const getTotalInvestments = useStore((s) => s.getTotalInvestments);
  const getMonthlyStats = useStore((s) => s.getMonthlyStats);
  const balanceVisible = useStore((s) => s.balanceVisible);
  const toggleBalanceVisible = useStore((s) => s.toggleBalanceVisible);
  const walletBalances = useStore((s) => s.walletBalances);

  const [showInfoModal, setShowInfoModal] = useState(false);

  const netWorth = getNetWorth();
  const totalLiquid = getTotalLiquidBalance();
  const totalGoals = getTotalGoalsSaved();
  const totalInvestments = getTotalInvestments();
  const { income, expense } = getMonthlyStats();
  const MASK = '••••••';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{ marginBottom: 16 }}
    >
      {/* Main Net Worth Widget Card */}
      <div
        style={{
          borderRadius: 'var(--radius-lg)',
          padding: '18px 16px',
          backgroundColor: 'var(--bg-card-subtle)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <div>
          {/* Header Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: '#18181B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                }}
              >
                <Wallet size={12} color="#FFFFFF" />
              </div>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', fontWeight: 600 }}>
                Total Kekayaan (Net Worth)
              </span>
              <button
                type="button"
                onClick={() => setShowInfoModal(!showInfoModal)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 2,
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="Penjelasan Total Kekayaan"
              >
                <Info size={13} />
              </button>
            </div>

            <button
              onClick={toggleBalanceVisible}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-full)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '4px 8px',
                display: 'flex',
                alignItems: 'center',
              }}
              aria-label={balanceVisible ? 'Sembunyikan' : 'Tampilkan'}
            >
              {balanceVisible ? <Eye size={13} /> : <EyeOff size={13} />}
            </button>
          </div>

          {/* Balance Amount */}
          <div
            className="amount"
            style={{
              fontSize: '2rem',
              color: 'var(--text-primary)',
              marginBottom: 12,
              letterSpacing: '-0.04em',
            }}
          >
            {balanceVisible ? formatIDR(netWorth) : MASK}
          </div>

          {/* 3-Pillar Breakdown Chips (Kas, Tabungan, Investasi) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 6,
              padding: '8px 10px',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              marginBottom: 12,
            }}
          >
            {/* Liquid Cash */}
            <div>
              <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: 1 }}>
                💳 Kas/Dompet
              </div>
              <div className="amount" style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                {balanceVisible ? formatCompact(totalLiquid) : '••••'}
              </div>
            </div>

            {/* Savings Goals */}
            <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: 8 }}>
              <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: 1 }}>
                🎯 Tabungan
              </div>
              <div className="amount" style={{ fontSize: '0.8125rem', color: '#4F46E5', fontWeight: 700 }}>
                {balanceVisible ? formatCompact(totalGoals) : '••••'}
              </div>
            </div>

            {/* Investments */}
            <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: 8 }}>
              <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: 1 }}>
                📈 Investasi
              </div>
              <div className="amount" style={{ fontSize: '0.8125rem', color: '#0284C7', fontWeight: 700 }}>
                {balanceVisible ? formatCompact(totalInvestments) : '••••'}
              </div>
            </div>
          </div>

          {/* Income / Expense Row (StudyTracker Emerald & Rose Badges) */}
          <div style={{ display: 'flex', gap: 8 }}>
            <div
              style={{
                flex: 1,
                backgroundColor: '#ECFDF5',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #A7F3D0',
                padding: '9px 12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                <TrendingUp size={12} color="#059669" />
                <span style={{ fontSize: '0.6875rem', color: '#065F46', fontWeight: 600 }}>Pemasukan Bln Ini</span>
              </div>
              <div className="amount" style={{ fontSize: '0.9375rem', color: '#047857' }}>
                {balanceVisible ? formatCompact(income) : MASK}
              </div>
            </div>

            <div
              style={{
                flex: 1,
                backgroundColor: '#FFF1F2',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #FECDD3',
                padding: '9px 12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                <TrendingDown size={12} color="#E11D48" />
                <span style={{ fontSize: '0.6875rem', color: '#9F1239', fontWeight: 600 }}>Pengeluaran Bln Ini</span>
              </div>
              <div className="amount" style={{ fontSize: '0.9375rem', color: '#BE123C' }}>
                {balanceVisible ? formatCompact(expense) : MASK}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Popover / Modal */}
      <AnimatePresence>
        {showInfoModal && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              overflow: 'hidden',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              marginTop: 8,
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.4,
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              💡 Komponen Total Kekayaan (Net Worth):
            </div>
            <div>• <strong>Kas/Dompet:</strong> Saldo rekening & e-wallet harian (terpotong saat belanja).</div>
            <div>• <strong>Tabungan:</strong> Dana di pos kantong target tabungan Anda.</div>
            <div>• <strong>Investasi:</strong> Nilai portofolio (Saham, Reksa Dana, Emas) yang aman & tidak terpakai saat belanja.</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wallet Pills (Clean White with Zinc Borders) */}
      <div style={{ display: 'flex', gap: 6, marginTop: 10, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none' }}>
        {WALLETS.filter((w) => walletBalances[w.id] > 0).map((wallet) => (
          <div
            key={wallet.id}
            style={{
              flexShrink: 0,
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              padding: '5px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                backgroundColor: wallet.colorBg || '#F4F4F5',
                border: `1px solid ${wallet.colorBorder || '#E4E4E7'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AppIcon name={wallet.iconName} size={11} color={wallet.color} />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{wallet.label}</span>
            <span className="amount" style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 700 }}>
              {balanceVisible ? formatCompact(walletBalances[wallet.id]) : '••••'}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default HeroCard;
