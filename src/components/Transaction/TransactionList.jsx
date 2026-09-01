import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Trash2, Inbox, RotateCcw, X } from 'lucide-react';
import useStore from '../../store/useStore';
import { getCategoryById, getWalletById } from '../../utils/categories';
import { formatIDR, groupByDate, isToday, isYesterday, formatDate } from '../../utils/formatters';
import AppIcon from '../Common/AppIcon';

const TransactionItem = ({ tx, onDelete, extraCategories = [] }) => {
  const cat = getCategoryById(tx.category, extraCategories);
  const wallet = getWalletById(tx.wallet);
  const isIncome = tx.type === 'income';
  const [showDelete, setShowDelete] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16, height: 0 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 0',
        borderBottom: '1px solid #F3ECE0',
        cursor: 'pointer',
      }}
      onClick={() => setShowDelete(!showDelete)}
    >
      <div
        style={{
          width: 42,
          height: 42,
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap', marginTop: 2 }}>
          <span
            style={{
              fontSize: '0.6875rem',
              color: cat.color,
              fontWeight: 600,
              backgroundColor: cat.colorBg,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              border: `1px solid ${cat.color}25`,
            }}
          >
            {cat.label}
          </span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{wallet.label}</span>
          {tx.tags && tx.tags.map((t) => (
            <span
              key={t}
              style={{
                fontSize: '0.625rem',
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-card-subtle)',
                border: '1px solid var(--border-subtle)',
                padding: '1px 6px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 500,
              }}
            >
              #{t}
            </span>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {showDelete ? (
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
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-expense-bg)',
              border: '1px solid rgba(217, 106, 135, 0.3)',
              color: 'var(--color-expense)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
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
              {isIncome ? '+' : '-'}{tx.wallet === 'paypal' || tx.currency === 'USD' ? `$ ${parseFloat(tx.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : formatIDR(tx.amount)}
            </div>
            {tx.wallet === 'paypal' || tx.currency === 'USD' ? (
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                ≈ {formatIDR(parseFloat(tx.amount || 0) * (tx.exchangeRate || 16250))}
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const TransactionList = () => {
  const transactions = useStore((s) => s.transactions);
  const deleteTransaction = useStore((s) => s.deleteTransaction);
  const expenseCategories = useStore((s) => s.expenseCategories || []);
  const incomeCategories = useStore((s) => s.incomeCategories || []);
  const allCategories = [...expenseCategories, ...incomeCategories];

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filtered = transactions.filter((tx) => {
    const cleanSearch = search.toLowerCase().replace(/^#/, '');
    const matchSearch =
      !search ||
      tx.note?.toLowerCase().includes(cleanSearch) ||
      getCategoryById(tx.category, allCategories).label.toLowerCase().includes(cleanSearch) ||
      tx.tags?.some((t) => t.toLowerCase().includes(cleanSearch));
    const matchType = filterType === 'all' || tx.type === filterType;
    return matchSearch && matchType;
  });

  const grouped = groupByDate(filtered);

  const getDateLabel = (dateKey) => {
    if (isToday(dateKey)) return 'Hari Ini';
    if (isYesterday(dateKey)) return 'Kemarin';
    return formatDate(dateKey);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 style={{ fontSize: '1.375rem' }}>Transaksi</h1>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
          }}
        />
        <input
          type="text"
          placeholder="Cari transaksi atau kategori..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: 40, paddingRight: search ? 36 : 14 }}
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 4,
            }}
            aria-label="Hapus pencarian"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Filter Tabs (Solid Pastel) + Reset Filter */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            ['all', 'Semua'],
            ['expense', 'Pengeluaran'],
            ['income', 'Pemasukan'],
          ].map(([val, label]) => {
            const isActive = filterType === val;
            return (
              <button
                key={val}
                onClick={() => setFilterType(val)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  border: `1.5px solid ${isActive ? 'var(--text-primary)' : 'var(--border-subtle)'}`,
                  backgroundColor: isActive ? 'var(--bg-card-subtle)' : '#FFFFFF',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {(search !== '' || filterType !== 'all') && (
          <button
            onClick={() => {
              setSearch('');
              setFilterType('all');
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '5px 10px',
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
            <RotateCcw size={11} /> Reset Filter
          </button>
        )}
      </div>

      {/* Transaction Groups */}
      <AnimatePresence>
        {grouped.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 'var(--radius-lg)',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                color: 'var(--text-muted)',
              }}
            >
              <Inbox size={26} />
            </div>
            <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-secondary)' }}>Tidak ada transaksi</div>
            <div style={{ fontSize: '0.8125rem' }}>Coba ubah filter pencarian Anda</div>
          </motion.div>
        ) : (
          grouped.map(([dateKey, txs]) => (
            <motion.div key={dateKey} layout style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {getDateLabel(dateKey)}
                </span>
                <span className="amount" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  {formatIDR(
                    txs.reduce((sum, tx) => sum + (tx.type === 'expense' ? -tx.amount : tx.amount), 0)
                  )}
                </span>
              </div>
              <div className="glass-card" style={{ padding: '0 16px' }}>
                <AnimatePresence>
                  {txs.map((tx) => (
                    <TransactionItem key={tx.id} tx={tx} onDelete={deleteTransaction} extraCategories={allCategories} />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </div>
  );
};

export default TransactionList;
