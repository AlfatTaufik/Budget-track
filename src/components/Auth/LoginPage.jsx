import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, Wallet } from 'lucide-react';
import { signIn, signUp } from '../../lib/db';

const LoginPage = ({ onLogin }) => {
  const [mode, setMode] = useState('login'); // login | register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email dan password wajib diisi.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      if (mode === 'login') {
        const { user } = await signIn(email, password);
        if (user) onLogin(user);
      } else {
        const { data, error: err } = await signUp(email, password);
        if (err) throw err;
        if (data?.session && data?.user) {
          onLogin(data.user);
        } else {
          setSuccessMsg('Akun berhasil dibuat! Silakan cek email Anda untuk konfirmasi, atau langsung coba Masuk.');
          setMode('login');
        }
      }
    } catch (err) {
      const msgs = {
        'Invalid login credentials': 'Email atau password salah.',
        'Email not confirmed': 'Email belum dikonfirmasi. Cek inbox/spam email Anda.',
        'User already registered': 'Email ini sudah terdaftar. Silakan login.',
        'Password should be at least 6 characters': 'Password minimal harus 6 karakter.',
      };
      setError(msgs[err.message] || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* StudyTracker Minimalist Branding */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ textAlign: 'center', marginBottom: 28 }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#18181B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            boxShadow: 'var(--shadow-xs)',
            color: '#FFFFFF',
          }}
        >
          <Wallet size={24} strokeWidth={2.2} />
        </div>
        <h1 style={{ fontSize: '1.375rem', letterSpacing: '-0.03em', marginBottom: 3, color: 'var(--text-primary)' }}>
          FlowWallet
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
          Pencatat keuangan pribadi yang simpel & efisien
        </p>
      </motion.div>

      {/* Card Form (StudyTracker Style) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        style={{ width: '100%', maxWidth: 360 }}
      >
        <div className="glass-card" style={{ padding: '20px 18px' }}>
          {/* Tab Toggle */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--bg-card-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: 3,
              marginBottom: 16,
              border: '1px solid var(--border-subtle)',
            }}
          >
            {[
              ['login', 'Masuk'],
              ['register', 'Daftar'],
            ].map(([val, label]) => {
              const isActive = mode === val;
              return (
                <button
                  key={val}
                  onClick={() => {
                    setMode(val);
                    setError('');
                    setSuccessMsg('');
                  }}
                  style={{
                    flex: 1,
                    padding: '7px 0',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                    boxShadow: isActive ? 'var(--shadow-xs)' : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: 12 }}>
              <label
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  display: 'block',
                  marginBottom: 4,
                }}
              >
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={14}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  style={{ paddingLeft: 36 }}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  display: 'block',
                  marginBottom: 4,
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={14}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  style={{ paddingLeft: 36, paddingRight: 38 }}
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: 4,
                  }}
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Messages */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    backgroundColor: '#FFF1F2',
                    border: '1px solid #FECDD3',
                    borderRadius: 'var(--radius-md)',
                    padding: '8px 10px',
                    fontSize: '0.75rem',
                    color: '#9F1239',
                    marginBottom: 12,
                    fontWeight: 500,
                  }}
                >
                  {error}
                </motion.div>
              )}
              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    backgroundColor: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    borderRadius: 'var(--radius-md)',
                    padding: '8px 10px',
                    fontSize: '0.75rem',
                    color: '#065F46',
                    marginBottom: 12,
                    fontWeight: 500,
                  }}
                >
                  {successMsg}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button (Zinc-900) */}
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', opacity: loading ? 0.7 : 1, marginBottom: 10 }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Memproses...
                </>
              ) : (
                <>
                  {mode === 'login' ? 'Masuk ke Akun' : 'Buat Akun Baru'} <ArrowRight size={14} />
                </>
              )}
            </button>

            {/* Guest Demo Login Option */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '12px 0 10px' }}>
              <div style={{ flex: 1, height: 1, backgroundColor: 'var(--border-subtle)' }} />
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>atau</span>
              <div style={{ flex: 1, height: 1, backgroundColor: 'var(--border-subtle)' }} />
            </div>

            <button
              type="button"
              onClick={() => {
                onLogin({ id: 'demo_user', email: 'guest@flowwallet.app' });
              }}
              style={{
                width: '100%',
                padding: '9px 0',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontWeight: 600,
                fontSize: '0.8125rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              ✨ Masuk Mode Demo (Tanpa Akun)
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 14, fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
          Data tersinkronisasi aman dengan Supabase Cloud & Local Storage
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
