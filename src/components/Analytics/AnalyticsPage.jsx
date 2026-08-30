import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, Trash2, Pencil, Check, TrendingUp } from 'lucide-react';
import useStore from '../../store/useStore';
import { getCategoryById } from '../../utils/categories';
import { formatIDR, formatCompact } from '../../utils/formatters';
import AppIcon from '../Common/AppIcon';
import AddInvestmentModal from '../Modal/AddInvestmentModal';

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
  const allCategories = [...expenseCategories, ...incomeCategories];

  const [showAddInv, setShowAddInv] = useState(false);
  const [editingInv, setEditingInv] = useState(null);
  const [invInput, setInvInput] = useState('');

  const categoryExpenses = getCategoryExpenses();
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

  const pieData = Object.entries(categoryExpenses)
    .filter(([, v]) => v > 0)
    .map(([catId, value]) => {
      const cat = getCategoryById(catId, allCategories);
      return {
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="amount" style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {formatCompact(inv.amount)}
                      </span>
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

      {/* Donut Chart */}
      {pieData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card"
          style={{ padding: '16px', marginBottom: 14 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <h3 style={{ fontSize: '0.875rem', fontFamily: 'var(--font-display)' }}>Pengeluaran per Kategori</h3>
            <span className="amount" style={{ fontSize: '0.875rem', color: 'var(--color-expense)' }}>
              {formatCompact(totalExpense)}
            </span>
          </div>
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

          {/* Solid Legend with Lucide Icons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
            {pieData.slice(0, 5).map((d) => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
                    {((d.value / totalExpense) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
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
      </AnimatePresence>
    </div>
  );
};

export default AnalyticsPage;
