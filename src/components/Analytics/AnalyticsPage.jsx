import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, Trash2, Pencil, Check, TrendingUp, Eye, EyeOff, RotateCcw, Filter, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import useStore from '../../store/useStore';
import { getCategoryById } from '../../utils/categories';
import { formatIDR, formatCompact } from '../../utils/formatters';
import AppIcon from '../Common/AppIcon';
import AddInvestmentModal from '../Modal/AddInvestmentModal';
import TopUpInvestmentModal from '../Modal/TopUpInvestmentModal';

const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.06) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="#FFFFFF"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={10}
      fontWeight={700}
      fontFamily="Inter"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '8px 12px',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', marginBottom: 3 }}>
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              backgroundColor: d.colorBg,
              border: `1px solid ${d.colorBorder || '#E4E4E7'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AppIcon name={d.iconName} size={11} color={d.fill} />
          </div>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{d.name}</span>
        </div>
        <div className="amount" style={{ color: d.fill, fontSize: '0.9375rem', fontWeight: 700 }}>
          {formatIDR(d.value)}
        </div>
      </div>
    );
  }
  return null;
};

const AnalyticsPage = () => {
  const getCategoryExpenses = useStore((s) => s.getCategoryExpenses);
  const getBudgetProgress = useStore((s) => s.getBudgetProgress);
  const getTotalLiquidBalance = useStore((s) => s.getTotalLiquidBalance);
  const getTotalGoalsSaved = useStore((s) => s.getTotalGoalsSaved);
  const getTotalInvestments = useStore((s) => s.getTotalInvestments);
  const getNetWorth = useStore((s) => s.getNetWorth);
  const investments = useStore((s) => s.investments);
  const updateInvestment = useStore((s) => s.updateInvestment);
  const deleteInvestment = useStore((s) => s.deleteInvestment);
  const expenseCategories = useStore((s) => s.expenseCategories || []);
  const incomeCategories = useStore((s) => s.incomeCategories || []);
  const hiddenExpenseCategories = useStore((s) => s.hiddenExpenseCategories || []);
  const toggleHideExpenseCategory = useStore((s) => s.toggleHideExpenseCategory);
  const setHiddenExpenseCategories = useStore((s) => s.setHiddenExpenseCategories);
  const resetHiddenExpenseCategories = useStore((s) => s.resetHiddenExpenseCategories);
  const allCategories = [...expenseCategories, ...incomeCategories];

  const [showAddInv, setShowAddInv] = useState(false);
  const [editingInv, setEditingInv] = useState(null);
  const [invInput, setInvInput] = useState('');
  const [topUpInv, setTopUpInv] = useState(null);
  const [showHiddenList, setShowHiddenList] = useState(true);

  // All category expenses (unfiltered raw)
  const allMonthExpenses = getCategoryExpenses(new Date(), []);
  // Filtered by hidden categories
  const categoryExpenses = getCategoryExpenses(new Date(), hiddenExpenseCategories);

  const budgetProgress = getBudgetProgress();
  const totalLiquid = getTotalLiquidBalance();
  const totalGoals = getTotalGoalsSaved();
  const totalInvestments = getTotalInvestments();
  const netWorth = getNetWorth();

  const handleDeleteInv = (invId) => {
    const inv = investments.find((i) => i.id === invId);
    if (inv && window.confirm(`Apakah Anda yakin ingin menghapus investasi "${inv.name}"?`)) {
      deleteInvestment(invId);
    }
  };

  const handleSaveInvValue = (invId) => {
    const amount = parseFloat(invInput.replace(/\./g, '').replace(',', '.'));
    if (amount >= 0) {
      updateInvestment(invId, amount);
    }
    setEditingInv(null);
    setInvInput('');
  };

  // Active Pie Data
  const pieData = Object.entries(categoryExpenses)
    .filter(([, v]) => v > 0)
    .map(([catId, value]) => {
      const cat = getCategoryById(catId, allCategories);
      return {
        id: catId,
        name: cat.label,
        value,
        fill: cat.color,
        iconName: cat.iconName,
        colorBg: cat.colorBg,
        colorBorder: cat.colorBorder,
      };
    })
    .sort((a, b) => b.value - a.value);

  // Hidden categories data
  const hiddenData = Object.entries(allMonthExpenses)
    .filter(([catId, v]) => v > 0 && hiddenExpenseCategories.includes(catId))
    .map(([catId, value]) => {
      const cat = getCategoryById(catId, allCategories);
      return {
        id: catId,
        name: cat.label,
        value,
        fill: cat.color,
        iconName: cat.iconName,
        colorBg: cat.colorBg,
        colorBorder: cat.colorBorder,
      };
    })
    .sort((a, b) => b.value - a.value);

  // All categories having transactions this month
  const allUsedCategories = Object.entries(allMonthExpenses)
    .filter(([, v]) => v > 0)
    .map(([catId, value]) => {
      const cat = getCategoryById(catId, allCategories);
      const isHidden = hiddenExpenseCategories.includes(catId);
      return {
        id: catId,
        name: cat.label,
        value,
        fill: cat.color,
        iconName: cat.iconName,
        colorBg: cat.colorBg,
        colorBorder: cat.colorBorder,
        isHidden,
      };
    })
    .sort((a, b) => b.value - a.value);

  const totalActiveExpense = pieData.reduce((s, d) => s + d.value, 0);
  const totalHiddenExpense = hiddenData.reduce((s, d) => s + d.value, 0);
  const grandTotalExpense = totalActiveExpense + totalHiddenExpense;

  // Check active preset
  const isPresetAll = hiddenExpenseCategories.length === 0;
  const isPresetNoBills =
    hiddenExpenseCategories.length === 1 && hiddenExpenseCategories.includes('bills');
  const allUsedCategoryIds = allUsedCategories.map((c) => c.id);
  const isPresetOnlyBills =
    allUsedCategoryIds.includes('bills') &&
    allUsedCategoryIds.length > 1 &&
    allUsedCategoryIds.filter((id) => id !== 'bills').every((id) => hiddenExpenseCategories.includes(id)) &&
    !hiddenExpenseCategories.includes('bills');

  return (
    <div className="page">
      <div className="page-header">
        <h1 style={{ fontSize: '1.375rem' }}>Analitik</h1>
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Bulan Ini</span>
      </div>

      {/* Net Worth Card (StudyTracker Zinc-100 Style) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
        style={{
          padding: '16px 18px',
          marginBottom: 14,
          backgroundColor: 'var(--bg-card-subtle)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div
          style={{
            fontSize: '0.6875rem',
            color: 'var(--text-secondary)',
            fontWeight: 700,
            marginBottom: 4,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Net Worth (Total Aset)
        </div>
        <div className="amount" style={{ fontSize: '1.875rem', color: 'var(--text-primary)', marginBottom: 12 }}>
          {formatIDR(netWorth)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
          {[
            { label: 'Kas & Rekening', value: totalLiquid, color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
            { label: 'Tabungan', value: totalGoals, color: '#4F46E5', bg: '#EEF2FF', border: '#C7D2FE' },
            { label: 'Investasi', value: totalInvestments, color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                textAlign: 'center',
                backgroundColor: item.bg,
                borderRadius: 'var(--radius-sm)',
                padding: '7px 4px',
                border: `1px solid ${item.border}`,
              }}
            >
              <div
                style={{
                  fontSize: '0.5625rem',
                  color: 'var(--text-secondary)',
                  fontWeight: 600,
                  marginBottom: 2,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {item.label}
              </div>
              <div className="amount" style={{ fontSize: '0.75rem', color: item.color, fontWeight: 700 }}>
                {formatCompact(item.value)}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Portofolio Investasi Section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-card"
        style={{ padding: '16px', marginBottom: 14 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <TrendingUp size={15} color="var(--text-primary)" />
            <h3 style={{ fontSize: '0.875rem', fontFamily: 'var(--font-display)' }}>Portofolio Investasi</h3>
          </div>
          <button
            onClick={() => setShowAddInv(true)}
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
            <Plus size={12} /> Tambah Investasi
          </button>
        </div>

        {investments.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {investments.map((inv) => {
              const isEditing = editingInv === inv.id;
              return (
                <div
                  key={inv.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      backgroundColor: inv.colorBg || '#F4F4F5',
                      border: `1px solid ${inv.colorBorder || 'var(--border-subtle)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <AppIcon name={inv.iconName || 'TrendingUp'} size={13} color={inv.color} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {inv.name}
                    </div>
                    <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                      {inv.type}
                    </div>
                  </div>

                  {isEditing ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input
                        type="number"
                        value={invInput}
                        onChange={(e) => setInvInput(e.target.value)}
                        placeholder="Nilai..."
                        autoFocus
                        style={{ width: 85, padding: '3px 6px', fontSize: '0.75rem' }}
                      />
                      <button
                        onClick={() => handleSaveInvValue(inv.id)}
                        style={{
                          backgroundColor: '#ECFDF5',
                          border: '1px solid #A7F3D0',
                          borderRadius: 4,
                          padding: '3px 6px',
                          color: '#059669',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                        type="button"
                      >
                        <Check size={12} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="amount" style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {formatCompact(inv.amount)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setTopUpInv(inv)}
                        style={{
                          padding: '3px 8px',
                          backgroundColor: '#ECFDF5',
                          border: '1px solid #A7F3D0',
                          borderRadius: 'var(--radius-full)',
                          color: '#059669',
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3,
                          transition: 'all 0.15s',
                        }}
                        title="Top up / tambah dana ke investasi ini"
                      >
                        <Plus size={11} /> Top Up
                      </button>
                      <button
                        onClick={() => {
                          setEditingInv(inv.id);
                          setInvInput(inv.amount.toString());
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: 2,
                        }}
                        type="button"
                        title="Edit nilai langsung"
                      >
                        <Pencil size={11} />
                      </button>
                      <button
                        onClick={() => handleDeleteInv(inv.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#E11D48',
                          cursor: 'pointer',
                          padding: 2,
                        }}
                        type="button"
                        title="Hapus instrumen investasi ini"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
            Belum ada investasi — klik Tambah Investasi
          </div>
        )}
      </motion.div>

      {/* Category Filter & Spending Breakdown Section */}
      {allUsedCategories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card"
          style={{ padding: '16px', marginBottom: 14 }}
        >
          {/* Header with Title and Reset */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Filter size={15} color="var(--text-primary)" />
              <h3 style={{ fontSize: '0.875rem', fontFamily: 'var(--font-display)' }}>
                Filter & Analisis Pengeluaran
              </h3>
            </div>
            {hiddenExpenseCategories.length > 0 && (
              <button
                type="button"
                onClick={resetHiddenExpenseCategories}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--text-secondary)',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <RotateCcw size={10} /> Reset Semua
              </button>
            )}
          </div>

          {/* Quick Presets Tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={resetHiddenExpenseCategories}
              style={{
                padding: '5px 11px',
                borderRadius: 'var(--radius-full)',
                border: `1.5px solid ${isPresetAll ? 'var(--text-primary)' : 'var(--border-subtle)'}`,
                backgroundColor: isPresetAll ? 'var(--text-primary)' : '#FFFFFF',
                color: isPresetAll ? '#FFFFFF' : 'var(--text-secondary)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              Semua Pos
            </button>

            {allUsedCategoryIds.includes('bills') && (
              <>
                <button
                  type="button"
                  onClick={() => setHiddenExpenseCategories(['bills'])}
                  style={{
                    padding: '5px 11px',
                    borderRadius: 'var(--radius-full)',
                    border: `1.5px solid ${isPresetNoBills ? '#EA580C' : 'var(--border-subtle)'}`,
                    backgroundColor: isPresetNoBills ? '#FFF7ED' : '#FFFFFF',
                    color: isPresetNoBills ? '#EA580C' : 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    fontWeight: isPresetNoBills ? 700 : 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    transition: 'all 0.15s',
                  }}
                  title="Sembunyikan tagihan untuk melihat pengeluaran belanja/lifestyle saja"
                >
                  <EyeOff size={12} /> Tanpa Tagihan
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const hideOthers = allUsedCategoryIds.filter((id) => id !== 'bills');
                    setHiddenExpenseCategories(hideOthers);
                  }}
                  style={{
                    padding: '5px 11px',
                    borderRadius: 'var(--radius-full)',
                    border: `1.5px solid ${isPresetOnlyBills ? '#4F46E5' : 'var(--border-subtle)'}`,
                    backgroundColor: isPresetOnlyBills ? '#EEF2FF' : '#FFFFFF',
                    color: isPresetOnlyBills ? '#4F46E5' : 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    fontWeight: isPresetOnlyBills ? 700 : 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    transition: 'all 0.15s',
                  }}
                  title="Fokus tagihan saja untuk melihat total tagihan bulan ini"
                >
                  <Eye size={12} /> Hanya Tagihan
                </button>
              </>
            )}
          </div>

          {/* Interactive Category Visibility Chips (Horizontal Scroll) */}
          <div
            style={{
              display: 'flex',
              gap: 6,
              overflowX: 'auto',
              paddingBottom: 6,
              marginBottom: 12,
              scrollbarWidth: 'none',
            }}
          >
            {allUsedCategories.map((cat) => {
              const isHidden = cat.isHidden;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleHideExpenseCategory(cat.id)}
                  style={{
                    flexShrink: 0,
                    padding: '5px 10px',
                    borderRadius: 'var(--radius-full)',
                    border: `1.5px solid ${isHidden ? 'var(--border-subtle)' : cat.fill}`,
                    backgroundColor: isHidden ? '#F4F4F5' : cat.colorBg,
                    color: isHidden ? 'var(--text-muted)' : cat.fill,
                    fontSize: '0.6875rem',
                    fontWeight: isHidden ? 500 : 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    opacity: isHidden ? 0.65 : 1,
                    textDecoration: isHidden ? 'line-through' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                  title={isHidden ? `Klik untuk tampilkan kembali pos ${cat.name}` : `Klik untuk sembunyikan pos ${cat.name}`}
                >
                  <AppIcon name={cat.iconName} size={12} color={isHidden ? '#A1A1AA' : cat.fill} />
                  <span>{cat.name}</span>
                  <span style={{ fontSize: '0.625rem', opacity: 0.85 }}>({formatCompact(cat.value)})</span>
                  {isHidden ? <EyeOff size={11} color="#71717A" /> : <Eye size={11} color={cat.fill} />}
                </button>
              );
            })}
          </div>

          {/* Comparison Stats Grid (Active vs Hidden) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: hiddenData.length > 0 ? '1fr 1fr' : '1fr',
              gap: 8,
              padding: '10px 12px',
              backgroundColor: 'var(--bg-card-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              marginBottom: 14,
            }}
          >
            <div>
              <div style={{ fontSize: '0.625rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>
                Pengeluaran Aktif ({pieData.length} Pos)
              </div>
              <div className="amount" style={{ fontSize: '1.0625rem', color: 'var(--color-expense)', fontWeight: 700 }}>
                {formatIDR(totalActiveExpense)}
              </div>
              {grandTotalExpense > 0 && hiddenData.length > 0 && (
                <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  {((totalActiveExpense / grandTotalExpense) * 100).toFixed(0)}% dari total pengeluaran
                </div>
              )}
            </div>

            {hiddenData.length > 0 && (
              <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: 10 }}>
                <div style={{ fontSize: '0.625rem', color: '#EA580C', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <EyeOff size={10} /> Disembunyikan ({hiddenData.length} Pos)
                </div>
                <div className="amount" style={{ fontSize: '1.0625rem', color: '#EA580C', fontWeight: 700 }}>
                  {formatIDR(totalHiddenExpense)}
                </div>
                <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  {((totalHiddenExpense / grandTotalExpense) * 100).toFixed(0)}% dari total pengeluaran
                </div>
              </div>
            )}
          </div>

          {/* Donut Chart or Empty state */}
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={76}
                    paddingAngle={2}
                    dataKey="value"
                    labelLine={false}
                    label={renderCustomLabel}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} stroke="#FFFFFF" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Active Legend with Lucide Icons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
                {pieData.map((d) => (
                  <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: d.colorBg,
                        border: `1px solid ${d.colorBorder || '#E4E4E7'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <AppIcon name={d.iconName} size={11} color={d.fill} />
                    </div>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', flex: 1, fontWeight: 500 }}>
                      {d.name}
                    </span>
                    <div style={{ textAlign: 'right' }}>
                      <span
                        className="amount"
                        style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 600 }}
                      >
                        {formatCompact(d.value)}
                      </span>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginLeft: 6 }}>
                        {totalActiveExpense > 0 ? `${((d.value / totalActiveExpense) * 100).toFixed(0)}%` : '0%'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              Semua pos pengeluaran sedang disembunyikan.
              <div style={{ marginTop: 8 }}>
                <button
                  type="button"
                  onClick={resetHiddenExpenseCategories}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: '#18181B',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Tampilkan Semua Pos
                </button>
              </div>
            </div>
          )}

          {/* Hidden Categories Sub-Card */}
          {hiddenData.length > 0 && (
            <div
              style={{
                marginTop: 14,
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#FFF7ED',
                border: '1px solid #FED7AA',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
                onClick={() => setShowHiddenList(!showHiddenList)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontWeight: 600, color: '#C2410C' }}>
                  <EyeOff size={13} />
                  <span>Pos yang Disembunyikan ({hiddenData.length})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#C2410C', fontSize: '0.75rem' }}>
                  <span className="amount" style={{ fontWeight: 700 }}>{formatCompact(totalHiddenExpense)}</span>
                  {showHiddenList ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
              </div>

              {showHiddenList && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8, paddingTop: 8, borderTop: '1px dashed #FDBA74' }}>
                  {hiddenData.map((d) => (
                    <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <AppIcon name={d.iconName} size={12} color="#C2410C" />
                        <span style={{ color: '#9A3412', fontWeight: 500 }}>{d.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="amount" style={{ color: '#C2410C', fontWeight: 600 }}>{formatIDR(d.value)}</span>
                        <button
                          type="button"
                          onClick={() => toggleHideExpenseCategory(d.id)}
                          style={{
                            padding: '2px 6px',
                            borderRadius: 'var(--radius-full)',
                            border: '1px solid #FDBA74',
                            backgroundColor: '#FFFFFF',
                            color: '#C2410C',
                            fontSize: '0.625rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                          }}
                          title="Tampilkan kembali kategori ini"
                        >
                          <Eye size={10} /> Tampilkan
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Budget Progress */}
      {budgetProgress.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card"
          style={{ padding: '16px', marginBottom: 16 }}
        >
          <h3 style={{ fontSize: '0.875rem', fontFamily: 'var(--font-display)', marginBottom: 12 }}>
            Progress Budget
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {budgetProgress.map((b) => {
              const cat = getCategoryById(b.category, allCategories);
              const pct = b.percentage;
              const barColor = pct >= 100 ? '#E11D48' : pct >= 80 ? '#D97706' : '#059669';
              return (
                <div key={b.id}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: cat.colorBg,
                          border: `1px solid ${cat.colorBorder || '#E4E4E7'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <AppIcon name={cat.iconName} size={11} color={cat.color} />
                      </div>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {cat.label}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <span className="amount">{formatCompact(b.spent)}</span>
                      <span style={{ color: 'var(--text-muted)' }}> / {formatCompact(b.limit)}</span>
                    </span>
                  </div>
                  <div className="progress-bar">
                    <motion.div
                      className="progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
                      style={{ backgroundColor: barColor }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                      Sisa:{' '}
                      <span className="amount" style={{ color: barColor }}>
                        {formatCompact(Math.max(0, b.limit - b.spent))}
                      </span>
                    </span>
                    <span style={{ fontSize: '0.6875rem', color: barColor, fontWeight: 700 }}>
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
      <AnimatePresence>
        {showAddInv && <AddInvestmentModal onClose={() => setShowAddInv(false)} />}
        {topUpInv && <TopUpInvestmentModal inv={topUpInv} onClose={() => setTopUpInv(null)} />}
      </AnimatePresence>
    </div>
  );
};

export default AnalyticsPage;
