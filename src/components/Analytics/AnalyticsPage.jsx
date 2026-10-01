import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  Plus,
  Trash2,
  Pencil,
  Check,
  TrendingUp,
  Eye,
  EyeOff,
  RotateCcw,
  Filter,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Receipt,
  Clock,
  Layers,
} from 'lucide-react';
import useStore from '../../store/useStore';
import { getCategoryById, getWalletById } from '../../utils/categories';
import { formatIDR, formatCompact, formatDateShort } from '../../utils/formatters';
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

const TrendBarTooltip = ({ active, payload, label }) => {
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
        <div style={{ color: 'var(--text-primary)', fontSize: '0.75rem', marginBottom: 4, fontWeight: 700 }}>
          {d.fullName || label}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem' }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: '#E11D48' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Pengeluaran:</span>
          <span className="amount" style={{ color: '#E11D48', fontWeight: 600 }}>
            {formatCompact(d.expense)}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', marginTop: 2 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: '#059669' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Pemasukan:</span>
          <span className="amount" style={{ color: '#059669', fontWeight: 600 }}>
            {formatCompact(d.income)}
          </span>
        </div>
        <div style={{ fontSize: '0.625rem', color: '#4F46E5', marginTop: 4, fontWeight: 600 }}>
          Klik untuk buka analisis bulan ini
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

  // Month navigation & historical store helpers
  const selectedAnalyticsMonth = useStore((s) => s.selectedAnalyticsMonth);
  const setSelectedAnalyticsMonth = useStore((s) => s.setSelectedAnalyticsMonth);
  const getAvailableMonths = useStore((s) => s.getAvailableMonths);
  const getMonthlySummary = useStore((s) => s.getMonthlySummary);
  const getMonthlyTransactions = useStore((s) => s.getMonthlyTransactions);
  const getLast6MonthsData = useStore((s) => s.getLast6MonthsData);

  const [showAddInv, setShowAddInv] = useState(false);
  const [editingInv, setEditingInv] = useState(null);
  const [invInput, setInvInput] = useState('');
  const [topUpInv, setTopUpInv] = useState(null);
  const [showHiddenList, setShowHiddenList] = useState(true);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState(null); // Filter transactions by category

  // Current targeted Date calculation
  const targetYear = selectedAnalyticsMonth?.year ?? new Date().getFullYear();
  const targetMonth = selectedAnalyticsMonth?.month ?? new Date().getMonth();
  const targetDate = new Date(targetYear, targetMonth, 1);

  const now = new Date();
  const isCurrentMonth = targetYear === now.getFullYear() && targetMonth === now.getMonth();

  const availableMonths = getAvailableMonths ? getAvailableMonths() : [];
  const monthlySummary = getMonthlySummary ? getMonthlySummary(targetDate) : { income: 0, expense: 0, net: 0 };
  const trendData = getLast6MonthsData ? getLast6MonthsData() : [];
  const monthlyTransactions = getMonthlyTransactions ? getMonthlyTransactions(targetDate, 'expense') : [];

  const fullMonthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const monthName = fullMonthNames[targetMonth];

  // Month Navigation Handlers
  const handlePrevMonth = () => {
    const prev = new Date(targetYear, targetMonth - 1, 1);
    setSelectedAnalyticsMonth({ year: prev.getFullYear(), month: prev.getMonth() });
    setSelectedCategoryFilter(null);
  };

  const handleNextMonth = () => {
    const next = new Date(targetYear, targetMonth + 1, 1);
    setSelectedAnalyticsMonth({ year: next.getFullYear(), month: next.getMonth() });
    setSelectedCategoryFilter(null);
  };

  const handleSelectMonth = (mObj) => {
    setSelectedAnalyticsMonth({ year: mObj.year, month: mObj.month });
    setSelectedCategoryFilter(null);
  };

  const handleResetToCurrentMonth = () => {
    setSelectedAnalyticsMonth({ year: now.getFullYear(), month: now.getMonth() });
    setSelectedCategoryFilter(null);
  };

  // Expenses for the targeted month
  const allMonthExpenses = getCategoryExpenses(targetDate, []);
  const categoryExpenses = getCategoryExpenses(targetDate, hiddenExpenseCategories);

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

  // All categories having transactions this targeted month
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

  // Filtered transactions for the drill-down list
  const displayedTransactions = selectedCategoryFilter
    ? monthlyTransactions.filter((tx) => tx.category === selectedCategoryFilter)
    : monthlyTransactions;

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
      {/* Header with Title and Reset */}
      <div className="page-header" style={{ marginBottom: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', margin: 0 }}>Analitik & Pengeluaran</h1>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Eksplorasi Detail Chart Bulanan
          </span>
        </div>
        {!isCurrentMonth && (
          <button
            type="button"
            onClick={handleResetToCurrentMonth}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '5px 10px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: '#18181B',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '0.6875rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <RotateCcw size={11} /> Kembali ke Bulan Ini
          </button>
        )}
      </div>

      {/* MONTH NAVIGATOR BAR */}
      <motion.div
        className="glass-card"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          padding: '12px 14px',
          marginBottom: 14,
          backgroundColor: '#FFFFFF',
          border: '1.5px solid var(--border-medium)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <button
            type="button"
            onClick={handlePrevMonth}
            style={{
              width: 34,
              height: 34,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: '#F4F4F5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-primary)',
            }}
            title="Lihat bulan sebelumnya"
          >
            <ChevronLeft size={18} />
          </button>

          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Calendar size={15} color="#4F46E5" />
              <span style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                {monthName} {targetYear}
              </span>
            </div>
            <div style={{ marginTop: 2 }}>
              <span
                style={{
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '1px 8px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: isCurrentMonth ? '#ECFDF5' : '#EEF2FF',
                  color: isCurrentMonth ? '#059669' : '#4F46E5',
                  border: `1px solid ${isCurrentMonth ? '#A7F3D0' : '#C7D2FE'}`,
                }}
              >
                {isCurrentMonth ? 'Bulan Berjalan' : 'Riwayat Bulan Sebelumnya'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleNextMonth}
            style={{
              width: 34,
              height: 34,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: '#F4F4F5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-primary)',
            }}
            title="Lihat bulan berikutnya"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Quick Month Selector Pills */}
        <div
          style={{
            display: 'flex',
            gap: 6,
            overflowX: 'auto',
            paddingTop: 8,
            borderTop: '1px solid var(--border-subtle)',
            scrollbarWidth: 'none',
          }}
        >
          {availableMonths.map((m) => {
            const isSelected = m.year === targetYear && m.month === targetMonth;
            const isThisMonth = m.year === now.getFullYear() && m.month === now.getMonth();
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => handleSelectMonth(m)}
                style={{
                  flexShrink: 0,
                  padding: '5px 11px',
                  borderRadius: 'var(--radius-full)',
                  border: `1.5px solid ${isSelected ? '#18181B' : 'var(--border-subtle)'}`,
                  backgroundColor: isSelected ? '#18181B' : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                  fontSize: '0.6875rem',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span>{m.label}</span>
                {isThisMonth && (
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      backgroundColor: isSelected ? '#10B981' : '#059669',
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* MONTHLY SUMMARY & COMPARISON CARD */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-card"
        style={{
          padding: '16px 18px',
          marginBottom: 14,
          backgroundColor: 'var(--bg-card-subtle)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <div
              style={{
                fontSize: '0.6875rem',
                color: 'var(--text-secondary)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 2,
              }}
            >
              Pengeluaran {monthName} {targetYear}
            </div>
            <div className="amount" style={{ fontSize: '1.75rem', color: 'var(--color-expense)', fontWeight: 700 }}>
              {formatIDR(monthlySummary.expense)}
            </div>
          </div>

          {/* Difference Badge vs Previous Month */}
          {monthlySummary.prevMonthExpenses > 0 ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '5px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: monthlySummary.isHigherThanPrev ? '#FFF1F2' : '#ECFDF5',
                color: monthlySummary.isHigherThanPrev ? '#E11D48' : '#059669',
                border: `1px solid ${monthlySummary.isHigherThanPrev ? '#FECDD3' : '#A7F3D0'}`,
              }}
              title={`Bulan sebelumnya: ${formatIDR(monthlySummary.prevMonthExpenses)}`}
            >
              {monthlySummary.isHigherThanPrev ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
              <span>
                {Math.abs(monthlySummary.diffPercent).toFixed(1)}% {monthlySummary.isHigherThanPrev ? 'lebih boros' : 'lebih hemat'}
              </span>
            </div>
          ) : (
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
              {monthlySummary.expenseTxCount} Transaksi
            </div>
          )}
        </div>

        {/* 3 Metrics Box */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
          <div
            style={{
              textAlign: 'center',
              backgroundColor: '#ECFDF5',
              borderRadius: 'var(--radius-sm)',
              padding: '7px 4px',
              border: '1px solid #A7F3D0',
            }}
          >
            <div style={{ fontSize: '0.5625rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 2 }}>
              Pemasukan
            </div>
            <div className="amount" style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>
              {formatCompact(monthlySummary.income)}
            </div>
          </div>

          <div
            style={{
              textAlign: 'center',
              backgroundColor: monthlySummary.net >= 0 ? '#EEF2FF' : '#FFF1F2',
              borderRadius: 'var(--radius-sm)',
              padding: '7px 4px',
              border: `1px solid ${monthlySummary.net >= 0 ? '#C7D2FE' : '#FECDD3'}`,
            }}
          >
            <div style={{ fontSize: '0.5625rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 2 }}>
              Arus Kas (Net)
            </div>
            <div className="amount" style={{ fontSize: '0.75rem', color: monthlySummary.net >= 0 ? '#4F46E5' : '#E11D48', fontWeight: 700 }}>
              {monthlySummary.net >= 0 ? `+${formatCompact(monthlySummary.net)}` : formatCompact(monthlySummary.net)}
            </div>
          </div>

          <div
            style={{
              textAlign: 'center',
              backgroundColor: '#FFFBEB',
              borderRadius: 'var(--radius-sm)',
              padding: '7px 4px',
              border: '1px solid #FDE68A',
            }}
          >
            <div style={{ fontSize: '0.5625rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 2 }}>
              Rata-Rata / Hari
            </div>
            <div className="amount" style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: 700 }}>
              {formatCompact(monthlySummary.avgDailyExpense)}
            </div>
          </div>
        </div>
      </motion.div>

      {/* 6-MONTH TREND BAR CHART WITH DIRECT CLICK */}
      {trendData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card"
          style={{ padding: '14px 14px 10px', marginBottom: 14 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div>
              <h3 style={{ fontSize: '0.8125rem', fontFamily: 'var(--font-display)', color: 'var(--text-primary)', margin: 0 }}>
                Tren Pengeluaran 6 Bulan
              </h3>
              <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                Klik bar bulan untuk beralih analisis
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.625rem', color: '#18181B', fontWeight: 600 }}>
              <span style={{ width: 8, height: 8, backgroundColor: '#18181B', borderRadius: 2, display: 'inline-block' }} />
              Bulan Dipilih ({monthName.slice(0, 3)})
            </div>
          </div>

          <ResponsiveContainer width="100%" height={140}>
            <BarChart
              data={trendData}
              barCategoryGap="25%"
              onClick={(state) => {
                if (state && state.activePayload && state.activePayload.length) {
                  const clicked = state.activePayload[0].payload;
                  handleSelectMonth({ year: clicked.year, month: clicked.month });
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              <CartesianGrid vertical={false} stroke="#E4E4E7" strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#71717A', fontSize: 10, fontFamily: 'var(--font-body)' }}
              />
              <YAxis
                tickFormatter={(v) => (v > 0 ? formatCompact(v) : '0')}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#71717A', fontSize: 8, fontFamily: 'var(--font-body)' }}
                width={50}
              />
              <Tooltip content={<TrendBarTooltip />} cursor={{ fill: 'rgba(24, 24, 27, 0.04)', radius: 4 }} />
              <Bar
                dataKey="expense"
                radius={[4, 4, 0, 0]}
                maxBarSize={22}
                shape={(props) => {
                  const isCurrentSelected = props.payload.month === targetMonth && props.payload.year === targetYear;
                  return (
                    <rect
                      x={props.x}
                      y={props.y}
                      width={props.width}
                      height={props.height}
                      fill={isCurrentSelected ? '#18181B' : '#E11D48'}
                      rx={3}
                      ry={3}
                    />
                  );
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* CATEGORY FILTER & SPENDING BREAKDOWN SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="glass-card"
        style={{ padding: '16px', marginBottom: 14 }}
      >
        {/* Header with Title and Reset */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Filter size={15} color="var(--text-primary)" />
            <h3 style={{ fontSize: '0.875rem', fontFamily: 'var(--font-display)', margin: 0 }}>
              Distribusi Kategori ({monthName} {targetYear})
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

        {/* Quick Presets Tabs if there are categories */}
        {allUsedCategories.length > 0 && (
          <>
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
          </>
        )}

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

            {/* Active Legend with Interactive Filter Click */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
              {pieData.map((d) => {
                const isSelected = selectedCategoryFilter === d.id;
                return (
                  <div
                    key={d.id}
                    onClick={() => setSelectedCategoryFilter(isSelected ? null : d.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '6px 8px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isSelected ? '#F4F4F5' : 'transparent',
                      cursor: 'pointer',
                      border: isSelected ? '1px solid var(--border-medium)' : '1px solid transparent',
                      transition: 'background-color 0.15s ease',
                    }}
                    title="Klik untuk memfilter daftar transaksi di bawah khusus pos ini"
                  >
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
                      {d.name} {isSelected && <span style={{ color: '#4F46E5', fontSize: '0.6875rem' }}>✓ terpilih</span>}
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
                );
              })}
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
            {allUsedCategories.length === 0
              ? `Belum ada catatan pengeluaran di ${monthName} ${targetYear}.`
              : 'Semua pos pengeluaran sedang disembunyikan.'}
            {allUsedCategories.length > 0 && (
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
            )}
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

      {/* DETAIL TRANSAKSI PENGELUARAN BULAN INI (DRILLDOWN SECTION) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14 }}
        className="glass-card"
        style={{ padding: '16px', marginBottom: 14 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Receipt size={16} color="var(--text-primary)" />
            <h3 style={{ fontSize: '0.875rem', fontFamily: 'var(--font-display)', margin: 0 }}>
              Daftar Transaksi Pengeluaran ({displayedTransactions.length})
            </h3>
          </div>
          {selectedCategoryFilter && (
            <button
              type="button"
              onClick={() => setSelectedCategoryFilter(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#4F46E5',
                fontSize: '0.6875rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Lihat Semua Pos
            </button>
          )}
        </div>

        {selectedCategoryFilter && (
          <div
            style={{
              padding: '6px 10px',
              backgroundColor: '#EEF2FF',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 10,
              fontSize: '0.6875rem',
              color: '#4338CA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>
              Menampilkan pos: <strong>{getCategoryById(selectedCategoryFilter, allCategories).label}</strong>
            </span>
            <button
              type="button"
              onClick={() => setSelectedCategoryFilter(null)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: '#4338CA',
                cursor: 'pointer',
              }}
            >
              ✕ Hapus Filter
            </button>
          </div>
        )}

        {displayedTransactions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, maxHeight: 360, overflowY: 'auto' }}>
            {displayedTransactions.map((tx) => {
              const cat = getCategoryById(tx.category, allCategories);
              const wallet = getWalletById(tx.wallet);
              return (
                <div
                  key={tx.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: cat.colorBg,
                        border: `1px solid ${cat.colorBorder || '#E4E4E7'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <AppIcon name={cat.iconName} size={15} color={cat.color} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {tx.note || cat.label}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        <span>{formatDateShort(tx.date)}</span>
                        <span>•</span>
                        <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>{wallet.label}</span>
                        {tx.tags && tx.tags.length > 0 && (
                          <>
                            <span>•</span>
                            <span>#{tx.tags[0]}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="amount" style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-expense)', flexShrink: 0, marginLeft: 8 }}>
                    -{formatIDR(tx.idrAmount || tx.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '18px 10px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            Tidak ada transaksi pengeluaran {selectedCategoryFilter ? 'pada pos ini' : `di bulan ${monthName} ${targetYear}`}.
          </div>
        )}
      </motion.div>

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
          Net Worth (Total Aset Saat Ini)
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
        transition={{ delay: 0.16 }}
        className="glass-card"
        style={{ padding: '16px', marginBottom: 14 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <TrendingUp size={15} color="var(--text-primary)" />
            <h3 style={{ fontSize: '0.875rem', fontFamily: 'var(--font-display)', margin: 0 }}>Portofolio Investasi</h3>
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

      {/* Budget Progress */}
      {budgetProgress.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="glass-card"
          style={{ padding: '16px', marginBottom: 16 }}
        >
          <h3 style={{ fontSize: '0.875rem', fontFamily: 'var(--font-display)', marginBottom: 12, margin: 0 }}>
            Progress Budget Amplop
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }}>
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
