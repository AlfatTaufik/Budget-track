import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, TrendingUp, TrendingDown, Pencil, Check, X, ArrowRight } from 'lucide-react';
import useStore from '../../store/useStore';
import { formatIDR } from '../../utils/formatters';
import AppIcon from '../Common/AppIcon';

const MASK = '••••••';

const HeroCard = ({ onNavigate }) => {
  const walletBalance = useStore((s) => s.walletBalance) || 0;
  const setWalletBalance = useStore((s) => s.setWalletBalance);
  const investments = useStore((s) => s.investments) || [];
  const getTotalGoalsSaved = useStore((s) => s.getTotalGoalsSaved);
  const getMonthlyStats = useStore((s) => s.getMonthlyStats);
  const balanceVisible = useStore((s) => s.balanceVisible);
  const toggleBalanceVisible = useStore((s) => s.toggleBalanceVisible);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const totalInvestments = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalGoals = getTotalGoalsSaved();
  const netWorth = walletBalance + totalInvestments + totalGoals;
  const { income, expense } = getMonthlyStats();
  const show = (value) => (balanceVisible ? formatIDR(value) : MASK);

  const composition = [
    { id: 'wallet', label: 'Dompet', hint: 'bisa dipakai', value: walletBalance, color: 'var(--block-yellow)' },
    { id: 'invest', label: 'Investasi', hint: 'tidak dipakai belanja', value: totalInvestments, color: 'var(--block-mint)' },
    { id: 'goals', label: 'Tabungan', hint: 'kantong target', value: totalGoals, color: 'var(--block-blue)' },
  ].filter((part) => part.id !== 'goals' || part.value > 0);

  const startEdit = () => {
    setDraft(String(Math.round(walletBalance)));
    setEditing(true);
  };

  const saveEdit = (e) => {
    e.preventDefault();
    const value = parseFloat(draft);
    if (!Number.isFinite(value) || value < 0) return;
    setWalletBalance(value);
    setEditing(false);
  };

  return (
    <motion.div
      className="hero-grid span-all"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* The one wallet: money that can actually be spent */}
      <section
        className="block hero-wallet"
        style={{ backgroundColor: 'var(--block-yellow)', padding: 18, display: 'flex', flexDirection: 'column', gap: 14, boxShadow: 'var(--shadow-lg)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <span className="tag">Dompet</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>bisa dipakai</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="square-btn"
              onClick={editing ? () => setEditing(false) : startEdit}
              aria-label={editing ? 'Batal ubah saldo' : 'Ubah saldo dompet'}
              title={editing ? 'Batal' : 'Sesuaikan saldo dompet'}
            >
              {editing ? <X size={15} /> : <Pencil size={14} />}
            </button>
            <button
              type="button"
              className="square-btn"
              onClick={toggleBalanceVisible}
              aria-label={balanceVisible ? 'Sembunyikan saldo' : 'Tampilkan saldo'}
            >
              {balanceVisible ? <Eye size={15} /> : <EyeOff size={15} />}
            </button>
          </div>
        </div>

        {editing ? (
          <form onSubmit={saveEdit} style={{ display: 'flex', gap: 8 }}>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              aria-label="Saldo dompet baru (Rupiah)"
              autoFocus
              style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem' }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0 14px', boxShadow: 'var(--shadow-xs)' }}>
              <Check size={16} /> Simpan
            </button>
          </form>
        ) : (
          <div
            className="amount"
            style={{ fontSize: 'clamp(1.9rem, 9vw, 2.75rem)', lineHeight: 1.05, letterSpacing: '-0.05em' }}
          >
            {show(walletBalance)}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 'auto' }}>
          <div className="stat-box" style={{ backgroundColor: 'var(--color-income-bg)' }}>
            <div className="stat-label">
              <TrendingUp size={13} /> Masuk bulan ini
            </div>
            <div className="stat-value">{show(income)}</div>
          </div>
          <div className="stat-box" style={{ backgroundColor: 'var(--color-expense-bg)' }}>
            <div className="stat-label">
              <TrendingDown size={13} /> Keluar bulan ini
            </div>
            <div className="stat-value">{show(expense)}</div>
          </div>
        </div>
      </section>

      {/* Net worth and what it is made of */}
      <section className="block" style={{ backgroundColor: 'var(--block-pink)', padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
          <span className="section-title" style={{ marginBottom: 0 }}>Total kekayaan</span>
          <span className="amount" style={{ fontSize: '1.375rem' }}>{show(netWorth)}</span>
        </div>

        {netWorth > 0 && (
          <div
            role="img"
            aria-label={composition
              .map((part) => `${part.label} ${Math.round((part.value / netWorth) * 100)}%`)
              .join(', ')}
            style={{ display: 'flex', height: 22, border: '2px solid var(--ink)', backgroundColor: '#FFFFFF', margin: '12px 0' }}
          >
            {composition
              .filter((part) => part.value > 0)
              .map((part, index) => (
                <div
                  key={part.id}
                  style={{
                    flexGrow: part.value,
                    flexBasis: 0,
                    minWidth: 6,
                    backgroundColor: part.color,
                    borderLeft: index === 0 ? 'none' : '2px solid var(--ink)',
                  }}
                />
              ))}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 6, marginTop: netWorth > 0 ? 0 : 12 }}>
          {composition.map((part) => (
            <div key={part.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem' }}>
              <span style={{ width: 12, height: 12, flexShrink: 0, backgroundColor: part.color, border: '2px solid var(--ink)' }} />
              <span style={{ fontWeight: 700 }}>{part.label}</span>
              <span style={{ fontSize: '0.6875rem', flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {part.hint}
              </span>
              <span className="amount" style={{ fontSize: '0.8125rem' }}>{show(part.value)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Investments & savings held outside the wallet */}
      <section className="block" style={{ backgroundColor: '#FFFFFF', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: '2px solid var(--ink)' }}>
          <h3>Investasi & simpanan</h3>
          {onNavigate && (
            <button
              type="button"
              className="btn btn-ghost"
              style={{ padding: '4px 10px', fontSize: '0.75rem', boxShadow: 'var(--shadow-xs)' }}
              onClick={() => onNavigate('analytics')}
            >
              Kelola <ArrowRight size={13} />
            </button>
          )}
        </div>

        {investments.length === 0 ? (
          <p style={{ padding: '16px 14px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Belum ada aset. Tambahkan lewat <strong>Kelola</strong>.
          </p>
        ) : (
          investments.map((inv, index) => (
            <div
              key={inv.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 14px',
                borderTop: index === 0 ? 'none' : '2px solid var(--ink)',
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: inv.colorBg || 'var(--paper-deep)',
                  border: '2px solid var(--ink)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <AppIcon name={inv.iconName || 'TrendingUp'} size={16} color="var(--ink)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {inv.name}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>{inv.type}</div>
              </div>
              <div className="amount" style={{ fontSize: '0.9375rem' }}>{show(inv.amount)}</div>
            </div>
          ))
        )}
      </section>
    </motion.div>
  );
};

export default HeroCard;
