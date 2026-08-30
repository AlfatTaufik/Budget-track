import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, PiggyBank, Pencil, Check, Sparkles, Trash2, Mail, AlertTriangle, CheckCircle2, RotateCcw, X } from 'lucide-react';
import useStore from '../../store/useStore';
import { EXPENSE_CATEGORIES, getCategoryById } from '../../utils/categories';
import { formatCompact, formatIDR } from '../../utils/formatters';
import AppIcon from '../Common/AppIcon';
import AddGoalModal from '../Modal/AddGoalModal';

// --- Single Envelope (Amplop Kategori) Card ---
const EnvelopeCard = ({ bp, onEdit, isEditing, editValue, onEditChange, onSave, onCancel, onDelete, extraCategories = [] }) => {
  const cat = getCategoryById(bp.category, extraCategories);
  const pct = bp.rawPercentage || 0;
  const isOver = bp.isOver;
  const isWarning = bp.isWarning;

  const barColor = isOver ? '#E11D48' : isWarning ? '#D97706' : '#059669';
  const statusBadge = isOver ? (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        padding: '2px 8px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: '#FFF1F2',
        border: '1px solid #FECDD3',
        color: '#E11D48',
        fontSize: '0.625rem',
        fontWeight: 700,
      }}
    >
      <AlertTriangle size={10} /> Overbudget {formatCompact(Math.abs(bp.remaining))}
    </span>
  ) : isWarning ? (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        padding: '2px 8px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: '#FFFBEB',
        border: '1px solid #FDE68A',
        color: '#D97706',
        fontSize: '0.625rem',
        fontWeight: 700,
      }}
    >
      <AlertTriangle size={10} /> Sisa {formatCompact(bp.remaining)}
    </span>
  ) : (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        padding: '2px 8px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: '#ECFDF5',
        border: '1px solid #A7F3D0',
        color: '#059669',
        fontSize: '0.625rem',
        fontWeight: 700,
      }}
    >
      <CheckCircle2 size={10} /> Sisa {formatCompact(bp.remaining)}
    </span>
  );

  return (
    <motion.div
      layout
      className="glass-card"
      style={{
        padding: '12px 14px',
        backgroundColor: '#FFFFFF',
        border: `1px solid ${isOver ? '#FECDD3' : 'var(--border-subtle)'}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Category Icon */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-sm)',
            backgroundColor: cat.colorBg || '#F4F4F5',
            border: `1px solid ${cat.colorBorder || 'var(--border-subtle)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <AppIcon name={cat.iconName} size={17} color={cat.color} />
        </div>

        {/* Envelope Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 4,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {cat.label}
              </span>
              {statusBadge}
            </div>

            {/* Quick Actions */}
            {!isEditing ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <button
                  onClick={() => onEdit(bp.category, bp.limit)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: 4,
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Ubah Jatah Amplop"
                >
                  <Pencil size={12} />
                </button>
                <button
                  onClick={() => onDelete(bp.category)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-disabled)',
                    cursor: 'pointer',
                    padding: 4,
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Hapus Amplop"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ) : null}
          </div>

          {/* Edit Form or Progress */}
          {isEditing ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="number"
                  value={editValue}
                  onChange={(e) => onEditChange(e.target.value)}
                  placeholder="Nominal jatah (Rp)..."
                  autoFocus
                  min="1"
                  style={{ width: '100%', padding: '5px 8px', fontSize: '0.75rem' }}
                />
              </div>
              <button
                onClick={() => onSave(bp.category)}
                style={{
                  backgroundColor: '#18181B',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  padding: '6px 10px',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <Check size={12} /> Simpan
              </button>
              <button
                onClick={onCancel}
                style={{
                  backgroundColor: 'var(--bg-card-subtle)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '6px 8px',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <>
              {/* Progress Bar */}
              <div className="progress-bar" style={{ height: 6, margin: '6px 0 4px' }}>
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(pct, 100)}%` }}
                  transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                  style={{ backgroundColor: barColor }}
                />
              </div>

              {/* Numbers Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  Terpakai: <span className="amount" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{formatCompact(bp.spent)}</span>
                  {' dari '}
                  <span className="amount" style={{ color: 'var(--text-secondary)' }}>{formatCompact(bp.limit)}</span>
                </span>
                <span className="amount" style={{ fontSize: '0.6875rem', color: barColor, fontWeight: 700 }}>
                  {pct.toFixed(0)}%
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// --- Goal / Tabungan Card ---
const GoalCard = ({ goal, onAdd, onDelete }) => {
  const pct = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
  const remaining = goal.targetAmount - goal.savedAmount;
  const barColor = pct >= 100 ? '#059669' : goal.color;

  return (
    <motion.div
      layout
      className="glass-card"
      style={{
        padding: '14px 16px',
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 'var(--radius-sm)',
              backgroundColor: goal.colorBg || '#F4F4F5',
              border: `1px solid ${goal.colorBorder || 'var(--border-subtle)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AppIcon name={goal.iconName || 'Target'} size={16} color={goal.color} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              {goal.name}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 1 }}>
              Target: <span className="amount" style={{ color: 'var(--text-secondary)' }}>{formatCompact(goal.targetAmount)}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {pct < 100 ? (
            <button
              onClick={() => onAdd(goal.id)}
              style={{
                width: 28,
                height: 28,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-card-subtle)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Tambah tabungan"
            >
              <Plus size={14} />
            </button>
          ) : (
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Check size={14} color="#059669" />
            </div>
          )}
          <button
            onClick={() => onDelete(goal.id)}
            style={{
              width: 28,
              height: 28,
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#FFF1F2',
              border: '1px solid #FECDD3',
              color: '#E11D48',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Hapus tabungan"
            type="button"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
        <div className="amount" style={{ fontSize: '1rem', color: goal.color, fontWeight: 700 }}>
          {formatCompact(goal.savedAmount)}
        </div>
        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
          {pct >= 100 ? (
            <span style={{ color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Sparkles size={11} /> Tercapai!
            </span>
          ) : (
            <>
              Sisa <span className="amount" style={{ color: 'var(--text-secondary)' }}>{formatCompact(remaining)}</span>
            </>
          )}
        </div>
      </div>

      <div className="progress-bar">
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
          style={{ backgroundColor: barColor }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 3 }}>
        <span style={{ fontSize: '0.6875rem', color: barColor, fontWeight: 700 }}>{pct.toFixed(0)}%</span>
      </div>
    </motion.div>
  );
};

const BudgetsPage = () => {
  const setBudget = useStore((s) => s.setBudget);
  const deleteBudget = useStore((s) => s.deleteBudget);
  const goals = useStore((s) => s.goals);
  const addGoalAmount = useStore((s) => s.addGoalAmount);
  const deleteGoal = useStore((s) => s.deleteGoal);
  const getBudgetProgress = useStore((s) => s.getBudgetProgress);
  const expenseCategories = useStore((s) => s.expenseCategories || EXPENSE_CATEGORIES);

  const [activeTab, setActiveTab] = useState('envelopes'); // envelopes | goals
  const [editingBudget, setEditingBudget] = useState(null);
  const [budgetInput, setBudgetInput] = useState('');
  const [showAddEnvelope, setShowAddEnvelope] = useState(false);
  const [newCat, setNewCat] = useState(expenseCategories[0]?.id || 'food');
  const [newLimit, setNewLimit] = useState('');

  const [addingGoal, setAddingGoal] = useState(null);
  const [goalInput, setGoalInput] = useState('');
  const [showAddGoal, setShowAddGoal] = useState(false);

  const budgetProgress = getBudgetProgress();

  // Summary Calculations
  const totalBudget = budgetProgress.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgetProgress.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const overallPercentage = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

  const safeCount = budgetProgress.filter((b) => !b.isOver && !b.isWarning).length;
  const warningCount = budgetProgress.filter((b) => b.isWarning).length;
  const overCount = budgetProgress.filter((b) => b.isOver).length;

  const categoriesWithoutBudget = expenseCategories.filter(
    (cat) => !budgetProgress.some((bp) => bp.category === cat.id)
  );

  const handleStartEdit = (catId, currentLimit) => {
    setEditingBudget(catId);
    setBudgetInput(currentLimit?.toString() || '');
  };

  const handleSaveBudget = (catId) => {
    const amount = parseFloat(budgetInput);
    if (!isNaN(amount) && amount > 0) {
      setBudget(catId, amount);
    }
    setEditingBudget(null);
    setBudgetInput('');
  };

  const handleAddEnvelope = (e) => {
    e.preventDefault();
    const parsed = parseFloat(newLimit);
    if (!isNaN(parsed) && parsed > 0) {
      setBudget(newCat, parsed);
      setShowAddEnvelope(false);
      setNewLimit('');
    }
  };

  const handleDeleteBudget = (catId) => {
    const cat = getCategoryById(catId);
    if (window.confirm(`Hapus jatah amplop "${cat.label}"?`)) {
      deleteBudget(catId);
    }
  };

  const handleDeleteGoal = (goalId) => {
    const goal = goals.find((g) => g.id === goalId);
    if (goal && window.confirm(`Apakah Anda yakin ingin menghapus kantong tabungan "${goal.name}"?`)) {
      deleteGoal(goalId);
    }
  };

  const handleAddGoal = (goalId) => {
    const amount = parseFloat(goalInput.replace(/\./g, '').replace(',', '.'));
    if (amount > 0) addGoalAmount(goalId, amount);
    setAddingGoal(null);
    setGoalInput('');
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 style={{ fontSize: '1.375rem' }}>Amplop & Tabungan</h1>
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          backgroundColor: 'var(--bg-card-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: 3,
          gap: 4,
          marginBottom: 16,
        }}
      >
        <button
          onClick={() => setActiveTab('envelopes')}
          style={{
            flex: 1,
            padding: '8px 0',
            borderRadius: 'var(--radius-sm)',
            border: activeTab === 'envelopes' ? '1px solid var(--border-medium)' : '1px solid transparent',
            cursor: 'pointer',
            backgroundColor: activeTab === 'envelopes' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'envelopes' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            transition: 'all 0.15s',
            boxShadow: activeTab === 'envelopes' ? 'var(--shadow-xs)' : 'none',
          }}
        >
          <Mail size={14} /> Amplop Belanja ({budgetProgress.length})
        </button>
        <button
          onClick={() => setActiveTab('goals')}
          style={{
            flex: 1,
            padding: '8px 0',
            borderRadius: 'var(--radius-sm)',
            border: activeTab === 'goals' ? '1px solid var(--border-medium)' : '1px solid transparent',
            cursor: 'pointer',
            backgroundColor: activeTab === 'goals' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'goals' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            transition: 'all 0.15s',
            boxShadow: activeTab === 'goals' ? 'var(--shadow-xs)' : 'none',
          }}
        >
          <PiggyBank size={14} /> Kantong Tabungan ({goals.length})
        </button>
      </div>

      {activeTab === 'envelopes' ? (
        <>
          {/* Envelope Summary Hero Card */}
          <div
            style={{
              borderRadius: 'var(--radius-lg)',
              padding: '16px 18px',
              backgroundColor: 'var(--bg-card-subtle)',
              border: '1px solid var(--border-subtle)',
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Total Sisa Amplop Bulan Ini
                </span>
                <div
                  className="amount"
                  style={{
                    fontSize: '1.625rem',
                    color: totalRemaining >= 0 ? 'var(--text-primary)' : '#E11D48',
                    letterSpacing: '-0.03em',
                    marginTop: 2,
                  }}
                >
                  {formatIDR(totalRemaining)}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  Alokasi Jatah
                </span>
                <div className="amount" style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
                  {formatCompact(totalBudget)}
                </div>
              </div>
            </div>

            {/* Main Budget Progress */}
            <div className="progress-bar" style={{ height: 8, marginBottom: 8 }}>
              <motion.div
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${overallPercentage}%` }}
                transition={{ duration: 0.8 }}
                style={{ backgroundColor: totalRemaining < 0 ? '#E11D48' : overallPercentage > 80 ? '#D97706' : '#18181B' }}
              />
            </div>

            {/* Status Breakdown Chips */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
              <span style={{ fontSize: '0.6875rem', color: '#065F46', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
                🟢 {safeCount} Aman
              </span>
              {warningCount > 0 && (
                <span style={{ fontSize: '0.6875rem', color: '#92400E', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
                  🟡 {warningCount} Waspada
                </span>
              )}
              {overCount > 0 && (
                <span style={{ fontSize: '0.6875rem', color: '#9F1239', backgroundColor: '#FFF1F2', border: '1px solid #FECDD3', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
                  🔴 {overCount} Overbudget
                </span>
              )}
            </div>
          </div>

          {/* Envelopes List Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
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
                }}
              >
                <Mail size={13} color="#FFFFFF" />
              </div>
              <h2 style={{ fontSize: '0.875rem', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                Daftar Pos Amplop
              </h2>
            </div>

            {categoriesWithoutBudget.length > 0 && (
              <button
                onClick={() => setShowAddEnvelope(!showAddEnvelope)}
                style={{
                  padding: '4px 10px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
                type="button"
              >
                <Plus size={12} /> Tambah Amplop
              </button>
            )}
          </div>

          {/* Add Envelope Form Drawer */}
          <AnimatePresence>
            {showAddEnvelope && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleAddEnvelope}
                className="glass-card"
                style={{ padding: '14px', marginBottom: 12, backgroundColor: '#FFFFFF', overflow: 'hidden' }}
              >
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: 10, color: 'var(--text-primary)' }}>
                  Atur Jatah Pos Baru
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <select
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value)}
                    style={{ flex: 1, padding: '7px 10px', fontSize: '0.8125rem', borderRadius: 'var(--radius-sm)' }}
                  >
                    {categoriesWithoutBudget.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Nominal (Rp)..."
                    value={newLimit}
                    onChange={(e) => setNewLimit(e.target.value)}
                    required
                    min="1"
                    style={{ flex: 1, padding: '7px 10px', fontSize: '0.8125rem', borderRadius: 'var(--radius-sm)' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                    onClick={() => setShowAddEnvelope(false)}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ padding: '6px 14px', fontSize: '0.75rem' }}
                  >
                    Simpan Amplop
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Envelope Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {budgetProgress.map((bp) => (
              <EnvelopeCard
                key={bp.category}
                bp={bp}
                isEditing={editingBudget === bp.category}
                editValue={budgetInput}
                onEdit={handleStartEdit}
                onEditChange={setBudgetInput}
                onSave={handleSaveBudget}
                onCancel={() => setEditingBudget(null)}
                onDelete={handleDeleteBudget}
                extraCategories={expenseCategories}
              />
            ))}
          </div>
        </>
      ) : (
        /* Goals Section */
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
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
                }}
              >
                <PiggyBank size={13} color="#FFFFFF" />
              </div>
              <h2 style={{ fontSize: '0.875rem', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                Kantong Tabungan
              </h2>
            </div>
            <button
              onClick={() => setShowAddGoal(true)}
              style={{
                padding: '4px 10px',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
              type="button"
            >
              <Plus size={12} /> Tambah Target
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {goals.map((goal) => (
              <div key={goal.id}>
                <GoalCard
                  goal={goal}
                  onAdd={(id) => {
                    setAddingGoal(id);
                    setGoalInput('');
                  }}
                  onDelete={handleDeleteGoal}
                />
                <AnimatePresence>
                  {addingGoal === goal.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ display: 'flex', gap: 6, padding: '6px 0 2px' }}>
                        <input
                          type="number"
                          placeholder="Tambah tabungan (Rp)..."
                          value={goalInput}
                          onChange={(e) => setGoalInput(e.target.value)}
                          autoFocus
                          style={{ flex: 1 }}
                        />
                        <button
                          className="btn btn-primary"
                          style={{
                            padding: '6px 14px',
                            fontSize: '0.8125rem',
                            borderRadius: 'var(--radius-sm)',
                            flexShrink: 0,
                          }}
                          onClick={() => handleAddGoal(goal.id)}
                        >
                          Simpan
                        </button>
                        <button
                          className="btn btn-ghost"
                          style={{ padding: '6px 10px', flexShrink: 0 }}
                          onClick={() => setAddingGoal(null)}
                        >
                          Batal
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {showAddGoal && <AddGoalModal onClose={() => setShowAddGoal(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default BudgetsPage;
