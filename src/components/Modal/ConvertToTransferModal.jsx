import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ArrowRight, ArrowLeftRight, Check } from 'lucide-react';
import useStore from '../../store/useStore';
import { WALLETS } from '../../utils/categories';
import { formatIDR, formatUSD } from '../../utils/formatters';
import AppIcon from '../Common/AppIcon';

const ConvertToTransferModal = ({ tx, onClose }) => {
  const convertToTransfer = useStore((s) => s.convertToTransfer);
  const sourceWallet = WALLETS.find((w) => w.id === tx.wallet) || WALLETS[0];
  const availableDestinations = WALLETS.filter((w) => w.id !== tx.wallet);
  const [toWallet, setToWallet] = useState(availableDestinations[0]?.id || 'gopay');
  const usdRate = useStore((s) => s.usdRate || 16250);

  if (!tx) return null;

  const isUsd = tx.wallet === 'paypal' || tx.currency === 'USD';
  const targetWalletObj = WALLETS.find((w) => w.id === toWallet);

  const handleConfirm = () => {
    if (!toWallet) return;
    convertToTransfer(tx.id, toWallet);
    onClose();
  };

  return (
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
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '85vh', overflowY: 'auto' }}
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
            padding: '10px 18px 14px',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#EEF2FF',
                color: '#4F46E5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ArrowLeftRight size={15} />
            </div>
            <div>
              <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Ubah ke Transfer Antar Rekening
              </h2>
              <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                Koreksi transaksi pengeluaran menjadi perpindahan saldo internal
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Tutup">
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '16px 18px 24px' }}>
          {/* Visual Transfer Flow Card */}
          <div
            style={{
              padding: '14px 16px',
              backgroundColor: '#F8FAFC',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: sourceWallet.colorBg || '#F4F4F5',
                    border: `1px solid ${sourceWallet.colorBorder || '#E4E4E7'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AppIcon name={sourceWallet.iconName} size={13} color={sourceWallet.color} />
                </div>
                <div>
                  <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 600 }}>DARI (ASAL)</div>
                  <strong style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{sourceWallet.label}</strong>
                </div>
              </div>

              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: '#EEF2FF',
                  color: '#4F46E5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ArrowRight size={15} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, textAlign: 'right' }}>
                <div>
                  <div style={{ fontSize: '0.625rem', color: '#4F46E5', fontWeight: 600 }}>KE (TUJUAN)</div>
                  <strong style={{ fontSize: '0.8125rem', color: '#4338CA' }}>
                    {targetWalletObj?.label || 'Pilih Rekening'}
                  </strong>
                </div>
                {targetWalletObj && (
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      backgroundColor: targetWalletObj.colorBg || '#F4F4F5',
                      border: `1px solid ${targetWalletObj.colorBorder || '#E4E4E7'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <AppIcon name={targetWalletObj.iconName} size={13} color={targetWalletObj.color} />
                  </div>
                )}
              </div>
            </div>

            <div
              style={{
                paddingTop: 10,
                borderTop: '1px dashed var(--border-medium)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Nominal Dipindahkan:</span>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {isUsd ? formatUSD(tx.amount) : formatIDR(tx.amount)}
                </span>
                {isUsd && (
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    ≈ {formatIDR(tx.amount * usdRate)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Destination Selector */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
              Pilih Rekening / Dompet Tujuan:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {availableDestinations.map((w) => {
                const isSelected = toWallet === w.id;
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setToWallet(w.id)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${isSelected ? '#4F46E5' : 'var(--border-subtle)'}`,
                      backgroundColor: isSelected ? '#EEF2FF' : '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s',
                      boxShadow: 'var(--shadow-xs)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          backgroundColor: w.colorBg || '#F4F4F5',
                          border: `1px solid ${w.colorBorder || '#E4E4E7'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <AppIcon name={w.iconName} size={12} color={w.color} />
                      </div>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: isSelected ? 700 : 500,
                          color: isSelected ? '#3730A3' : 'var(--text-primary)',
                        }}
                      >
                        {w.label}
                      </span>
                    </div>
                    {isSelected && <Check size={14} color="#4F46E5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Educational Note */}
          <div
            style={{
              padding: '10px 12px',
              backgroundColor: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.75rem',
              color: '#166534',
              lineHeight: 1.4,
              marginBottom: 20,
            }}
          >
            💡 <strong>Keuntungan Transfer:</strong> Transaksi ini <strong>TIDAK</strong> lagi dihitung sebagai pengeluaran bulanan dan <strong>TIDAK</strong> memotong jatah amplop belanja Anda.
          </div>

          {/* Action Button */}
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleConfirm}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#4F46E5',
              borderColor: '#4338CA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            <ArrowLeftRight size={16} /> Konfirmasi Jadi Transfer
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ConvertToTransferModal;
