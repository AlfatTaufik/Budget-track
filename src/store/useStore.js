import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SAMPLE_TRANSACTIONS, SAMPLE_BUDGETS, SAMPLE_GOALS, SAMPLE_WALLETS_BALANCE, SAMPLE_INVESTMENTS } from '../utils/sampleData';
import { DEFAULT_TAGS, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/categories';
import * as db from '../lib/db';
import supabase from '../lib/supabase';

// Helper to verify if user ID is a valid Supabase UUID
const isValidUUID = (str) =>
  typeof str === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

const useStore = create(
  persist(
    (set, get) => ({
      // --- Auth State ---
      user: null,
      authLoading: true,

      setUser: async (user) => {
        set({ user });
        if (user && isValidUUID(user.id)) {
          await get().loadUserData(user.id);
        }
      },
      setAuthLoading: (authLoading) => set({ authLoading }),

      // --- Toast Notification State ---
      toast: null,
      showToast: (message, type = 'success') => {
        const id = Date.now();
        set({ toast: { message, type, id } });
        setTimeout(() => {
          if (get().toast?.id === id) {
            set({ toast: null });
          }
        }, 3000);
      },
      hideToast: () => set({ toast: null }),

      // --- App State ---
      transactions: [],
      budgets: [],
      goals: [],
      investments: [],
      walletBalances: { cash: 0, bca: 0, mandiri: 0, paypal: 0, gopay: 0, ovo: 0, shopeepay: 0, dana: 0 },
      tags: DEFAULT_TAGS,
      expenseCategories: EXPENSE_CATEGORIES,
      incomeCategories: INCOME_CATEGORIES,
      balanceVisible: true,
      dataLoaded: false,

      // --- Load Data from Supabase (Single Source of Truth) ---
      loadUserData: async (userId) => {
        if (!isValidUUID(userId)) {
          set({ dataLoaded: true });
          return;
        }
        try {
          const [transactions, budgets, goals, walletBalances, investments] = await Promise.all([
            db.fetchTransactions(userId).catch((err) => {
              console.warn('fetchTransactions error:', err);
              return [];
            }),
            db.fetchBudgets(userId).catch((err) => {
              console.warn('fetchBudgets error:', err);
              return [];
            }),
            db.fetchGoals(userId).catch((err) => {
              console.warn('fetchGoals error:', err);
              return [];
            }),
            db.fetchWalletBalances(userId).catch((err) => {
              console.warn('fetchWalletBalances error:', err);
              return {};
            }),
            db.fetchInvestments(userId).catch((err) => {
              console.warn('fetchInvestments error:', err);
              return [];
            }),
          ]);

          const formattedTxs = (transactions || []).map((tx) => ({
            ...tx,
            amount: parseFloat(tx.amount),
          }));

          const formattedBudgets = (budgets || []).map((b) => ({
            ...b,
            limit: parseFloat(b.limit_amount),
            category: b.category,
          }));

          const formattedGoals = (goals || []).map((g) => ({
            ...g,
            targetAmount: parseFloat(g.target_amount),
            savedAmount: parseFloat(g.saved_amount),
            iconName: g.icon || 'Target',
            color: g.color || '#4F46E5',
          }));

          const formattedInvestments = (investments || []).map((inv) => ({
            ...inv,
            amount: parseFloat(inv.amount),
          }));

          const defaultBalances = { cash: 0, bca: 0, mandiri: 0, paypal: 0, gopay: 0, ovo: 0, shopeepay: 0, dana: 0 };
          const mergedBalances = { ...defaultBalances, ...(walletBalances || {}) };

          set({
            transactions: formattedTxs,
            budgets: formattedBudgets,
            goals: formattedGoals,
            investments: formattedInvestments,
            walletBalances: mergedBalances,
            dataLoaded: true,
          });
        } catch (error) {
          console.error('Error loading Supabase user data:', error);
          set({ dataLoaded: true });
        }
      },

      // --- Transactions ---
      addTransaction: async (tx) => {
        const user = get().user;
        const usdRate = get().usdRate || 16250;
        const isUsd = tx.wallet === 'paypal' || tx.currency === 'USD';
        const newTx = {
          ...tx,
          currency: isUsd ? 'USD' : 'IDR',
          exchangeRate: isUsd ? (tx.exchangeRate || usdRate) : 1,
          id: `tx_${Date.now()}`,
          date: tx.date || new Date().toISOString(),
        };

        // Instant Local Update
        set((state) => {
          const newBalances = { ...state.walletBalances };
          if (tx.type === 'expense') {
            newBalances[tx.wallet] = (newBalances[tx.wallet] || 0) - tx.amount;
          } else {
            newBalances[tx.wallet] = (newBalances[tx.wallet] || 0) + tx.amount;
          }
          return {
            transactions: [newTx, ...state.transactions],
            walletBalances: newBalances,
          };
        });

        get().showToast(tx.type === 'expense' ? 'Pengeluaran berhasil dicatat! ✨' : 'Pemasukan berhasil dicatat! ✨');

        // Sync to Supabase if valid user
        if (user && isValidUUID(user.id)) {
          try {
            const saved = await db.insertTransaction(
              { type: tx.type, amount: tx.amount, category: tx.category, wallet: tx.wallet, note: tx.note || null, date: newTx.date },
              user.id
            );
            if (saved?.id) {
              set((state) => ({
                transactions: state.transactions.map((t) =>
                  t.id === newTx.id ? { ...t, id: saved.id } : t
                ),
              }));
            }

            // Sync wallet balance to Supabase
            const currentBalance = get().walletBalances[tx.wallet];
            await db.upsertWalletBalance(tx.wallet, currentBalance, user.id);
          } catch (error) {
            console.error('Failed to sync transaction to Supabase:', error);
          }
        }
      },

      deleteTransaction: async (id) => {
        const user = get().user;
        const txToDelete = get().transactions.find((tx) => tx.id === id);

        set((state) => {
          const newBalances = { ...state.walletBalances };
          if (txToDelete) {
            if (txToDelete.type === 'expense') {
              newBalances[txToDelete.wallet] = (newBalances[txToDelete.wallet] || 0) + txToDelete.amount;
            } else {
              newBalances[txToDelete.wallet] = (newBalances[txToDelete.wallet] || 0) - txToDelete.amount;
            }
          }
          return {
            transactions: state.transactions.filter((tx) => tx.id !== id),
            walletBalances: newBalances,
          };
        });

        get().showToast('Transaksi berhasil dihapus.');

        if (user && isValidUUID(user.id)) {
          try {
            await db.deleteTransactionById(id, user.id);
            if (txToDelete) {
              const currentBalance = get().walletBalances[txToDelete.wallet];
              await db.upsertWalletBalance(txToDelete.wallet, currentBalance, user.id);
            }
          } catch (error) {
            console.error('Failed to delete transaction from Supabase:', error);
          }
        }
      },

      // --- Budgets ---
      setBudget: async (category, limit) => {
        const user = get().user;
        set((state) => {
          const existing = state.budgets.find((b) => b.category === category);
          if (existing) {
            return { budgets: state.budgets.map((b) => b.category === category ? { ...b, limit } : b) };
          }
          return { budgets: [...state.budgets, { id: `b_${Date.now()}`, category, limit }] };
        });
        get().showToast('Jatah amplop berhasil disimpan! ✉️');

        if (user && isValidUUID(user.id)) {
          try {
            await db.upsertBudget(category, limit, user.id);
          } catch (error) {
            console.error('Failed to sync budget:', error);
          }
        }
      },

      deleteBudget: async (category) => {
        const user = get().user;
        set((state) => ({
          budgets: state.budgets.filter((b) => b.category !== category),
        }));
        get().showToast('Jatah amplop berhasil dihapus.');

        if (user && isValidUUID(user.id)) {
          try {
            await db.deleteBudget(category, user.id);
          } catch (error) {
            console.error('Failed to delete budget:', error);
          }
        }
      },

      // --- Goals ---
      addGoal: async (goalData) => {
        const user = get().user;
        const tempId = `goal_${Date.now()}`;
        const newGoal = {
          ...goalData,
          id: tempId,
          savedAmount: goalData.savedAmount || 0,
        };

        set((state) => ({
          goals: [...state.goals, newGoal],
        }));
        get().showToast('Kantong tabungan berhasil dibuat! 🎯');

        if (user && isValidUUID(user.id)) {
          try {
            const saved = await db.insertGoal({
              name: goalData.name,
              icon: goalData.iconName || 'Target',
              target_amount: goalData.targetAmount,
              saved_amount: goalData.savedAmount || 0,
              color: goalData.color || '#4F46E5',
              deadline: goalData.deadline || null,
            }, user.id);

            if (saved?.id) {
              set((state) => ({
                goals: state.goals.map((g) =>
                  g.id === tempId
                    ? {
                        ...g,
                        id: saved.id,
                        targetAmount: parseFloat(saved.target_amount),
                        savedAmount: parseFloat(saved.saved_amount),
                      }
                    : g
                ),
              }));
            }
          } catch (error) {
            console.error('Failed to sync new goal to Supabase:', error);
          }
        }
      },

      deleteGoal: async (goalId) => {
        const user = get().user;
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== goalId),
        }));
        get().showToast('Kantong tabungan berhasil dihapus.');

        if (user && isValidUUID(user.id)) {
          try {
            await db.deleteGoalById(goalId, user.id);
          } catch (error) {
            console.error('Failed to delete goal from Supabase:', error);
          }
        }
      },

      addGoalAmount: async (goalId, amount) => {
        const user = get().user;
        const goal = get().goals.find((g) => g.id === goalId);
        if (!goal) return;
        const newSaved = Math.min(goal.savedAmount + amount, goal.targetAmount);
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === goalId ? { ...g, savedAmount: newSaved } : g
          ),
        }));
        get().showToast(`Berhasil menambah tabungan Rp ${amount.toLocaleString('id-ID')}! 🎉`);

        if (user && isValidUUID(user.id)) {
          try {
            await db.updateGoalSaved(goalId, newSaved, user.id);
          } catch (error) {
            console.error('Failed to sync goal:', error);
          }
        }
      },

      // --- Investments ---
      addInvestment: async (invData) => {
        const user = get().user;
        const tempId = `inv_${Date.now()}`;
        const typeMaps = {
          'Saham': { icon: 'TrendingUp', color: '#0284C7', bg: '#F0F9FF', border: '#BAE6FD' },
          'Reksa Dana': { icon: 'Coins', color: '#4F46E5', bg: '#EEF2FF', border: '#C7D2FE' },
          'Emas': { icon: 'ShieldCheck', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
          'Crypto': { icon: 'Sparkles', color: '#7E22CE', bg: '#FAF5FF', border: '#E9D5FF' },
          'Properti': { icon: 'Building2', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
          'Lainnya': { icon: 'Target', color: '#52525B', bg: '#F4F4F5', border: '#E4E4E7' },
        };
        const mapping = typeMaps[invData.type] || typeMaps['Lainnya'];
        const newInv = {
          ...invData,
          id: tempId,
          iconName: mapping.icon,
          color: mapping.color,
          colorBg: mapping.bg,
          colorBorder: mapping.border,
        };

        set((state) => ({
          investments: [...state.investments, newInv],
        }));
        get().showToast('Aset investasi berhasil disimpan! 📈');

        if (user && isValidUUID(user.id)) {
          try {
            const saved = await db.insertInvestment({
              name: invData.name,
              type: invData.type,
              amount: invData.amount,
            }, user.id);

            if (saved?.id) {
              set((state) => ({
                investments: state.investments.map((inv) =>
                  inv.id === tempId ? { ...inv, id: saved.id, amount: parseFloat(saved.amount) } : inv
                ),
              }));
            }
          } catch (error) {
            console.error('Failed to sync new investment to Supabase:', error);
          }
        }
      },

      updateInvestment: async (invId, amount) => {
        const user = get().user;
        set((state) => ({
          investments: state.investments.map((inv) =>
            inv.id === invId ? { ...inv, amount } : inv
          ),
        }));
        get().showToast('Nilai investasi berhasil diperbarui!');

        if (user && isValidUUID(user.id)) {
          try {
            await db.updateInvestmentAmount(invId, amount, user.id);
          } catch (error) {
            console.error('Failed to update investment in Supabase:', error);
          }
        }
      },

      deleteInvestment: async (invId) => {
        const user = get().user;
        set((state) => ({
          investments: state.investments.filter((inv) => inv.id !== invId),
        }));
        get().showToast('Aset investasi berhasil dihapus.');

        if (user && isValidUUID(user.id)) {
          try {
            await db.deleteInvestmentById(invId, user.id);
          } catch (error) {
            console.error('Failed to delete investment from Supabase:', error);
          }
        }
      },

      // --- Tags / Labels ---
      addTag: (tagName) => {
        if (!tagName) return;
        const clean = tagName.trim().replace(/^#/, '');
        if (!clean) return;
        set((state) => {
          if (state.tags.includes(clean)) return state;
          return { tags: [...state.tags, clean] };
        });
        get().showToast(`Label #${clean} ditambahkan!`);
      },

      deleteTag: (tagName) => {
        set((state) => ({
          tags: state.tags.filter((t) => t !== tagName),
        }));
      },

      // --- Custom Categories ---
      addCategory: (newCat) => {
        const id = `cat_${Date.now()}`;
        const catObj = {
          id,
          label: newCat.label,
          iconName: newCat.iconName || 'Tag',
          color: newCat.color || '#4F46E5',
          colorBg: newCat.colorBg || '#EEF2FF',
          colorBorder: newCat.colorBorder || '#C7D2FE',
        };
        set((state) => {
          if (newCat.type === 'income') {
            return { incomeCategories: [...state.incomeCategories, catObj] };
          }
          return { expenseCategories: [...state.expenseCategories, catObj] };
        });
        get().showToast(`Kategori "${catObj.label}" berhasil dibuat! ✨`);
        return catObj;
      },

      deleteCategory: (catId) => {
        set((state) => ({
          expenseCategories: state.expenseCategories.filter((c) => c.id !== catId),
          incomeCategories: state.incomeCategories.filter((c) => c.id !== catId),
        }));
      },

      // --- UI ---
      toggleBalanceVisible: () => set((state) => ({ balanceVisible: !state.balanceVisible })),

      // --- Reset Data ---
      resetToSampleData: () => {
        set({
          transactions: [],
          budgets: [],
          goals: [],
          walletBalances: { cash: 0, bca: 0, mandiri: 0, paypal: 0, gopay: 0, ovo: 0, shopeepay: 0, dana: 0 },
          investments: [],
          tags: DEFAULT_TAGS,
          expenseCategories: EXPENSE_CATEGORIES,
          incomeCategories: INCOME_CATEGORIES,
          dataLoaded: true,
        });
        get().showToast('Data berhasil dikosongkan.');
      },

      resetAllData: async () => {
        const user = get().user;

        // Instant local reset
        set({
          transactions: [],
          budgets: [],
          goals: [],
          investments: [],
          walletBalances: { cash: 0, bca: 0, mandiri: 0, paypal: 0, gopay: 0, ovo: 0, shopeepay: 0, dana: 0 },
          dataLoaded: true,
        });

        get().showToast('Semua data berhasil dikosongkan permanen.');

        // Wipe permanently from Supabase Cloud Database if authenticated user
        if (user && isValidUUID(user.id)) {
          try {
            await db.deleteAllUserData(user.id);
          } catch (error) {
            console.error('Failed to permanently wipe database on Supabase:', error);
          }
        }
      },

      // --- Logout ---
      logout: async () => {
        try {
          await db.signOut();
        } catch (e) {
          console.warn('Sign out:', e);
        }
        set({
          user: null,
          transactions: [],
          budgets: [],
          goals: [],
          investments: [],
          walletBalances: { cash: 0, bca: 0, mandiri: 0, paypal: 0, gopay: 0, ovo: 0, shopeepay: 0, dana: 0 },
          dataLoaded: false,
        });
      },

      // --- Currency & Rates ---
      usdRate: 16250,
      fetchUsdRate: async () => {
        try {
          const res = await fetch('https://open.er-api.com/v6/latest/USD');
          if (res.ok) {
            const data = await res.json();
            if (data?.rates?.IDR) {
              set({ usdRate: Math.round(data.rates.IDR) });
            }
          }
        } catch (e) {
          console.warn('Could not fetch live USD rate, using default 16,250:', e);
        }
      },

      // --- Computed Getters ---
      getTotalBalance: () => {
        return get().getTotalLiquidBalance();
      },

      getTotalLiquidBalance: () => {
        const balances = get().walletBalances;
        const usdRate = get().usdRate || 16250;
        return Object.entries(balances).reduce((sum, [walletId, v]) => {
          if (walletId === 'paypal') {
            return sum + (v * usdRate);
          }
          return sum + v;
        }, 0);
      },

      getTotalGoalsSaved: () => {
        const goals = get().goals;
        return goals.reduce((sum, g) => sum + g.savedAmount, 0);
      },

      getTotalInvestments: () => {
        const investments = get().investments;
        return investments.reduce((sum, inv) => sum + inv.amount, 0);
      },

      getNetWorth: () => {
        return get().getTotalLiquidBalance() + get().getTotalGoalsSaved() + get().getTotalInvestments();
      },

      getMonthlyStats: (date = new Date()) => {
        const txs = get().transactions;
        const usdRate = get().usdRate || 16250;
        const month = date.getMonth();
        const year = date.getFullYear();
        const monthTxs = txs.filter((tx) => {
          const d = new Date(tx.date);
          return d.getMonth() === month && d.getFullYear() === year;
        });
        const income = monthTxs
          .filter((tx) => tx.type === 'income')
          .reduce((sum, tx) => {
            const idr = tx.wallet === 'paypal' || tx.currency === 'USD' ? tx.amount * (tx.exchangeRate || usdRate) : tx.amount;
            return sum + idr;
          }, 0);
        const expense = monthTxs
          .filter((tx) => tx.type === 'expense')
          .reduce((sum, tx) => {
            const idr = tx.wallet === 'paypal' || tx.currency === 'USD' ? tx.amount * (tx.exchangeRate || usdRate) : tx.amount;
            return sum + idr;
          }, 0);
        return { income, expense, balance: income - expense };
      },

      getLast6MonthsData: () => {
        const txs = get().transactions;
        const usdRate = get().usdRate || 16250;
        const result = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const month = d.getMonth();
          const year = d.getFullYear();
          const monthTxs = txs.filter((tx) => {
            const date = new Date(tx.date);
            return date.getMonth() === month && date.getFullYear() === year;
          });
          const income = monthTxs
            .filter((t) => t.type === 'income')
            .reduce((s, t) => {
              const idr = t.wallet === 'paypal' || t.currency === 'USD' ? t.amount * (t.exchangeRate || usdRate) : t.amount;
              return s + idr;
            }, 0);
          const expense = monthTxs
            .filter((t) => t.type === 'expense')
            .reduce((s, t) => {
              const idr = t.wallet === 'paypal' || t.currency === 'USD' ? t.amount * (t.exchangeRate || usdRate) : t.amount;
              return s + idr;
            }, 0);
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
          result.push({ name: months[month], income, expense });
        }
        return result;
      },

      getCategoryExpenses: (date = new Date()) => {
        const txs = get().transactions;
        const usdRate = get().usdRate || 16250;
        const month = date.getMonth();
        const year = date.getFullYear();
        const monthExpenses = txs.filter((tx) => {
          const d = new Date(tx.date);
          return tx.type === 'expense' && d.getMonth() === month && d.getFullYear() === year;
        });
        const byCategory = {};
        monthExpenses.forEach((tx) => {
          const idr = tx.wallet === 'paypal' || tx.currency === 'USD' ? tx.amount * (tx.exchangeRate || usdRate) : tx.amount;
          byCategory[tx.category] = (byCategory[tx.category] || 0) + idr;
        });
        return byCategory;
      },

      getBudgetProgress: () => {
        const budgets = get().budgets;
        const categoryExpenses = get().getCategoryExpenses();
        return budgets.map((b) => {
          const spent = categoryExpenses[b.category] || 0;
          const remaining = b.limit - spent;
          const percentage = b.limit > 0 ? Math.min((spent / b.limit) * 100, 100) : 0;
          const rawPercentage = b.limit > 0 ? (spent / b.limit) * 100 : 0;
          return {
            ...b,
            spent,
            remaining,
            percentage,
            rawPercentage,
            isOver: spent > b.limit,
            isWarning: rawPercentage >= 80 && spent <= b.limit,
          };
        });
      },

      getCategoryBudget: (category) => {
        const budgets = get().budgets;
        const b = budgets.find((item) => item.category === category);
        if (!b) return null;
        const categoryExpenses = get().getCategoryExpenses();
        const spent = categoryExpenses[category] || 0;
        const remaining = b.limit - spent;
        const rawPercentage = b.limit > 0 ? (spent / b.limit) * 100 : 0;
        return {
          ...b,
          spent,
          remaining,
          percentage: Math.min(rawPercentage, 100),
          rawPercentage,
          isOver: spent > b.limit,
          isWarning: rawPercentage >= 80 && spent <= b.limit,
        };
      },
    }),
    {
      name: 'flowwallet-storage',
      version: 7,
      migrate: () => ({
        // On version upgrade, clear any persisted finance data
      }),
      partialize: (state) => ({
        user: state.user,
        balanceVisible: state.balanceVisible,
        tags: state.tags,
        expenseCategories: state.expenseCategories,
        incomeCategories: state.incomeCategories,
      }),
    }
  )
);

// Initial session check on app load
useStore.getState().fetchUsdRate();

supabase.auth.getSession().then(({ data: { session } }) => {
  const store = useStore.getState();
  if (session?.user) {
    store.setUser(session.user);
  }
  store.setAuthLoading(false);
}).catch(() => {
  useStore.getState().setAuthLoading(false);
});

// Listen to Supabase auth state changes safely
supabase.auth.onAuthStateChange(async (event, session) => {
  const store = useStore.getState();
  if (session?.user) {
    await store.setUser(session.user);
  } else if (event === 'SIGNED_OUT') {
    if (store.user && isValidUUID(store.user.id)) {
      store.logout();
    }
  }
  store.setAuthLoading(false);
});

export default useStore;
