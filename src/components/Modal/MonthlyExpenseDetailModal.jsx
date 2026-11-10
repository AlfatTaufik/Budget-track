import React from 'react';
import { motion } from 'framer-motion';
import { X, ArrowRight, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Calendar, ArrowLeftRight } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import useStore from '../../store/useStore';
import { getCategoryById, getWalletById } from '../../utils/categories';
import { formatIDR, formatCompact, formatDateShort } from '../../utils/formatters';
import AppIcon from '../Common/AppIcon';

const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.08) return null;
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
          border: '2px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '8px 12px',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', marginBottom: 2 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              backgroundColor: d.fill,
            }}
          />
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{d.name}</span>
        </div>
        <div className="amount" style={{ color: d.fill, fontSize: '0.875rem', fontWeight: 700 }}>
          {formatIDR(d.value)}
        </div>
      </div>
    );
  }
  return null;
};

const MonthlyExpenseDetailModal = ({ monthData, onClose, onOpenInAnalytics }) => {
  const getCategoryExpenses = useStore((s) => s.getCategoryExpenses);
  const getMonthlySummary = useStore((s) => s.getMonthlySummary);
  const getMonthlyTransactions = useStore((s) => s.getMonthlyTransactions);
  const expenseCategories = useStore((s) => s.expenseCategories || []);
  const setSelectedAnalyticsMonth = useStore((s) => s.setSelectedAnalyticsMonth);

  if (!monthData) return null;

  const targetDate = new Date(monthData.year, monthData.month, 1);
  const summary = getMonthlySummary(targetDate);
  const categoryExpenses = getCategoryExpenses(targetDate, []);
  const transactions = getMonthlyTransactions(targetDate, 'expense');

  // Chart data
  const pieData = Object.entries(categoryExpenses)
    .filter(([, v]) => v > 0)
    .map(([catId, value]) => {
      const cat = getCategoryById(catId, expenseCategories);
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

  const totalExpense = pieData.reduce((s, d) => s + d.value, 0);

  const handleOpenAnalytics = () => {
    setSelectedAnalyticsMonth({ year: monthData.year, month: monthData.month });
    onClose();
    if (onOpenInAnalytics) {
      onOpenInAnalytics();
    }
  };

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ zIndex: 1050 }}
    >
      <motion.div
        className="modal-sheet"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '88vh', overflowY: 'auto', paddingBottom: 24 }}
      >
        {/* Handle Bar */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: 'var(--border-medium)' }} />
        </div>

        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px 14px',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={16} color="var(--text-secondary)" />
              <h2 style={{ fontSize: '1.0625rem', fontFamily: 'var(--font-display)', margin: 0 }}>
                {monthData.fullName || `${monthData.name} ${monthData.year}`}
              </h2>
            </div>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
              Detail & Grafik Pengeluaran Bulanan
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#F3EAD3',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '16px 18px' }}>
          {/* Key Metric Highlights Card */}
          <div
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-card-subtle)',
              border: '2px solid var(--border-subtle)',
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Total Pengeluaran
                </div>
                <div className="amount" style={{ fontSize: '1.375rem', color: 'var(--color-expense)', fontWeight: 700, marginTop: 2 }}>
                  {formatIDR(summary.expense)}
                </div>
              </div>

              {/* Difference Badge compared to previous month */}
              {summary.prevMonthExpenses > 0 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    backgroundColor: summary.isHigherThanPrev ? '#FFD0D6' : '#C4F2DA',
                    color: summary.isHigherThanPrev ? '#C1123A' : '#046C4E',
                    border: `2px solid ${summary.isHigherThanPrev ? '#111111' : '#111111'}`,
                  }}
                  title={`Bulan sebelumnya: ${formatIDR(summary.prevMonthExpenses)}`}
                >
                  {summary.isHigherThanPrev ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                  <span>
                    {Math.abs(summary.diffPercent).toFixed(1)}% {summary.isHigherThanPrev ? 'lebih boros' : 'lebih hemat'}
                  </span>
                </div>
              )}
            </div>

            {/* Income & Net Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
              <div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Pemasukan</span>
                <div className="amount" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-income)' }}>
                  {formatIDR(summary.income)}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Arus Kas Bersih</span>
                <div className="amount" style={{ fontSize: '0.875rem', fontWeight: 600, color: summary.net >= 0 ? '#046C4E' : '#C1123A' }}>
                  {summary.net >= 0 ? `+${formatIDR(summary.net)}` : formatIDR(summary.net)}
                </div>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div style={{ marginBottom: 18 }}>
            <h3 style={{ fontSize: '0.875rem', fontFamily: 'var(--font-display)', marginBottom: 10, color: 'var(--text-primary)' }}>
              Distribusi Kategori Pengeluaran
            </h3>

            {pieData.length > 0 ? (
              <div>
                <ResponsiveContainer width="100%" height={175}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={46}
                      outerRadius={74}
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

                {/* Categories List with Progress Bar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                  {pieData.map((d) => {
                    const percent = totalExpense > 0 ? (d.value / totalExpense) * 100 : 0;
                    return (
                      <div key={d.id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <div
                              style={{
                                width: 22,
                                height: 22,
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: d.colorBg,
                                border: `2px solid ${d.colorBorder || '#111111'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <AppIcon name={d.iconName} size={11} color={d.fill} />
                            </div>
                            <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                              {d.name}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className="amount" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                              {formatCompact(d.value)}
                            </span>
                            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', minWidth: 32, textAlign: 'right' }}>
                              {percent.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        {/* Thin progress indicator */}
                        <div style={{ height: 4, borderRadius: 2, backgroundColor: '#F3EAD3', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${percent}%`, backgroundColor: d.fill, borderRadius: 2 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '24px 12px',
                  backgroundColor: '#F3EAD3',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-muted)',
                  fontSize: '0.8125rem',
                }}
              >
                Tidak ada data pengeluaran yang tercatat pada bulan ini.
              </div>
            )}
          </div>

          {/* Top Expenses in This Month */}
          {transactions.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <h3 style={{ fontSize: '0.875rem', fontFamily: 'var(--font-display)', color: 'var(--text-primary)', margin: 0 }}>
                  Transaksi Pengeluaran ({transactions.length})
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {transactions.slice(0, 5).map((tx) => {
                  const cat = getCategoryById(tx.category, expenseCategories);
                  const wallet = getWalletById(tx.wallet);
                  return (
                    <div
                      key={tx.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        backgroundColor: '#FFFFFF',
                        border: '2px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: cat.colorBg,
                            border: `2px solid ${cat.colorBorder || '#111111'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <AppIcon name={cat.iconName} size={13} color={cat.color} />
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {tx.note || cat.label}
                          </div>
                          <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', display: 'flex', gap: 6 }}>
                            <span>{formatDateShort(tx.date)}</span>
                            <span>•</span>
                            <span>{wallet.label}</span>
                          </div>
                        </div>
                      </div>
                      <div className="amount" style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-expense)', flexShrink: 0, marginLeft: 8 }}>
                        -{formatIDR(tx.idrAmount || tx.amount)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Button to Open Full Analytics */}
          <button
            type="button"
            onClick={handleOpenAnalytics}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '11px 16px',
              backgroundColor: '#111111',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              transition: 'background-color 0.15s ease',
            }}
          >
            <span>Buka Analisis Lengkap Bulan Ini</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MonthlyExpenseDetailModal;
