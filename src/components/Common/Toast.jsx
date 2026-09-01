import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X, Undo2 } from 'lucide-react';
import useStore from '../../store/useStore';

const Toast = () => {
  const toast = useStore((s) => s.toast);
  const hideToast = useStore((s) => s.hideToast);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          style={{
            position: 'fixed',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 14px 8px 16px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: toast.type === 'error' ? '#FFF1F2' : '#18181B',
            color: toast.type === 'error' ? '#9F1239' : '#FFFFFF',
            border: toast.type === 'error' ? '1px solid #FECDD3' : '1px solid #27272A',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            maxWidth: '92vw',
          }}
        >
          {toast.type === 'error' ? (
            <AlertCircle size={16} color="#E11D48" style={{ flexShrink: 0 }} />
          ) : toast.type === 'info' ? (
            <Info size={16} color="#38BDF8" style={{ flexShrink: 0 }} />
          ) : (
            <CheckCircle2 size={16} color="#34D399" style={{ flexShrink: 0 }} />
          )}

          <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {toast.message}
          </span>

          {toast.action && (
            <button
              type="button"
              onClick={() => {
                toast.action.onClick?.();
                hideToast();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: '#3B82F6',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                flexShrink: 0,
                transition: 'all 0.15s',
              }}
            >
              <Undo2 size={12} /> {toast.action.label || 'Undo'}
            </button>
          )}

          <button
            onClick={hideToast}
            style={{
              background: 'none',
              border: 'none',
              color: toast.type === 'error' ? '#9F1239' : '#A1A1AA',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: 2,
              flexShrink: 0,
            }}
            aria-label="Tutup notifikasi"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;

