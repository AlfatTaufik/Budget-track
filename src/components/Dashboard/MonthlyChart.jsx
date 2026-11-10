import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ChevronRight, Sparkles, PieChart as PieChartIcon } from 'lucide-react';
import useStore from '../../store/useStore';
import { formatIDR, formatCompact } from '../../utils/formatters';
import MonthlyExpenseDetailModal from '../Modal/MonthlyExpenseDetailModal';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
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
        <div style={{ color: 'var(--text-primary)', fontSize: '0.75rem', marginBottom: 4, fontWeight: 700 }}>
          {label}
        </div>
        {payload.map((p) => (
          <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: p.fill }} />
            <span style={{ color: 'var(--text-secondary)' }}>{p.name === 'income' ? 'Masuk' : 'Keluar'}:</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
              {formatCompact(p.value)}
            </span>
          </div>
        ))}
        <div style={{ fontSize: '0.625rem', color: '#6366F1', marginTop: 4, fontWeight: 600 }}>
          Ketuk bar untuk lihat rincian ➔
        </div>
      </div>
    );
  }
  return null;
};

const MonthlyChart = ({ onNavigate }) => {
  const getLast6MonthsData = useStore((s) => s.getLast6MonthsData);
  const setSelectedAnalyticsMonth = useStore((s) => s.setSelectedAnalyticsMonth);
  const data = getLast6MonthsData();

  const [selectedMonthModal, setSelectedMonthModal] = useState(null);

  const handleBarClick = (entry) => {
    if (!entry) return;
    // Entry can come from BarChart click or custom chip
    const monthObj = data.find((d) => d.name === entry.name || d.month === entry.month) || entry;
    setSelectedMonthModal(monthObj);
  };

  const handleOpenAnalyticsForMonth = (monthObj) => {
    if (monthObj) {
      setSelectedAnalyticsMonth({ year: monthObj.year, month: monthObj.month });
    }
    if (onNavigate) {
      onNavigate('analytics');
    }
  };

  return (
    <>
      <motion.div
        className="glass-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        style={{ padding: '16px 14px 12px', marginBottom: 16 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <h3 style={{ fontSize: '0.875rem', fontFamily: 'var(--font-display)', color: 'var(--text-primary)', margin: 0 }}>
              Arus Kas 6 Bulan
            </h3>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
              Klik grafik atau bulan untuk detail pengeluaran
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.6875rem', color: '#065F46', fontWeight: 600, backgroundColor: '#C4F2DA', padding: '2px 6px', borderRadius: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#046C4E' }} /> Masuk
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.6875rem', color: '#9F1239', fontWeight: 600, backgroundColor: '#FFD0D6', padding: '2px 6px', borderRadius: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#C1123A' }} /> Keluar
            </div>
          </div>
        </div>

        <div style={{ cursor: 'pointer' }}>
          <ResponsiveContainer width="100%" height={165}>
            <BarChart
              data={data}
              barCategoryGap="30%"
              barGap={3}
              onClick={(state) => {
                if (state && state.activePayload && state.activePayload.length) {
                  const clickedData = state.activePayload[0].payload;
                  handleBarClick(clickedData);
                }
              }}
            >
              <CartesianGrid vertical={false} stroke="#111111" strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#57534E', fontSize: 11, fontFamily: 'var(--font-body)' }}
              />
              <YAxis
                tickFormatter={(v) => (v > 0 ? formatIDR(v) : '0')}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#57534E', fontSize: 9, fontFamily: 'var(--font-body)' }}
                width={68}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(24, 24, 27, 0.04)', radius: 4 }} />
              {/* StudyTracker Emerald & Rose solid bars with click support */}
              <Bar
                dataKey="income"
                fill="#046C4E"
                radius={[3, 3, 0, 0]}
                maxBarSize={15}
                onClick={(entry) => handleBarClick(entry)}
              />
              <Bar
                dataKey="expense"
                fill="#C1123A"
                radius={[3, 3, 0, 0]}
                maxBarSize={15}
                onClick={(entry) => handleBarClick(entry)}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Month Selector Buttons */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 10, marginTop: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Pilih Rincian Bulan:
            </span>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('analytics')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  cursor: 'pointer',
                }}
              >
                <span>Buka Analitik</span>
                <ChevronRight size={12} />
              </button>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              gap: 6,
              overflowX: 'auto',
              scrollbarWidth: 'none',
              paddingBottom: 2,
            }}
          >
            {data.map((item, idx) => {
              const isCurrent = idx === data.length - 1;
              return (
                <button
                  key={`${item.year}-${item.month}`}
                  type="button"
                  onClick={() => setSelectedMonthModal(item)}
                  style={{
                    flexShrink: 0,
                    padding: '4px 9px',
                    borderRadius: 'var(--radius-full)',
                    border: '2px solid var(--border-subtle)',
                    backgroundColor: isCurrent ? '#111111' : '#FFFFFF',
                    color: isCurrent ? '#FFFFFF' : 'var(--text-secondary)',
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    transition: 'all 0.15s ease',
                  }}
                  title={`Klik untuk melihat detail pengeluaran ${item.fullName || item.name}`}
                >
                  <PieChartIcon size={10} color={isCurrent ? '#FFFFFF' : 'var(--text-muted)'} />
                  <span>{item.name}</span>
                  {item.expense > 0 && (
                    <span style={{ fontSize: '0.625rem', opacity: isCurrent ? 0.9 : 0.7 }}>
                      • {formatCompact(item.expense)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Detail Modal for Selected Month */}
      <AnimatePresence>
        {selectedMonthModal && (
          <MonthlyExpenseDetailModal
            monthData={selectedMonthModal}
            onClose={() => setSelectedMonthModal(null)}
            onOpenInAnalytics={() => handleOpenAnalyticsForMonth(selectedMonthModal)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default MonthlyChart;
