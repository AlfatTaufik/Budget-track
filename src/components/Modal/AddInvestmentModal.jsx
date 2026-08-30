import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, RotateCcw } from 'lucide-react';
import useStore from '../../store/useStore';

const TYPES = ['Saham', 'Reksa Dana', 'Emas', 'Crypto', 'Properti', 'Lainnya'];

const AddInvestmentModal = ({ onClose }) => {
  const addInvestment = useStore((s) => s.addInvestment);

  const [name, setName] = useState('');
  const [type, setType] = useState(TYPES[0]);
  const [amount, setAmount] = useState('');

  const handleReset = () => {
    setName('');
    setType(TYPES[0]);
    setAmount('');
  };

  const handleSave = (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!name || isNaN(parsedAmount) || parsedAmount <= 0) return;

    addInvestment({
      name,
      type,
      amount: parsedAmount,
    });
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
        transition={{ type: 'spring', damping: 30, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
        style={{ padding: '0 18px 24px' }}
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
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--text-primary)' }}>
            Tambah Aset Investasi
          </h2>
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
                      border: `1.5px solid ${isSelected ? 'var(--text-primary)' : 'var(--border-subtle)'}`,
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
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Nilai Investasi Saat Ini (Rp)
            </label>
            <input
              type="number"
              placeholder="Contoh: 12000000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="1"
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
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
              <Save size={16} /> Simpan Portofolio
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AddInvestmentModal;
