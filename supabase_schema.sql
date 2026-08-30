-- ══════════════════════════════════════════════════════
-- FlowWallet — Supabase Database Schema
-- Jalankan script ini di Supabase SQL Editor
-- (Dashboard → SQL Editor → New Query → Paste → Run)
-- ══════════════════════════════════════════════════════

-- Enable UUID extension (sudah aktif by default di Supabase)
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── 1. Tabel Transactions ─────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL,
  wallet TEXT NOT NULL,
  note TEXT,
  date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. Tabel Budgets ──────────────────────────────────
CREATE TABLE IF NOT EXISTS budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  limit_amount NUMERIC(15, 2) NOT NULL CHECK (limit_amount > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category)
);

-- ── 3. Tabel Goals (Kantong Tabungan) ─────────────────
CREATE TABLE IF NOT EXISTS goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '🎯',
  target_amount NUMERIC(15, 2) NOT NULL CHECK (target_amount > 0),
  saved_amount NUMERIC(15, 2) DEFAULT 0 CHECK (saved_amount >= 0),
  color TEXT NOT NULL DEFAULT '#9B8FD4',
  deadline DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4. Tabel Wallet Balances ──────────────────────────
CREATE TABLE IF NOT EXISTS wallet_balances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  wallet_id TEXT NOT NULL,
  balance NUMERIC(15, 2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, wallet_id)
);

-- ── 5. Tabel Investments ──────────────────────────────
CREATE TABLE IF NOT EXISTS investments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════
-- Row Level Security (RLS) — wajib untuk keamanan
-- Setiap user hanya bisa akses & ubah data miliknya sendiri
-- ══════════════════════════════════════════════════════

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

-- RLS Policies untuk transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies untuk budgets
CREATE POLICY "Users can view own budgets"
  ON budgets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upsert own budgets"
  ON budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own budgets"
  ON budgets FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies untuk goals
CREATE POLICY "Users can view own goals"
  ON goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals"
  ON goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals"
  ON goals FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies untuk wallet_balances
CREATE POLICY "Users can view own wallet balances"
  ON wallet_balances FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upsert own wallet balances"
  ON wallet_balances FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own wallet balances"
  ON wallet_balances FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies untuk investments
CREATE POLICY "Users can view own investments"
  ON investments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own investments"
  ON investments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own investments"
  ON investments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own investments"
  ON investments FOR DELETE USING (auth.uid() = user_id);

-- ══════════════════════════════════════════════════════
-- Index untuk performa query
-- ══════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON transactions(user_id, type);
CREATE INDEX IF NOT EXISTS idx_budgets_user ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_balances_user ON wallet_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_user ON investments(user_id);
