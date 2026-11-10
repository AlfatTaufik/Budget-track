import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, TrendingUp } from 'lucide-react';
import useStore from '../../store/useStore';
import { WALLETS, MAIN_WALLET_ID } from '../../utils/categories';
import { formatIDR } from '../../utils/formatters';
import AppIcon from '../Common/AppIcon';

const TopUpInvestmentModal = ({ inv, onClose }) => {
  const topUpInvestment = useStore((s) => s.topUpInvestment);
  const walletBalance = useStore((s) => s.walletBalance) || 0;
  const [amount, setAmount] = useState('');
  const [sourceWallet, setSourceWallet] = useState(MAIN_WALLET_ID); // 'none' | MAIN_WALLET_ID

  if (!inv) return null;

  const parsedAmount = parseFloat(amount) || 0;
  const newTotal = inv.amount + parsedAmount;
  const selectedWalletObj = WALLETS.find((w) => w.id === sourceWallet);

  const handleSave = (e) => {
    e.preventDefault();
    if (parsedAmount <= 0) return;

    topUpInvestment(inv.id, parsedAmount, sourceWallet !== 'none');
    onClose();
  };

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-sheet"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '90vh', overflowY: 'auto', padding: '0 18px 24px' }}
      >
        {/* Handle bar */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: 'var(--border-medium)' }} />
        </div>

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 0 14px',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: inv.colorBg || '#D3CEC2',
                color: inv.color || '#7A746A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px solid ${inv.colorBorder || 'var(--border-subtle)'}`,
              }}
            >
              <AppIcon name={inv.iconName || 'TrendingUp'} size={15} color={inv.color || '#7A746A'} />
            </div>
            <div>
              <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Top Up: {inv.name}
              </h2>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                {inv.type} • Saldo Saat Ini: <strong>{formatIDR(inv.amount)}</strong>
              </span>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Tutup" type="button">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSave} style={{ marginTop: 14 }}>
          {/* Quick Add Chips */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            {[
              ['+100rb', 100000],
              ['+500rb', 500000],
              ['+1 Jt', 1000000],
              ['+5 Jt', 5000000],
            ].map(([label, addVal]) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  const current = parseFloat(amount) || 0;
                  setAmount(String(current + addVal));
                }}
                style={{
                  flex: 1,
                  padding: '6px 0',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: '#FFFFFF',
                  border: '2px solid var(--border-subtle)',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-xs)',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Amount Input */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Nominal Tambahan (Rp)
            </label>
            <input
              type="number"
              placeholder="Contoh: 500000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="1"
              autoFocus
            />
          </div>

          {/* New Total Preview Card */}
          {parsedAmount > 0 && (
            <div
              style={{
                padding: '10px 14px',
                backgroundColor: 'var(--bg-card-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '2px solid var(--border-subtle)',
                marginBottom: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Portofolio Nanti:</span>
              <strong style={{ fontSize: '0.9375rem', color: '#0E0E0E' }}>
                {formatIDR(newTotal)}
              </strong>
            </div>
          )}

          {/* Funding source: from the wallet, or record-only */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Sumber Dana:
            </label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setSourceWallet('none')}
                style={{
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-full)',
                  border: `2px solid ${sourceWallet === 'none' ? 'var(--text-primary)' : 'var(--border-subtle)'}`,
                  backgroundColor: sourceWallet === 'none' ? 'var(--bg-card-subtle)' : '#FFFFFF',
                  cursor: 'pointer',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: sourceWallet === 'none' ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}
              >
                🚫 Tanpa Potong Dompet (Profit / Capital Gain)
              </button>

              {WALLETS.map((w) => {
                const isSelected = sourceWallet === w.id;
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setSourceWallet(w.id)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: 'var(--radius-full)',
                      border: `2px solid ${isSelected ? w.color : 'var(--border-subtle)'}`,
                      backgroundColor: isSelected ? w.colorBg : '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: '0.6875rem',
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? w.color : 'var(--text-secondary)',
                    }}
                  >
                    <AppIcon name={w.iconName} size={11} color={w.color} />
                    Potong dari {w.label} ({formatIDR(walletBalance)})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Educational Note */}
          {sourceWallet !== 'none' && selectedWalletObj ? (
            <div
              style={{
                padding: '10px 12px',
                backgroundColor: '#FFFFFF',
                border: '2px solid #0E0E0E',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.75rem',
                color: '#0E0E0E',
                lineHeight: 1.4,
                marginBottom: 20,
              }}
            >
              💡 Saldo <strong>{selectedWalletObj.label}</strong> akan terpotong {parsedAmount > 0 ? formatIDR(parsedAmount) : ''} dan dialihkan menjadi aset investasi tanpa dihitung sebagai pengeluaran konsumtif bulanan.
            </div>
          ) : (
            <div
              style={{
                padding: '8px 12px',
                backgroundColor: 'var(--bg-card-subtle)',
                border: '2px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.6875rem',
                color: 'var(--text-muted)',
                marginBottom: 20,
              }}
            >
              Nilai portofolio bertambah tanpa memotong saldo dompet.
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#0E0E0E',
              borderColor: '#0E0E0E',
              fontSize: '0.875rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <TrendingUp size={16} /> Konfirmasi Top Up Investasi
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default TopUpInvestmentModal;
