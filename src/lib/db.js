import supabase from './supabase';

// ── Transactions ─────────────────────────────────────
export const fetchTransactions = async (userId) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  if (error) throw error;
  return data;
};

export const insertTransaction = async (tx, userId) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert([{ ...tx, user_id: userId }])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateTransaction = async (id, tx, userId) => {
  const { data, error } = await supabase
    .from('transactions')
    .update({ ...tx })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteTransactionById = async (id, userId) => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
};

// ── Budgets ───────────────────────────────────────────
export const fetchBudgets = async (userId) => {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return data;
};

export const upsertBudget = async (category, limit_amount, userId) => {
  const { data, error } = await supabase
    .from('budgets')
    .upsert([{ user_id: userId, category, limit_amount }], { onConflict: 'user_id,category' })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteBudget = async (category, userId) => {
  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('category', category)
    .eq('user_id', userId);
  if (error) throw error;
};

// ── Goals ─────────────────────────────────────────────
export const fetchGoals = async (userId) => {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
};

export const insertGoal = async (goal, userId) => {
  const { data, error } = await supabase
    .from('goals')
    .insert([{ ...goal, user_id: userId }])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateGoalSaved = async (goalId, savedAmount, userId) => {
  const { data, error } = await supabase
    .from('goals')
    .update({ saved_amount: savedAmount })
    .eq('id', goalId)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteGoalById = async (goalId, userId) => {
  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', goalId)
    .eq('user_id', userId);
  if (error) throw error;
};

// ── Wallet Balances ───────────────────────────────────
export const fetchWalletBalances = async (userId) => {
  const { data, error } = await supabase
    .from('wallet_balances')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  // Convert array to object: { cash: 850000, bca: 12000000, ... }
  const obj = {};
  data.forEach((row) => { obj[row.wallet_id] = parseFloat(row.balance); });
  return obj;
};

export const upsertWalletBalance = async (walletId, balance, userId) => {
  const { error } = await supabase
    .from('wallet_balances')
    .upsert([{ user_id: userId, wallet_id: walletId, balance }], { onConflict: 'user_id,wallet_id' });
  if (error) throw error;
};

// ── Investments ───────────────────────────────────────
export const fetchInvestments = async (userId) => {
  const { data, error } = await supabase
    .from('investments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
};

export const insertInvestment = async (inv, userId) => {
  const { data, error } = await supabase
    .from('investments')
    .insert([{ ...inv, user_id: userId }])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateInvestmentAmount = async (invId, amount, userId) => {
  const { data, error } = await supabase
    .from('investments')
    .update({ amount })
    .eq('id', invId)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteInvestmentById = async (invId, userId) => {
  const { error } = await supabase
    .from('investments')
    .delete()
    .eq('id', invId)
    .eq('user_id', userId);
  if (error) throw error;
};

// ── Custom Categories ────────────────────────────────
export const fetchCategories = async (userId) => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) {
    console.warn('fetchCategories warning (table may not exist yet, using metadata/localStorage):', error.message);
    return [];
  }
  return data || [];
};

export const insertCategory = async (cat, userId) => {
  const { data, error } = await supabase
    .from('categories')
    .upsert([{
      id: cat.id,
      user_id: userId,
      type: cat.type || 'expense',
      label: cat.label,
      icon: cat.iconName || 'Tag',
      color: cat.color || '#4F46E5',
      color_bg: cat.colorBg || '#EEF2FF',
      color_border: cat.colorBorder || '#C7D2FE',
    }], { onConflict: 'id' })
    .select()
    .single();
  if (error) {
    console.warn('insertCategory warning:', error.message);
    return null;
  }
  return data;
};

export const deleteCategoryById = async (catId, userId) => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', catId)
    .eq('user_id', userId);
  if (error) {
    console.warn('deleteCategoryById warning:', error.message);
  }
};

// ── Auth ──────────────────────────────────────────────
export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// ── Permanent Data Wipe ───────────────────────────────
export const deleteAllUserData = async (userId) => {
  const tables = ['transactions', 'budgets', 'goals', 'investments', 'wallet_balances'];
  await Promise.allSettled([
    ...tables.map((table) =>
      supabase
        .from(table)
        .delete()
        .eq('user_id', userId)
    ),
    supabase.from('wallet_balances').update({ balance: 0 }).eq('user_id', userId),
  ]);
};
