import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, RotateCcw } from 'lucide-react';
import useStore from '../../store/useStore';
import AppIcon from '../Common/AppIcon';

const PRESETS = [
  { iconName: 'ShieldCheck', label: 'Darurat' },
  { iconName: 'Laptop', label: 'Gadget' },
  { iconName: 'Palmtree', label: 'Liburan' },
  { iconName: 'Camera', label: 'Hobi' },
  { iconName: 'Car', label: 'Kendaraan' },
  { iconName: 'GraduationCap', label: 'Edukasi' },
  { iconName: 'Building2', label: 'Properti' },
  { iconName: 'Coins', label: 'Investasi' },
  { iconName: 'Target', label: 'Lainnya' },
  { iconName: 'Sparkles', label: 'Impian' },
];

const COLORS = [
  { hex: '#059669', bg: '#ECFDF5', border: '#A7F3D0', label: 'Emerald' },
  { hex: '#4F46E5', bg: '#EEF2FF', border: '#C7D2FE', label: 'Indigo' },
  { hex: '#0284C7', bg: '#F0F9FF', border: '#BAE6FD', label: 'Sky' },
  { hex: '#D97706', bg: '#FFFBEB', border: '#FDE68A', label: 'Amber' },
  { hex: '#E11D48', bg: '#FFF1F2', border: '#FECDD3', label: 'Rose' },
  { hex: '#7E22CE', bg: '#FAF5FF', border: '#E9D5FF', label: 'Purple' },
  { hex: '#DB2777', bg: '#FDF2F8', border: '#FBCFE8', label: 'Pink' },
];

const AddGoalModal = ({ onClose }) => {
  const addGoal = useStore((s) => s.addGoal);

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(PRESETS[0].iconName);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  const handleReset = () => {
    setName('');
    setTargetAmount('');
    setDeadline('');
    setSelectedIcon(PRESETS[0].iconName);
    setSelectedColor(COLORS[0]);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(targetAmount);
    if (!name || isNaN(parsedAmount) || parsedAmount <= 0) return;

    addGoal({
      name,
      targetAmount: parsedAmount,
      iconName: selectedIcon,
      color: selectedColor.hex,
      colorBg: selectedColor.bg,
      colorBorder: selectedColor.border,
      deadline: deadline || null,
    });
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
        transition={{ type: 'spring', damping: 30, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
        style={{ padding: '0 18px 24px' }}
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
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--text-primary)' }}>
            Tambah Kantong Tabungan
          </h2>
          <button className="btn-icon" onClick={onClose} style={{ width: 32, height: 32 }} type="button">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          {/* Goal Name */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Nama Target Tabungan
            </label>
            <input
              type="text"
              placeholder="Contoh: Dana Darurat Mandiri, Liburan Bali..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={40}
            />
          </div>

          {/* Target Amount */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Nominal Target (Rp)
            </label>
            <input
              type="number"
              placeholder="Contoh: 15000000"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              required
              min="1"
            />
          </div>

          {/* Deadline */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Tenggat Waktu (Opsional)
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          {/* Icon Grid */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Pilih Ikon
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
              {PRESETS.map((preset) => {
                const isSelected = selectedIcon === preset.iconName;
                return (
                  <button
                    key={preset.iconName}
                    type="button"
                    onClick={() => setSelectedIcon(preset.iconName)}
                    style={{
                      padding: '8px 4px',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${isSelected ? selectedColor.hex : 'var(--border-subtle)'}`,
                      backgroundColor: isSelected ? selectedColor.bg : '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                      transition: 'all 0.15s',
                    }}
                  >
                    <AppIcon name={preset.iconName} size={16} color={isSelected ? selectedColor.hex : '#71717A'} />
                    <span style={{ fontSize: '0.5625rem', color: isSelected ? selectedColor.hex : 'var(--text-secondary)', fontWeight: isSelected ? 700 : 500 }}>
                      {preset.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Choices */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Warna Tema
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {COLORS.map((c) => {
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

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleReset}
              style={{ flex: 1, height: 42, padding: '0 12px' }}
            >
              <RotateCcw size={15} /> Reset
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 2, height: 42, padding: '0 16px' }}
            >
              <Save size={16} /> Simpan Target
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AddGoalModal;
