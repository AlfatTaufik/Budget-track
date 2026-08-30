import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Sparkles, TrendingDown, TrendingUp } from 'lucide-react';
import useStore from '../../store/useStore';
import { CATEGORY_ICON_OPTIONS, CATEGORY_COLOR_OPTIONS } from '../../utils/categories';
import AppIcon from '../Common/AppIcon';

const AddCategoryModal = ({ onClose, defaultType = 'expense', onCreated }) => {
  const addCategory = useStore((s) => s.addCategory);

  const [type, setType] = useState(defaultType);
  const [label, setLabel] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(CATEGORY_ICON_OPTIONS[0].name);
  const [selectedColor, setSelectedColor] = useState(CATEGORY_COLOR_OPTIONS[0]);

  const handleSave = (e) => {
    e.preventDefault();
    if (!label.trim()) return;

    const created = addCategory({
      type,
      label: label.trim(),
      iconName: selectedIcon,
      color: selectedColor.hex,
      colorBg: selectedColor.bg,
      colorBorder: selectedColor.border,
    });

    if (onCreated) {
      onCreated(created);
    }
    onClose();
  };

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ zIndex: 110 }}
    >
      <motion.div
        className="modal-sheet"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
        style={{ padding: '0 18px 24px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
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
            padding: '4px 0 14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#18181B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
              }}
            >
              <Sparkles size={13} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--text-primary)' }}>
              Tambah Kategori Baru
            </h2>
          </div>
          <button className="btn-icon" onClick={onClose} style={{ width: 32, height: 32 }} type="button">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSave} style={{ overflowY: 'auto', flex: 1, paddingBottom: 8 }}>
          {/* Type Toggle */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--bg-card-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: 3,
              gap: 4,
              marginBottom: 14,
            }}
          >
            <button
              type="button"
              onClick={() => setType('expense')}
              style={{
                flex: 1,
                padding: '7px 0',
                borderRadius: 'var(--radius-sm)',
                border: type === 'expense' ? '1px solid #FECDD3' : '1px solid transparent',
                cursor: 'pointer',
                backgroundColor: type === 'expense' ? '#FFF1F2' : 'transparent',
                color: type === 'expense' ? '#9F1239' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                transition: 'all 0.15s',
              }}
            >
              <TrendingDown size={13} color="#E11D48" /> Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              style={{
                flex: 1,
                padding: '7px 0',
                borderRadius: 'var(--radius-sm)',
                border: type === 'income' ? '1px solid #A7F3D0' : '1px solid transparent',
                cursor: 'pointer',
                backgroundColor: type === 'income' ? '#ECFDF5' : 'transparent',
                color: type === 'income' ? '#065F46' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                transition: 'all 0.15s',
              }}
            >
              <TrendingUp size={13} color="#059669" /> Pemasukan
            </button>
          </div>

          {/* Category Name */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Nama Kategori
            </label>
            <input
              type="text"
              placeholder="Contoh: Skincare, Zakat & Sedekah, Hewan Peliharaan..."
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
              maxLength={30}
              autoFocus
            />
          </div>

          {/* Icon Selector Grid */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Pilih Ikon
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: 6,
                maxHeight: 140,
                overflowY: 'auto',
                padding: '2px',
              }}
            >
              {CATEGORY_ICON_OPTIONS.map((item) => {
                const isSelected = selectedIcon === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setSelectedIcon(item.name)}
                    style={{
                      padding: '8px 4px',
                      borderRadius: 'var(--radius-sm)',
                      border: `1.5px solid ${isSelected ? selectedColor.hex : 'var(--border-subtle)'}`,
                      backgroundColor: isSelected ? selectedColor.bg : '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 3,
                      transition: 'all 0.15s',
                    }}
                    title={item.label}
                  >
                    <AppIcon name={item.name} size={17} color={isSelected ? selectedColor.hex : '#71717A'} />
                    <span style={{ fontSize: '0.5625rem', color: isSelected ? selectedColor.hex : 'var(--text-secondary)', fontWeight: isSelected ? 700 : 500 }}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Palette Selector */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Warna Tema
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {CATEGORY_COLOR_OPTIONS.map((c) => {
                const isSelected = selectedColor.hex === c.hex;
                return (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      backgroundColor: c.hex,
                      border: isSelected ? '3px solid #FFFFFF' : 'none',
                      boxShadow: isSelected ? '0 0 0 2px var(--text-primary)' : '0 1px 3px rgba(0,0,0,0.1)',
                      cursor: 'pointer',
                      transition: 'transform 0.1s',
                      transform: isSelected ? 'scale(1.1)' : 'none',
                    }}
                    aria-label={c.label}
                  />
                );
              })}
            </div>
          </div>

          {/* Preview Box */}
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: selectedColor.bg,
              border: `1px solid ${selectedColor.border}`,
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 18,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#FFFFFF',
                border: `1px solid ${selectedColor.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AppIcon name={selectedIcon} size={18} color={selectedColor.hex} />
            </div>
            <div>
              <div style={{ fontSize: '0.625rem', color: selectedColor.hex, fontWeight: 700, textTransform: 'uppercase' }}>
                Pratinjau Kategori
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {label || 'Nama Kategori'}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              style={{ flex: 1, height: 42 }}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 2, height: 42 }}
            >
              <Save size={15} /> Simpan Kategori
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AddCategoryModal;
