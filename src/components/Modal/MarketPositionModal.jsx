import React from 'react';
import { motion } from 'framer-motion';
import { X, Save } from 'lucide-react';
import useStore from '../../store/useStore';
import MarketPositionFields, { useMarketPosition } from '../Common/MarketPositionFields';

// Edits units / average price of a market investment, or turns a manual ETF/Saham entry into one.
// Never touches the wallet: it only re-describes what is already owned.
const MarketPositionModal = ({ inv, onClose }) => {
  const updateInvestmentPosition = useStore((s) => s.updateInvestmentPosition);
  const usdRate = useStore((s) => s.usdRate);
  const pos = useMarketPosition(inv);
  const converting = !inv.symbol;

  const handleSave = (e) => {
    e.preventDefault();
    if (!pos.valid) return;
    updateInvestmentPosition(inv.id, pos.position);
    onClose();
  };

  return (
    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        className="modal-sheet"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
        style={{ padding: '0 18px 24px', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: 'var(--border-medium)' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0 14px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--text-primary)' }}>
            {converting ? 'Atur harga otomatis' : 'Ubah posisi'}: {inv.name}
          </h2>
          <button className="btn-icon" onClick={onClose} style={{ width: 32, height: 32 }} type="button" aria-label="Tutup">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <MarketPositionFields pos={pos} usdRate={usdRate} />
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: 16 }}>
            Saldo dompet tidak berubah. Nilai investasi mengikuti harga pasar.
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!pos.valid}
            style={{ width: '100%', height: 42, opacity: pos.valid ? 1 : 0.5 }}
          >
            <Save size={16} /> Simpan
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default MarketPositionModal;
