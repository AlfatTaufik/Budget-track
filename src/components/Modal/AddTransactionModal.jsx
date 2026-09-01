import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Delete, TrendingUp, TrendingDown, StickyNote, ArrowLeft, RotateCcw, Mail, AlertTriangle, Keyboard, Tag, Plus } from 'lucide-react';
import useStore from '../../store/useStore';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, WALLETS } from '../../utils/categories';
import { formatIDR, formatCompact } from '../../utils/formatters';
import AppIcon from '../Common/AppIcon';

import AddCategoryModal from './AddCategoryModal';

const NUMPAD = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'];

const AddTransactionModal = ({ onClose }) => {
  const addTransaction = useStore((s) => s.addTransaction);
  const getCategoryBudget = useStore((s) => s.getCategoryBudget);
  const availableTags = useStore((s) => s.tags || []);
  const addTag = useStore((s) => s.addTag);
  const expenseCategories = useStore((s) => s.expenseCategories || EXPENSE_CATEGORIES);
  const incomeCategories = useStore((s) => s.incomeCategories || INCOME_CATEGORIES);

  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(expenseCategories[0]?.id || 'food');
  const [wallet, setWallet] = useState(WALLETS[0].id);
  const [note, setNote] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [showAddTag, setShowAddTag] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [step, setStep] = useState('amount'); // amount | detail
  const [showNote, setShowNote] = useState(false);
  const [activePressedKey, setActivePressedKey] = useState(null);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);

  const categories = type === 'expense' ? expenseCategories : incomeCategories;

  const handleReset = () => {
    setAmount('');
    setNote('');
    setSelectedTags([]);
    setShowAddTag(false);
    setNewTagInput('');
    setCategory(type === 'expense' ? expenseCategories[0]?.id : incomeCategories[0]?.id);
    setWallet(WALLETS[0].id);
    setStep('amount');
    setShowNote(false);
  };

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

  const handleNumpad = useCallback((key) => {
    if (key === '⌫') {
      setAmount((a) => a.slice(0, -1));
    } else if (key === '.' && amount.includes('.')) {
      return;
    } else {
      if (amount === '0' && key !== '.') return setAmount(key);
      if (amount.length >= 12) return;
      setAmount((a) => a + key);
    }
  }, [amount]);

  const parsedAmount = parseFloat(amount) || 0;

  const handleNext = useCallback(() => {
    if (parsedAmount <= 0) return;
    setStep('detail');
  }, [parsedAmount]);

  const handleSave = useCallback(() => {
    if (parsedAmount <= 0) return;
    addTransaction({ type, amount: parsedAmount, category, wallet, note, tags: selectedTags });
    onClose();
  }, [addTransaction, type, parsedAmount, category, wallet, note, selectedTags, onClose]);

  // Physical Numpad & Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in a text input (e.g. note input)
      const targetTag = e.target?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea') {
        if (e.key === 'Escape') {
          e.target.blur();
        }
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (step === 'amount') {
        if ((e.key >= '0' && e.key <= '9') || e.key === '.' || e.key === ',') {
          e.preventDefault();
          const keyVal = e.key === ',' ? '.' : e.key;
          handleNumpad(keyVal);
          setActivePressedKey(keyVal);
          setTimeout(() => setActivePressedKey(null), 120);
        } else if (e.key === 'Backspace') {
          e.preventDefault();
          handleNumpad('⌫');
          setActivePressedKey('⌫');
          setTimeout(() => setActivePressedKey(null), 120);
        } else if (e.key === 'Delete' || e.key.toLowerCase() === 'c') {
          e.preventDefault();
          setAmount('');
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (parsedAmount > 0) {
            setStep('detail');
          }
        }
      } else if (step === 'detail') {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleSave();
        } else if (e.key === 'Backspace' && !showNote) {
          e.preventDefault();
          setStep('amount');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, parsedAmount, showNote, handleSave, handleNumpad, onClose]);

  const handleTypeSwitch = (t) => {
    setType(t);
    const targetCats = t === 'expense' ? expenseCategories : incomeCategories;
    setCategory(targetCats[0]?.id || 'other');
  };

  return (
    <>
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
              padding: '10px 18px 12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--text-primary)' }}>
                Tambah Transaksi
              </h2>
              {(amount !== '' || note !== '' || step === 'detail') && (
                <button
                  type="button"
                  onClick={handleReset}
                  style={{
                    backgroundColor: 'var(--bg-card-subtle)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-full)',
                    padding: '3px 8px',
                    fontSize: '0.6875rem',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                  }}
                  title="Reset Semua Input"
                >
                  <RotateCcw size={11} /> Reset
                </button>
              )}
            </div>
            <button className="btn-icon" onClick={onClose} aria-label="Tutup">
              <X size={18} />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {step === 'amount' ? (
              <motion.div
                key="amount"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
              >
                {/* Type Switcher */}
                <div style={{ padding: '0 18px 14px' }}>
                  <div
                    style={{
                      display: 'flex',
                      backgroundColor: 'var(--bg-card-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: 3,
                      gap: 4,
                    }}
                  >
                    <button
                      className="tab-btn"
                      onClick={() => handleTypeSwitch('expense')}
                      style={{
                        flex: 1,
                        padding: '7px 0',
                        borderRadius: 'var(--radius-sm)',
                        border: type === 'expense' ? '1px solid #FECDD3' : '1px solid transparent',
                        cursor: 'pointer',
                        backgroundColor: type === 'expense' ? '#FFF1F2' : 'transparent',
                        color: type === 'expense' ? '#9F1239' : 'var(--text-secondary)',
                        fontWeight: 600,
                        fontSize: '0.8125rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        transition: 'all 0.15s',
                      }}
                    >
                      <TrendingDown size={14} color="#E11D48" /> Pengeluaran
                    </button>
                    <button
                      className="tab-btn"
                      onClick={() => handleTypeSwitch('income')}
                      style={{
                        flex: 1,
                        padding: '7px 0',
                        borderRadius: 'var(--radius-sm)',
                        border: type === 'income' ? '1px solid #A7F3D0' : '1px solid transparent',
                        cursor: 'pointer',
                        backgroundColor: type === 'income' ? '#ECFDF5' : 'transparent',
                        color: type === 'income' ? '#065F46' : 'var(--text-secondary)',
                        fontWeight: 600,
                        fontSize: '0.8125rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        transition: 'all 0.15s',
                      }}
                    >
                      <TrendingUp size={14} color="#059669" /> Pemasukan
                    </button>
                  </div>
                </div>

                {/* Amount Display */}
                <div style={{ textAlign: 'center', padding: '16px 18px 20px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 500 }}>
                    Nominal Transaksi
                  </div>
                  <div
                    className="amount"
                    style={{
                      fontSize: amount ? '2.5rem' : '1.75rem',
                      color: amount ? 'var(--text-primary)' : 'var(--text-muted)',
                      letterSpacing: '-0.04em',
                      minHeight: 52,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {amount ? (
                      <>
                        <span style={{ fontSize: '1.25rem', marginRight: 4, color: 'var(--text-muted)' }}>Rp</span>
                        {formatIDR(parsedAmount).replace('Rp', '').trim()}
                      </>
                    ) : (
                      <span style={{ color: 'var(--text-disabled)', fontSize: '1.5rem' }}>Rp 0</span>
                    )}
                  </div>
                </div>

                {/* Numpad */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 6,
                    padding: '0 18px 12px',
                  }}
                >
                  {NUMPAD.map((key) => {
                    const isPressed = activePressedKey === key;
                    return (
                      <button
                        key={key}
                        onClick={() => handleNumpad(key)}
                        style={{
                          padding: '14px 0',
                          backgroundColor: isPressed
                            ? 'var(--brand-primary)'
                            : key === '⌫'
                            ? '#FFF1F2'
                            : '#FFFFFF',
                          border: isPressed ? '1px solid #18181B' : '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          color: isPressed ? '#FFFFFF' : key === '⌫' ? '#E11D48' : 'var(--text-primary)',
                          fontSize: '1.125rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.1s',
                          fontFamily: 'var(--font-display)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: isPressed ? 'none' : 'var(--shadow-xs)',
                          transform: isPressed ? 'scale(0.96)' : 'none',
                        }}
                      >
                        {key === '⌫' ? <Delete size={18} /> : key}
                      </button>
                    );
                  })}
                </div>

                {/* Quick Add Chips */}
                <div style={{ display: 'flex', gap: 6, padding: '0 18px 10px', justifyContent: 'center' }}>
                  {[
                    ['+10rb', 10000],
                    ['+50rb', 50000],
                    ['+100rb', 100000],
                    ['+500rb', 500000],
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
                        padding: '5px 0',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        boxShadow: 'var(--shadow-xs)',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Keyboard Numpad Helper Badge */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    margin: '0 18px 14px',
                    padding: '4px 10px',
                    backgroundColor: 'var(--bg-card-subtle)',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.6875rem',
                  }}
                >
                  <Keyboard size={13} color="var(--text-muted)" />
                  <span>Numpad laptop aktif: tekan <strong>0-9</strong>, <strong>Backspace</strong>, & <strong>Enter</strong></span>
                </div>

                <div style={{ padding: '0 18px 24px' }}>
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', opacity: parsedAmount > 0 ? 1 : 0.4 }}
                    onClick={handleNext}
                  >
                    Lanjut ke Detail (Enter ↵)
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="detail"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                style={{ padding: '0 18px 24px' }}
              >
                {/* Amount Summary */}
                <div
                  style={{
                    padding: '9px 12px',
                    marginBottom: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'var(--bg-card-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>Nominal</span>
                  <span
                    className="amount"
                    style={{
                      color: type === 'expense' ? '#E11D48' : '#059669',
                      fontSize: '1rem',
                    }}
                  >
                    {type === 'expense' ? '- ' : '+ '}
                    {formatIDR(parsedAmount)}
                  </span>
                </div>

                {/* Category Grid */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div className="section-title" style={{ marginBottom: 0 }}>Kategori</div>
                    <button
                      type="button"
                      onClick={() => setShowAddCategoryModal(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-primary)',
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <Plus size={11} /> Kategori Baru
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, maxHeight: 150, overflowY: 'auto', padding: '2px' }}>
                    {categories.map((cat) => {
                      const isSelected = category === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategory(cat.id)}
                          style={{
                            padding: '7px 3px',
                            borderRadius: 'var(--radius-md)',
                            border: `1.5px solid ${isSelected ? cat.color : 'var(--border-subtle)'}`,
                            backgroundColor: isSelected ? cat.colorBg : '#FFFFFF',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 3,
                            transition: 'all 0.15s',
                          }}
                        >
                          <AppIcon name={cat.iconName} size={17} color={isSelected ? cat.color : '#71717A'} />
                          <span
                            style={{
                              fontSize: '0.625rem',
                              color: isSelected ? cat.color : 'var(--text-secondary)',
                              fontWeight: isSelected ? 700 : 500,
                              textAlign: 'center',
                              lineHeight: 1.15,
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

                    {/* Add Category Tile */}
                    <button
                      type="button"
                      onClick={() => setShowAddCategoryModal(true)}
                      style={{
                        padding: '7px 3px',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px dashed var(--border-medium)',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 3,
                        color: 'var(--text-muted)',
                        transition: 'all 0.15s',
                      }}
                      title="Tambah Kategori Baru"
                    >
                      <Plus size={16} />
                      <span style={{ fontSize: '0.625rem', fontWeight: 600 }}>Tambah</span>
                    </button>
                  </div>
                </div>

                {/* Envelope Smart Hint */}
                {type === 'expense' && (() => {
                  const env = getCategoryBudget(category);
                  if (!env) {
                    return (
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Mail size={12} /> Belum ada jatah amplop untuk kategori ini
                      </div>
                    );
                  }
                  const remainingAfterTx = env.remaining - parsedAmount;
                  const willOverbudget = remainingAfterTx < 0;

                  return (
                    <div
                      style={{
                        marginTop: 8,
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: willOverbudget ? '#FFF1F2' : env.isWarning ? '#FFFBEB' : '#F0FDF4',
                        border: `1px solid ${willOverbudget ? '#FECDD3' : env.isWarning ? '#FDE68A' : '#BBF7D0'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.6875rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Mail size={13} color={willOverbudget ? '#E11D48' : '#059669'} />
                        <span style={{ color: 'var(--text-secondary)' }}>Sisa Amplop:</span>
                        <strong style={{ color: env.remaining < 0 ? '#E11D48' : 'var(--text-primary)' }}>
                          {formatIDR(env.remaining)}
                        </strong>
                      </div>
                      {willOverbudget ? (
                        <span style={{ color: '#E11D48', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                          <AlertTriangle size={11} /> Minus {formatCompact(Math.abs(remainingAfterTx))}
                        </span>
                      ) : (
                        <span style={{ color: '#065F46', fontWeight: 600 }}>
                          Sisa nanti: {formatCompact(remainingAfterTx)}
                        </span>
                      )}
                    </div>
                  );
                })()}

              {/* Wallet Selector */}
              <div style={{ marginBottom: 14 }}>
                <div className="section-title">Dompet / Rekening</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {WALLETS.map((w) => {
                    const isSelected = wallet === w.id;
                    return (
                      <button
                        key={w.id}
                        onClick={() => setWallet(w.id)}
                        style={{
                          padding: '5px 10px',
                          borderRadius: 'var(--radius-full)',
                          border: `1.5px solid ${isSelected ? w.color : 'var(--border-subtle)'}`,
                          backgroundColor: isSelected ? w.colorBg : '#FFFFFF',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                          color: isSelected ? w.color : 'var(--text-secondary)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          transition: 'all 0.15s',
                        }}
                      >
                        <AppIcon name={w.iconName} size={12} color={isSelected ? w.color : '#71717A'} />
                        {w.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Labels / Tags */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div className="section-title" style={{ marginBottom: 0 }}>Label / Tag</div>
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
                      gap: 2,
                    }}
                  >
                    <Plus size={11} /> Label Baru
                  </button>
                </div>

                {/* Add Custom Tag Form Drawer */}
                <AnimatePresence>
                  {showAddTag && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ overflow: 'hidden', marginBottom: 8 }}
                    >
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input
                          type="text"
                          placeholder="Nama label (contoh: Proyek, Nongkrong)..."
                          value={newTagInput}
                          onChange={(e) => setNewTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleCreateTag(e);
                            }
                          }}
                          autoFocus
                          style={{ flex: 1, padding: '5px 10px', fontSize: '0.75rem' }}
                        />
                        <button
                          type="button"
                          onClick={handleCreateTag}
                          className="btn btn-primary"
                          style={{ padding: '5px 10px', fontSize: '0.75rem', borderRadius: 'var(--radius-sm)' }}
                        >
                          Tambah
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Tag Pills */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', maxHeight: 84, overflowY: 'auto' }}>
                  {availableTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-full)',
                          border: `1.5px solid ${isSelected ? 'var(--text-primary)' : 'var(--border-subtle)'}`,
                          backgroundColor: isSelected ? 'var(--bg-card-subtle)' : '#FFFFFF',
                          color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                          fontSize: '0.6875rem',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3,
                          transition: 'all 0.15s',
                        }}
                      >
                        <Tag size={10} color={isSelected ? 'var(--text-primary)' : 'var(--text-muted)'} />
                        #{tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Note */}
              <div style={{ marginBottom: 18 }}>
                {showNote ? (
                  <input
                    type="text"
                    placeholder="Catatan transaksi..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    autoFocus
                  />
                ) : (
                  <button
                    className="btn btn-ghost"
                    style={{ width: '100%', padding: '8px 12px' }}
                    onClick={() => setShowNote(true)}
                  >
                    <StickyNote size={14} /> Tambah Catatan
                  </button>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ padding: '10px 14px' }}
                  onClick={() => setStep('amount')}
                  title="Kembali ke Nominal"
                >
                  <ArrowLeft size={15} />
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ padding: '10px 14px' }}
                  onClick={handleReset}
                  title="Reset Semua Input"
                >
                  <RotateCcw size={15} />
                </button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave}>
                  Simpan Transaksi
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>

    {/* Add Custom Category Modal */}
    <AnimatePresence>
      {showAddCategoryModal && (
        <AddCategoryModal
          defaultType={type}
          onClose={() => setShowAddCategoryModal(false)}
          onCreated={(createdCat) => {
            if (createdCat) {
              setCategory(createdCat.id);
            }
          }}
        />
      )}
    </AnimatePresence>
  </>
);
};

export default AddTransactionModal;
