import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check, ArrowLeftRight, Calendar, StickyNote, Tag, Plus, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';
import useStore from '../../store/useStore';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../utils/categories';
import AppIcon from '../Common/AppIcon';

const EditTransactionModal = ({ tx, onClose }) => {
  const updateTransaction = useStore((s) => s.updateTransaction);
  const expenseCategories = useStore((s) => s.expenseCategories || EXPENSE_CATEGORIES);
  const incomeCategories = useStore((s) => s.incomeCategories || INCOME_CATEGORIES);
  const availableTags = useStore((s) => s.tags || []);
  const addTag = useStore((s) => s.addTag);
  const usdRate = useStore((s) => s.usdRate || 16250);

  // Initialize fields from existing tx
  const [type, setType] = useState(tx.type || 'expense');
  // Legacy USD transactions are converted once here; everything is edited in Rupiah
  const [amount, setAmount] = useState(() => {
    if (tx.amount === undefined) return '';
    const isLegacyUsd = tx.wallet === 'paypal' || tx.currency === 'USD';
    return String(isLegacyUsd ? Math.round(tx.amount * (tx.exchangeRate || usdRate)) : tx.amount);
  });
  const [category, setCategory] = useState(tx.category || (tx.type === 'expense' ? 'food' : 'salary'));
  
  // Clean initial note (strip transfer prefix if present)
  const initialNote = tx.note
    ? tx.note.replace(/^\[Transfer ke [^\]]+\]\s*/, '')
    : '';
  const [note, setNote] = useState(initialNote);

  // Date parsing (YYYY-MM-DD)
  const initialDate = tx.date
    ? new Date(tx.date).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(initialDate);

  const [selectedTags, setSelectedTags] = useState(Array.isArray(tx.tags) ? tx.tags : []);
  const [showAddTag, setShowAddTag] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const categories = type === 'expense' ? expenseCategories : incomeCategories;
  const parsedAmount = parseFloat(amount) || 0;

  const toggleTag = (tagName) => {
    setSelectedTags((prev) =>
      prev.includes(tagName) ? prev.filter((t) => t !== tagName) : [...prev, tagName]
    );
  };

  const handleCreateTag = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!newTagInput.trim()) return;
    const clean = newTagInput.trim().replace(/^#/, '');
    addTag(clean);
    if (!selectedTags.includes(clean)) {
      setSelectedTags((prev) => [...prev, clean]);
    }
    setNewTagInput('');
    setShowAddTag(false);
  };

  const handleQuickAdd = (increment) => {
    const current = parseFloat(amount) || 0;
    setAmount(String(current + increment));
  };

  const handleSave = () => {
    if (parsedAmount <= 0) {
      setErrorMsg('Nominal transaksi harus lebih dari 0.');
      return;
    }

    // Preserve time component from old date or use current time
    let finalDateIso = new Date().toISOString();
    if (date) {
      const parsedD = new Date(date);
      if (!isNaN(parsedD.getTime())) {
        const timeHours = tx.date ? new Date(tx.date).getHours() : new Date().getHours();
        const timeMinutes = tx.date ? new Date(tx.date).getMinutes() : new Date().getMinutes();
        const timeSeconds = tx.date ? new Date(tx.date).getSeconds() : new Date().getSeconds();
        parsedD.setHours(timeHours, timeMinutes, timeSeconds);
        finalDateIso = parsedD.toISOString();
      }
    }

    updateTransaction(tx.id, {
      type,
      amount: parsedAmount,
      category: type === 'transfer' ? 'transfer' : category,
      toWallet: type === 'transfer' ? tx.toWallet || 'investasi' : null,
      note: note.trim(),
      date: finalDateIso,
      tags: selectedTags,
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
      style={{ zIndex: 1100 }}
    >
      <motion.div
        className="modal-sheet"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Handle Bar */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: 'var(--border-medium)' }} />
        </div>

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 18px 12px',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.0625rem', color: 'var(--text-primary)', fontWeight: 700 }}>
              Edit Transaksi
            </h2>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor:
                  type === 'transfer' ? '#D3CEC2' : type === 'income' ? '#FFFFFF' : '#E4DED0',
                color:
                  type === 'transfer' ? '#0E0E0E' : type === 'income' ? '#0E0E0E' : '#B81C12',
                border: `2px solid ${
                  type === 'transfer' ? '#0E0E0E' : type === 'income' ? '#0E0E0E' : '#0E0E0E'
                }`,
              }}
            >
              {type === 'transfer' ? 'Transfer' : type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
            </span>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Tutup">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {errorMsg && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#E4DED0',
                border: '2px solid #0E0E0E',
                color: '#B81C12',
                fontSize: '0.75rem',
                fontWeight: 500,
              }}
            >
              <AlertCircle size={14} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Type Selector Tabs */}
          <div>
            <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, display: 'block' }}>
              Jenis Transaksi
            </label>
            <div
              style={{
                display: 'flex',
                backgroundColor: 'var(--bg-card-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: 3,
                gap: 4,
              }}
            >
              {[
                { id: 'expense', label: 'Pengeluaran', icon: TrendingDown, color: '#B81C12', bg: '#E4DED0', border: '#0E0E0E' },
                { id: 'income', label: 'Pemasukan', icon: TrendingUp, color: '#0E0E0E', bg: '#FFFFFF', border: '#0E0E0E' },
                { id: 'transfer', label: 'Pindah Dana', icon: ArrowLeftRight, color: '#0E0E0E', bg: '#D3CEC2', border: '#0E0E0E' },
              ].filter((t) => t.id !== 'transfer' || tx.type === 'transfer').map((t) => {
                const isActive = type === t.id;
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setType(t.id);
                      setErrorMsg('');
                      if (t.id === 'transfer') {
                        setCategory('transfer');
                      } else {
                        const targetCats = t.id === 'expense' ? expenseCategories : incomeCategories;
                        if (!targetCats.find((c) => c.id === category)) {
                          setCategory(targetCats[0]?.id || 'food');
                        }
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: '7px 0',
                      borderRadius: 'var(--radius-sm)',
                      border: isActive ? `1px solid ${t.border}` : '2px solid transparent',
                      backgroundColor: isActive ? t.bg : 'transparent',
                      color: isActive ? t.color : 'var(--text-secondary)',
                      fontSize: '0.75rem',
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Icon size={13} />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, display: 'block' }}>
              Nominal Transaksi (IDR Rp)
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span
                style={{
                  position: 'absolute',
                  left: 14,
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: type === 'income' ? '#0E0E0E' : type === 'expense' ? '#B81C12' : '#0E0E0E',
                }}
              >
                Rp
              </span>
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="0"
                style={{
                  width: '100%',
                  paddingLeft: 46,
                  paddingRight: 40,
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  fontFamily: 'Inter, monospace',
                  height: 48,
                  borderColor: parsedAmount > 0 ? (type === 'income' ? '#0E0E0E' : type === 'expense' ? '#B81C12' : '#0E0E0E') : undefined,
                }}
                autoFocus
              />
              {amount && (
                <button
                  type="button"
                  onClick={() => setAmount('')}
                  style={{
                    position: 'absolute',
                    right: 12,
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: 4,
                  }}
                  title="Hapus nominal"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Quick Increment Badges */}
            <div style={{ display: 'flex', gap: 6, marginTop: 6, overflowX: 'auto', paddingBottom: 2 }}>
              {[1000, 5000, 10000, 50000, 100000].map((inc) => (
                <button
                  key={inc}
                  type="button"
                  onClick={() => handleQuickAdd(inc)}
                  style={{
                    flexShrink: 0,
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--bg-card-subtle)',
                    border: '2px solid var(--border-subtle)',
                    fontSize: '0.6875rem',
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  +{inc >= 1000 ? `${inc / 1000}rb` : inc}
                </button>
              ))}
            </div>
          </div>

          {/* Category Picker (if not transfer) */}
          {type !== 'transfer' && (
            <div>
              <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, display: 'block' }}>
                Kategori
              </label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                  gap: 6,
                  maxHeight: 150,
                  overflowY: 'auto',
                  padding: 2,
                }}
              >
                {categories.map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      style={{
                        padding: '8px 4px',
                        borderRadius: 'var(--radius-sm)',
                        border: `2px solid ${isSelected ? cat.color : 'var(--border-subtle)'}`,
                        backgroundColor: isSelected ? cat.colorBg : '#FFFFFF',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: cat.colorBg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <AppIcon name={cat.iconName} size={14} color={cat.color} />
                      </div>
                      <span
                        style={{
                          fontSize: '0.625rem',
                          fontWeight: isSelected ? 700 : 500,
                          color: isSelected ? cat.color : 'var(--text-secondary)',
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '100%',
                        }}
                      >
                        {cat.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Date Picker & Note */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={12} /> Tanggal
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{ width: '100%', fontSize: '0.8125rem', padding: '8px 10px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <StickyNote size={12} /> Catatan
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Misal: Tagihan Listrik..."
                style={{ width: '100%', fontSize: '0.8125rem', padding: '8px 10px' }}
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Tag size={12} /> Tag (#Label)
              </label>
              <button
                type="button"
                onClick={() => setShowAddTag(!showAddTag)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <Plus size={11} /> Buat Tag Baru
              </button>
            </div>

            {showAddTag && (
              <form onSubmit={handleCreateTag} style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  placeholder="Nama tag baru..."
                  autoFocus
                  style={{ flex: 1, padding: '6px 10px', fontSize: '0.75rem' }}
                />
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#0E0E0E',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    padding: '6px 12px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Tambah
                </button>
              </form>
            )}

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    style={{
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-full)',
                      border: `2px solid ${isSelected ? 'var(--text-primary)' : 'var(--border-subtle)'}`,
                      backgroundColor: isSelected ? 'var(--text-primary)' : '#FFFFFF',
                      color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                      fontSize: '0.6875rem',
                      fontWeight: isSelected ? 600 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '12px 18px',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-card-subtle)',
            display: 'flex',
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: '11px',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--border-subtle)',
              backgroundColor: '#FFFFFF',
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{
              flex: 2,
              padding: '11px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: '#0E0E0E',
              color: '#FFFFFF',
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <Check size={16} /> Simpan Perubahan
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EditTransactionModal;
