import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import useStore from '../../store/useStore';
import { formatIDR, formatCompact } from '../../utils/formatters';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
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
      </div>
    );
  }
  return null;
};

const MonthlyChart = () => {
  const getLast6MonthsData = useStore((s) => s.getLast6MonthsData);
  const data = getLast6MonthsData();

  return (
    <motion.div
      className="glass-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.3 }}
      style={{ padding: '16px 14px 10px', marginBottom: 16 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ fontSize: '0.875rem', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          Arus Kas 6 Bulan
        </h3>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.6875rem', color: '#065F46', fontWeight: 600, backgroundColor: '#ECFDF5', padding: '2px 6px', borderRadius: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#059669' }} /> Masuk
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.6875rem', color: '#9F1239', fontWeight: 600, backgroundColor: '#FFF1F2', padding: '2px 6px', borderRadius: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#E11D48' }} /> Keluar
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={165}>
        <BarChart data={data} barCategoryGap="30%" barGap={3}>
          <CartesianGrid vertical={false} stroke="#E4E4E7" strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#71717A', fontSize: 11, fontFamily: 'var(--font-body)' }}
          />
          <YAxis
            tickFormatter={(v) => (v > 0 ? formatIDR(v) : '0')}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#71717A', fontSize: 9, fontFamily: 'var(--font-body)' }}
            width={68}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(24, 24, 27, 0.04)', radius: 4 }} />
          {/* StudyTracker Emerald & Rose solid bars */}
          <Bar dataKey="income" fill="#059669" radius={[3, 3, 0, 0]} maxBarSize={15} />
          <Bar dataKey="expense" fill="#E11D48" radius={[3, 3, 0, 0]} maxBarSize={15} />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default MonthlyChart;
