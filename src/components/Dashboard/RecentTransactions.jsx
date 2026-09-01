import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Trash2 } from 'lucide-react';
import useStore from '../../store/useStore';
import { getCategoryById, getWalletById } from '../../utils/categories';
import { formatIDR, formatDateShort } from '../../utils/formatters';
import AppIcon from '../Common/AppIcon';

const TransactionItem = ({ tx, style, extraCategories = [], onDelete }) => {
  const cat = getCategoryById(tx.category, extraCategories);
  const wallet = getWalletById(tx.wallet);
  const isIncome = tx.type === 'income';
  const [showDelete, setShowDelete] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16, height: 0 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '11px 0',
        borderBottom: '1px solid #F3ECE0',
        cursor: 'pointer',
        ...style,
      }}
      onClick={() => setShowDelete(!showDelete)}
      title="Klik untuk opsi hapus transaksi"
    >
      {/* Lucide Solid Pastel Icon Box */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 'var(--radius-md)',
          backgroundColor: cat.colorBg || '#F5F3FC',
          border: `1px solid ${cat.color}35`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <AppIcon name={cat.iconName} size={18} color={cat.color} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 600,
            fontSize: '0.875rem',
            color: 'var(--text-primary)',
            marginBottom: 2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {tx.note || cat.label}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{cat.label}</span>
          <span style={{ color: 'var(--text-disabled)', fontSize: '0.5625rem' }}>•</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <AppIcon name={wallet.iconName} size={10} color="var(--text-muted)" />
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{wallet.label}</span>
          </div>
          {tx.tags && tx.tags.map((t) => (
            <span
              key={t}
              style={{
                fontSize: '0.5625rem',
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-card-subtle)',
                border: '1px solid var(--border-subtle)',
                padding: '1px 5px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 500,
              }}
            >
              #{t}
            </span>
          ))}
        </div>
      </div>

      {/* Amount or Delete Button */}
      <AnimatePresence mode="wait">
        {showDelete && onDelete ? (
          <motion.button
            key="delete"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Hapus transaksi "${tx.note || cat.label}"?`)) {
                onDelete(tx.id);
              }
            }}
            style={{
              width: 34,
              height: 34,
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#FFF1F2',
              border: '1px solid #FECDD3',
              color: '#E11D48',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            title="Hapus transaksi ini"
          >
            <Trash2 size={15} />
          </motion.button>
        ) : (
          <motion.div
            key="amount"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            style={{ textAlign: 'right', flexShrink: 0 }}
          >
            <div
              className="amount"
              style={{
                fontSize: '0.9375rem',
                color: isIncome ? 'var(--color-income)' : 'var(--color-expense)',
                fontWeight: 700,
              }}
            >
              {isIncome ? '+' : '-'}{formatIDR(tx.amount)}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
              {formatDateShort(tx.date)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const RecentTransactions = ({ onViewAll }) => {
  const transactions = useStore((s) => s.transactions);
  const deleteTransaction = useStore((s) => s.deleteTransaction);
  const expenseCategories = useStore((s) => s.expenseCategories || []);
  const incomeCategories = useStore((s) => s.incomeCategories || []);
  const allCategories = [...expenseCategories, ...incomeCategories];
  const recent = transactions.slice(0, 5);

  return (
    <motion.div
      className="glass-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      style={{ padding: '18px 18px 6px', marginBottom: 18 }}
    >
      <div className="flex-between" style={{ marginBottom: 4 }}>
        <h3 style={{ fontSize: '0.9375rem', fontFamily: 'var(--font-display)' }}>Transaksi Terakhir</h3>
        <button
          onClick={onViewAll}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--brand-purple)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          Lihat Semua <ChevronRight size={14} />
        </button>
      </div>
      {recent.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 12px 18px', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 4 }}>
            Belum ada transaksi
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Tekan tombol <strong>+</strong> di bawah untuk mencatat transaksi pertamamu
          </p>
        </div>
      ) : (
        recent.map((tx) => (
          <TransactionItem key={tx.id} tx={tx} extraCategories={allCategories} onDelete={deleteTransaction} />
        ))
      )}
    </motion.div>
  );
};

export { TransactionItem };
export default RecentTransactions;
