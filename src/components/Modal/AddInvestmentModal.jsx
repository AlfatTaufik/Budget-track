import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, RotateCcw, ShieldCheck } from 'lucide-react';
import useStore from '../../store/useStore';
import { WALLETS, MAIN_WALLET_ID, INVESTMENT_TYPES } from '../../utils/categories';
import { formatIDR } from '../../utils/formatters';
import AppIcon from '../Common/AppIcon';

const TYPES = INVESTMENT_TYPES;

const AddInvestmentModal = ({ onClose }) => {
  const addInvestment = useStore((s) => s.addInvestment);
  const walletBalance = useStore((s) => s.walletBalance) || 0;

  const [name, setName] = useState('');
  const [type, setType] = useState(TYPES[0]);
  const [amount, setAmount] = useState('');
  const [sourceWallet, setSourceWallet] = useState(MAIN_WALLET_ID); // 'none' | MAIN_WALLET_ID

  const handleReset = () => {
    setName('');
    setType(TYPES[0]);
    setAmount('');
    setSourceWallet(MAIN_WALLET_ID);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!name || isNaN(parsedAmount) || parsedAmount <= 0) return;

    addInvestment({
      name,
      type,
      amount: parsedAmount,
      fromWallet: sourceWallet !== 'none',
    });
    onClose();
  };

  const selectedWalletObj = WALLETS.find((w) => w.id === sourceWallet);
  const parsedAmount = parseFloat(amount) || 0;

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
        transition={{ type: 'spring', damping: 30, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
        style={{ padding: '0 18px 24px', maxHeight: '90vh', overflowY: 'auto' }}
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
            padding: '4px 0 14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#FFE89A',
                color: '#A85800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={16} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--text-primary)' }}>
              Beli / Tambah Aset Investasi
            </h2>
          </div>
          <button className="btn-icon" onClick={onClose} style={{ width: 32, height: 32 }} type="button">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          {/* Investment Name */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Nama Aset / Saham / Reksa Dana
            </label>
            <input
              type="text"
              placeholder="Contoh: Saham BBCA, Bibit RDPU, Emas Antam..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={40}
            />
          </div>

          {/* Investment Type */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Kategori Investasi
            </label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {TYPES.map((t) => {
                const isSelected = type === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-full)',
                      border: `2px solid ${isSelected ? 'var(--text-primary)' : 'var(--border-subtle)'}`,
                      backgroundColor: isSelected ? 'var(--bg-card-subtle)' : '#FFFFFF',
                      cursor: 'pointer',
                      color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      transition: 'all 0.15s',
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Investment Amount */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Nominal Pembelian / Nilai Aset (Rp)
            </label>
            <input
              type="number"
              placeholder="Contoh: 1000000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="1"
            />
          </div>

          {/* Funding source: from the wallet, or record-only */}
          <div style={{ marginBottom: 16 }}>
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
                🚫 Tidak Potong Dompet (Aset Lama)
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
                backgroundColor: '#C4F2DA',
                border: '2px solid #111111',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.75rem',
                color: '#166534',
                lineHeight: 1.4,
                marginBottom: 20,
              }}
            >
              💡 <strong>Otomatis & Bersih:</strong> Saldo <strong>{selectedWalletObj.label}</strong> akan terpotong {parsedAmount > 0 ? formatIDR(parsedAmount) : ''} dan dipindahkan menjadi aset investasi. Transaksi ini <strong>TIDAK</strong> akan dihitung sebagai pengeluaran konsumtif bulanan Anda.
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
              Hanya mencatat nilai portofolio tanpa mengubah saldo dompet Anda.
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleReset}
              style={{ flex: 1, height: 42, padding: '0 12px' }}
            >
              <RotateCcw size={15} /> Reset
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 2, height: 42, padding: '0 16px' }}
            >
              <Save size={16} /> Simpan Investasi
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AddInvestmentModal;
