import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Pencil, Check, X, ArrowRight } from 'lucide-react';
import useStore from '../../store/useStore';
import { formatIDR } from '../../utils/formatters';
import AppIcon from '../Common/AppIcon';

const MASK = '••••••';
const digits = (value) => formatIDR(value).replace(/^Rp\s?/, '');

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
    { id: 'wallet', label: 'Dompet', hint: 'bisa dipakai', value: walletBalance, color: 'var(--ink)' },
    { id: 'invest', label: 'Investasi', hint: 'tidak dipakai belanja', value: totalInvestments, color: 'var(--paper-light)' },
    { id: 'goals', label: 'Tabungan', hint: 'kantong target', value: totalGoals, color: 'var(--concrete)' },
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
      {/* 01: the one wallet, money that can actually be spent */}
      <section className="poster poster-ink hero-wallet">
        <div className="poster-top">
          <div>
            <div className="kicker">01 — Dompet</div>
            <div className="rule" style={{ color: 'var(--red)' }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="square-btn"
              onClick={editing ? () => setEditing(false) : startEdit}
              aria-label={editing ? 'Batal ubah saldo' : 'Ubah saldo dompet'}
              title={editing ? 'Batal' : 'Sesuaikan saldo dompet'}
            >
              {editing ? <X size={16} /> : <Pencil size={15} />}
            </button>
            <button
              type="button"
              className="square-btn"
              onClick={toggleBalanceVisible}
              aria-label={balanceVisible ? 'Sembunyikan saldo' : 'Tampilkan saldo'}
            >
              {balanceVisible ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>
        </div>

        {editing ? (
          <form onSubmit={saveEdit} style={{ display: 'flex', margin: '26px 0 10px' }}>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              aria-label="Saldo dompet baru (Rupiah)"
              autoFocus
              style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', borderColor: 'var(--paper)', borderRight: 'none' }}
            />
            <button
              type="submit"
              className="btn"
              style={{ padding: '0 16px', fontSize: '0.75rem', backgroundColor: 'var(--red)', borderColor: 'var(--paper)', color: '#FFFFFF' }}
            >
              <Check size={16} /> Simpan
            </button>
          </form>
        ) : (
          <div className="hero-amount">
            {balanceVisible ? (
              <>
                <span className="hero-currency">Rp</span>
                <span>{digits(walletBalance)}</span>
              </>
            ) : (
              <span>{MASK}</span>
            )}
          </div>
        )}

        <div className="kicker" style={{ color: 'var(--concrete)' }}>
          Bisa dipakai. Satu sumber dana.
        </div>

        <div className="hero-stats">
          <div>
            <div className="kicker">+ Masuk bln ini</div>
            <div className="stat-value">{show(income)}</div>
          </div>
          <div>
            <div className="kicker">− Keluar bln ini</div>
            <div className="stat-value" style={{ color: 'var(--red)' }}>{show(expense)}</div>
          </div>
        </div>
      </section>

      {/* 02: net worth and what it is made of */}
      <section className="poster poster-red">
        <div className="poster-top">
          <div>
            <div className="kicker">02 — Total kekayaan</div>
            <div className="rule" />
          </div>
          <span className="vertical-text" aria-hidden="true" style={{ position: 'absolute', top: 20, right: 14 }}>Net worth</span>
        </div>

        <div className="worth-amount">{show(netWorth)}</div>

        {netWorth > 0 && (
          <div
            role="img"
            aria-label={composition
              .map((part) => `${part.label} ${Math.round((part.value / netWorth) * 100)}%`)
              .join(', ')}
            style={{ display: 'flex', height: 20, border: '2px solid var(--ink)', marginBottom: 14 }}
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

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 8 }}>
          {composition.map((part) => (
            <div key={part.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 12, height: 12, flexShrink: 0, backgroundColor: part.color, border: '2px solid var(--ink)' }} />
              <span className="kicker" style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {part.label} <span style={{ fontWeight: 500, letterSpacing: '0.06em' }}>/ {part.hint}</span>
              </span>
              <span className="amount" style={{ fontSize: '1rem' }}>{show(part.value)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 03: investments & savings held outside the wallet */}
      <section className="poster poster-paper" style={{ borderTop: '2px solid var(--ink)' }}>
        <div className="poster-top" style={{ alignItems: 'center', marginBottom: 14 }}>
          <div>
            <div className="kicker">03 — Investasi & simpanan</div>
            <div className="rule" />
          </div>
          {onNavigate && (
            <button
              type="button"
              className="btn btn-ghost"
              style={{ padding: '6px 12px', fontSize: '0.6875rem' }}
              onClick={() => onNavigate('analytics')}
            >
              Kelola <ArrowRight size={13} />
            </button>
          )}
        </div>

        {investments.length === 0 ? (
          <p style={{ padding: '14px 0', borderTop: '2px solid var(--ink)', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Belum ada aset. Tambahkan lewat <strong>Kelola</strong>.
          </p>
        ) : (
          investments.map((inv, index) => (
            <div key={inv.id} className="asset-row">
              <span className="asset-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <AppIcon name={inv.iconName || 'TrendingUp'} size={18} color="var(--ink)" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {inv.name}
                </div>
                <div className="kicker" style={{ fontSize: '0.5625rem', color: 'var(--text-muted)' }}>{inv.type}</div>
              </div>
              <div className="amount" style={{ fontSize: '1.25rem' }}>{show(inv.amount)}</div>
            </div>
          ))
        )}

        <div style={{ borderTop: '2px solid var(--ink)', paddingTop: 12, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
          <span className="kicker" style={{ fontSize: '0.5625rem' }}>Tidak dipakai belanja</span>
          <div className="barcode" aria-hidden="true" style={{ width: 96, height: 22 }} />
        </div>
      </section>
    </motion.div>
  );
};

export default HeroCard;
