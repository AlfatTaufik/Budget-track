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

const getStoredCustomCategories = () => {
  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('flowwallet_custom_categories');
      if (raw) return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return [];
};

const initialCustom = getStoredCustomCategories();
const initialExpenseCategories = [
  ...EXPENSE_CATEGORIES,
  ...initialCustom.filter((c) => c.type !== 'income' && !EXPENSE_CATEGORIES.some((ec) => ec.id === c.id)),
];
const initialIncomeCategories = [
  ...INCOME_CATEGORIES,
  ...initialCustom.filter((c) => c.type === 'income' && !INCOME_CATEGORIES.some((ic) => ic.id === c.id)),
];

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
      showToast: (message, type = 'success', action = null, duration = 3500) => {
        const id = Date.now();
        set({ toast: { message, type, action, id } });
        setTimeout(() => {
          if (get().toast?.id === id) {
            set({ toast: null });
          }
        }, duration);
      },
      hideToast: () => set({ toast: null }),

      // --- App State ---
      transactions: [],
      budgets: [],
      goals: [],
      investments: [],
      walletBalances: { cash: 0, bca: 0, mandiri: 0, seabank: 0, paypal: 0, gopay: 0, ovo: 0, dana: 0 },
      tags: DEFAULT_TAGS,
      expenseCategories: initialExpenseCategories,
      incomeCategories: initialIncomeCategories,
      balanceVisible: true,
      dataLoaded: false,
      hiddenExpenseCategories: [], // Category IDs hidden from expense calculations/views (e.g. 'bills')

      // --- Hidden Categories Handlers ---
      toggleHideExpenseCategory: (catId) => {
        set((state) => {
          const current = state.hiddenExpenseCategories || [];
          const updated = current.includes(catId)
            ? current.filter((id) => id !== catId)
            : [...current, catId];
          return { hiddenExpenseCategories: updated };
        });
      },
      setHiddenExpenseCategories: (categories) => set({ hiddenExpenseCategories: categories || [] }),
      resetHiddenExpenseCategories: () => set({ hiddenExpenseCategories: [] }),

      // --- Load Data from Supabase (Single Source of Truth) ---
      loadUserData: async (userId) => {
        if (!isValidUUID(userId)) {
          set({ dataLoaded: true });
          return;
        }
        try {
          const [transactions, budgets, goals, walletBalances, investments, remoteCategories] = await Promise.all([
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
            db.fetchCategories(userId).catch((err) => {
              console.warn('fetchCategories error:', err);
              return [];
            }),
          ]);

          // Merge custom categories from DB table, user_metadata, and local storage
          const userObj = get().user;
          const metadataCategories = userObj?.user_metadata?.custom_categories || [];
          const storedLocalCategories = getStoredCustomCategories();

          const allCustomMap = new Map();
          [...storedLocalCategories, ...metadataCategories, ...(remoteCategories || [])].forEach((c) => {
            if (c?.id && c?.label) {
              allCustomMap.set(c.id, {
                id: c.id,
                label: c.label,
                type: c.type || 'expense',
                iconName: c.iconName || c.icon || 'Tag',
                color: c.color || '#4F46E5',
                colorBg: c.colorBg || c.color_bg || '#EEF2FF',
                colorBorder: c.colorBorder || c.color_border || '#C7D2FE',
              });
            }
          });
          const mergedCustom = Array.from(allCustomMap.values());
          try {
            if (typeof window !== 'undefined') {
              localStorage.setItem('flowwallet_custom_categories', JSON.stringify(mergedCustom));
            }
          } catch {
            // ignore
          }

          const customExpenses = mergedCustom.filter((c) => c.type !== 'income');
          const customIncomes = mergedCustom.filter((c) => c.type === 'income');

          const finalExpenseCategories = [
            ...EXPENSE_CATEGORIES,
            ...customExpenses.filter((c) => !EXPENSE_CATEGORIES.some((ec) => ec.id === c.id)),
          ];
          const finalIncomeCategories = [
            ...INCOME_CATEGORIES,
            ...customIncomes.filter((c) => !INCOME_CATEGORIES.some((ic) => ic.id === c.id)),
          ];

          const formattedTxs = (transactions || []).map((tx) => {
            let toWallet = tx.to_wallet || tx.toWallet || null;
            if (!toWallet && tx.type === 'transfer' && tx.note) {
              const match = tx.note.match(/\[Transfer ke ([a-zA-Z0-9_]+)\]/);
              if (match) toWallet = match[1];
            }
            return {
              ...tx,
              toWallet,
              amount: parseFloat(tx.amount),
            };
          });

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

          const defaultBalances = { cash: 0, bca: 0, mandiri: 0, seabank: 0, paypal: 0, gopay: 0, ovo: 0, dana: 0 };
          const loadedBalances = { ...(walletBalances || {}) };
          if (loadedBalances.shopeepay && !loadedBalances.seabank) {
            loadedBalances.seabank = loadedBalances.shopeepay;
          }
          const mergedBalances = { ...defaultBalances, ...loadedBalances };

          set({
            transactions: formattedTxs,
            budgets: formattedBudgets,
            goals: formattedGoals,
            investments: formattedInvestments,
            walletBalances: mergedBalances,
            expenseCategories: finalExpenseCategories,
            incomeCategories: finalIncomeCategories,
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
          } else if (tx.type === 'income') {
            newBalances[tx.wallet] = (newBalances[tx.wallet] || 0) + tx.amount;
          } else if (tx.type === 'transfer') {
            // Transfer logic: Deduct from source, add to destination
            newBalances[tx.wallet] = (newBalances[tx.wallet] || 0) - tx.amount;
            if (tx.toWallet) {
              let targetAmt = tx.amount;
              if (tx.wallet === 'paypal' && tx.toWallet !== 'paypal') {
                targetAmt = tx.amount * usdRate;
              } else if (tx.wallet !== 'paypal' && tx.toWallet === 'paypal') {
                targetAmt = tx.amount / usdRate;
              }
              newBalances[tx.toWallet] = (newBalances[tx.toWallet] || 0) + targetAmt;
            }
          }
          return {
            transactions: [newTx, ...state.transactions],
            walletBalances: newBalances,
          };
        });

        get().showToast(
          tx.type === 'expense'
            ? 'Pengeluaran berhasil dicatat! ✨'
            : tx.type === 'transfer'
            ? 'Transfer antar rekening berhasil dicatat! 🔄'
            : 'Pemasukan berhasil dicatat! ✨'
        );

        // Sync to Supabase if valid user
        if (user && isValidUUID(user.id)) {
          try {
            const noteText = tx.type === 'transfer' && tx.toWallet
              ? (tx.note ? `[Transfer ke ${tx.toWallet}] ${tx.note}` : `[Transfer ke ${tx.toWallet}]`)
              : (tx.note || null);

            const saved = await db.insertTransaction(
              { type: tx.type, amount: tx.amount, category: tx.category || 'transfer', wallet: tx.wallet, note: noteText, date: newTx.date },
              user.id
            );
            if (saved?.id) {
              set((state) => ({
                transactions: state.transactions.map((t) =>
                  t.id === newTx.id ? { ...t, id: saved.id } : t
                ),
              }));
            }

            // Sync source wallet balance
            const currentSourceBal = get().walletBalances[tx.wallet];
            await db.upsertWalletBalance(tx.wallet, currentSourceBal, user.id);

            // If transfer, sync destination wallet balance too
            if (tx.type === 'transfer' && tx.toWallet) {
              const currentDestBal = get().walletBalances[tx.toWallet];
              await db.upsertWalletBalance(tx.toWallet, currentDestBal, user.id);
            }
          } catch (error) {
            console.error('Failed to sync transaction to Supabase:', error);
          }
        }
      },

      deleteTransaction: async (id) => {
        const user = get().user;
        const usdRate = get().usdRate || 16250;
        const txToDelete = get().transactions.find((tx) => tx.id === id);
        if (!txToDelete) return;
        const previousTx = { ...txToDelete };

        set((state) => {
          const newBalances = { ...state.walletBalances };
          if (txToDelete.type === 'expense') {
            newBalances[txToDelete.wallet] = (newBalances[txToDelete.wallet] || 0) + txToDelete.amount;
          } else if (txToDelete.type === 'income') {
            newBalances[txToDelete.wallet] = (newBalances[txToDelete.wallet] || 0) - txToDelete.amount;
          } else if (txToDelete.type === 'transfer') {
            // Revert transfer: refund source, deduct destination
            newBalances[txToDelete.wallet] = (newBalances[txToDelete.wallet] || 0) + txToDelete.amount;
            if (txToDelete.toWallet) {
              let targetAmt = txToDelete.amount;
              if (txToDelete.wallet === 'paypal' && txToDelete.toWallet !== 'paypal') {
                targetAmt = txToDelete.amount * usdRate;
              } else if (txToDelete.wallet !== 'paypal' && txToDelete.toWallet === 'paypal') {
                targetAmt = txToDelete.amount / usdRate;
              }
              newBalances[txToDelete.toWallet] = (newBalances[txToDelete.toWallet] || 0) - targetAmt;
            }
          }
          return {
            transactions: state.transactions.filter((tx) => tx.id !== id),
            walletBalances: newBalances,
          };
        });

        // Provide an interactive Undo toast!
        get().showToast(
          'Transaksi berhasil dihapus.',
          'info',
          {
            label: 'Batalkan (Undo)',
            onClick: async () => {
              await get().addTransaction(previousTx);
            },
          },
          5000
        );

        if (user && isValidUUID(user.id)) {
          try {
            await db.deleteTransactionById(id, user.id);
            const currentSourceBal = get().walletBalances[txToDelete.wallet];
            await db.upsertWalletBalance(txToDelete.wallet, currentSourceBal, user.id);
            if (txToDelete.type === 'transfer' && txToDelete.toWallet) {
              const currentDestBal = get().walletBalances[txToDelete.toWallet];
              await db.upsertWalletBalance(txToDelete.toWallet, currentDestBal, user.id);
            }
          } catch (error) {
            console.error('Failed to delete transaction from Supabase:', error);
          }
        }
      },

      // --- Update Existing Transaction ---
      updateTransaction: async (id, updatedTx) => {
        const user = get().user;
        const usdRate = get().usdRate || 16250;
        const oldTx = get().transactions.find((tx) => tx.id === id);
        if (!oldTx) return;

        const isUsd = updatedTx.wallet === 'paypal' || updatedTx.currency === 'USD';
        const newTx = {
          ...oldTx,
          ...updatedTx,
          currency: isUsd ? 'USD' : 'IDR',
          exchangeRate: isUsd ? (updatedTx.exchangeRate || usdRate) : 1,
        };

        // Instant Local Balance & State Update
        set((state) => {
          const newBalances = { ...state.walletBalances };

          // 1. Revert Old Transaction Impact on Balances
          if (oldTx.type === 'expense') {
            newBalances[oldTx.wallet] = (newBalances[oldTx.wallet] || 0) + oldTx.amount;
          } else if (oldTx.type === 'income') {
            newBalances[oldTx.wallet] = (newBalances[oldTx.wallet] || 0) - oldTx.amount;
          } else if (oldTx.type === 'transfer') {
            newBalances[oldTx.wallet] = (newBalances[oldTx.wallet] || 0) + oldTx.amount;
            if (oldTx.toWallet) {
              let oldTargetAmt = oldTx.amount;
              if (oldTx.wallet === 'paypal' && oldTx.toWallet !== 'paypal') {
                oldTargetAmt = oldTx.amount * usdRate;
              } else if (oldTx.wallet !== 'paypal' && oldTx.toWallet === 'paypal') {
                oldTargetAmt = oldTx.amount / usdRate;
              }
              newBalances[oldTx.toWallet] = (newBalances[oldTx.toWallet] || 0) - oldTargetAmt;
            }
          }

          // 2. Apply New Transaction Impact on Balances
          if (newTx.type === 'expense') {
            newBalances[newTx.wallet] = (newBalances[newTx.wallet] || 0) - newTx.amount;
          } else if (newTx.type === 'income') {
            newBalances[newTx.wallet] = (newBalances[newTx.wallet] || 0) + newTx.amount;
          } else if (newTx.type === 'transfer') {
            newBalances[newTx.wallet] = (newBalances[newTx.wallet] || 0) - newTx.amount;
            if (newTx.toWallet) {
              let newTargetAmt = newTx.amount;
              if (newTx.wallet === 'paypal' && newTx.toWallet !== 'paypal') {
                newTargetAmt = newTx.amount * usdRate;
              } else if (newTx.wallet !== 'paypal' && newTx.toWallet === 'paypal') {
                newTargetAmt = newTx.amount / usdRate;
              }
              newBalances[newTx.toWallet] = (newBalances[newTx.toWallet] || 0) + newTargetAmt;
            }
          }

          return {
            transactions: state.transactions.map((tx) => (tx.id === id ? newTx : tx)),
            walletBalances: newBalances,
          };
        });

        get().showToast('Transaksi berhasil diperbarui! ✨');

        // Sync to Supabase if valid user
        if (user && isValidUUID(user.id)) {
          try {
            const noteText = newTx.type === 'transfer' && newTx.toWallet
              ? (newTx.note ? (newTx.note.includes('[Transfer ke') ? newTx.note : `[Transfer ke ${newTx.toWallet}] ${newTx.note}`) : `[Transfer ke ${newTx.toWallet}]`)
              : (newTx.note || null);

            await db.updateTransaction(
              id,
              {
                type: newTx.type,
                amount: newTx.amount,
                category: newTx.category || 'other_expense',
                wallet: newTx.wallet,
                note: noteText,
                date: newTx.date,
              },
              user.id
            );

            // Upsert all affected wallet balances to Supabase
            const affectedWallets = Array.from(
              new Set([oldTx.wallet, newTx.wallet, oldTx.toWallet, newTx.toWallet].filter(Boolean))
            );
            for (const w of affectedWallets) {
              const bal = get().walletBalances[w] || 0;
              await db.upsertWalletBalance(w, bal, user.id);
            }
          } catch (error) {
            console.error('Failed to update transaction in Supabase:', error);
          }
        }
      },

      // --- Convert Existing Transaction to Transfer ---
      convertToTransfer: async (id, toWallet) => {
        const user = get().user;
        const usdRate = get().usdRate || 16250;
        const tx = get().transactions.find((t) => t.id === id);
        if (!tx || !toWallet || tx.wallet === toWallet) return;

        set((state) => {
          const newBalances = { ...state.walletBalances };
          // If previous was expense, tx.wallet was already deducted.
          // We just add funds to the destination wallet.
          let targetAmt = tx.amount;
          if (tx.wallet === 'paypal' && toWallet !== 'paypal') {
            targetAmt = tx.amount * usdRate;
          } else if (tx.wallet !== 'paypal' && toWallet === 'paypal') {
            targetAmt = tx.amount / usdRate;
          }

          if (tx.type === 'income') {
            // If was income: refund the fake income from source, then deduct from source & add to dest
            newBalances[tx.wallet] = (newBalances[tx.wallet] || 0) - tx.amount - tx.amount;
          }
          newBalances[toWallet] = (newBalances[toWallet] || 0) + targetAmt;

          return {
            transactions: state.transactions.map((t) =>
              t.id === id
                ? {
                    ...t,
                    type: 'transfer',
                    toWallet,
                    category: 'transfer',
                    note: t.note ? (t.note.includes('[Transfer ke') ? t.note : `[Transfer ke ${toWallet}] ${t.note}`) : `[Transfer ke ${toWallet}]`,
                  }
                : t
            ),
            walletBalances: newBalances,
          };
        });

        get().showToast('Transaksi berhasil diubah menjadi Transfer! 🔄');

        if (user && isValidUUID(user.id)) {
          try {
            const noteText = tx.note
              ? (tx.note.includes('[Transfer ke') ? tx.note : `[Transfer ke ${toWallet}] ${tx.note}`)
              : `[Transfer ke ${toWallet}]`;

            await db.updateTransaction(
              id,
              { type: 'transfer', category: 'transfer', note: noteText },
              user.id
            );

            // Sync updated destination wallet balance
            const currentDestBal = get().walletBalances[toWallet];
            await db.upsertWalletBalance(toWallet, currentDestBal, user.id);
          } catch (error) {
            console.error('Failed to convert transaction in Supabase:', error);
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
        const bToDelete = get().budgets.find((b) => b.category === category);
        const prevBudget = bToDelete ? { ...bToDelete } : null;

        set((state) => ({
          budgets: state.budgets.filter((b) => b.category !== category),
        }));

        get().showToast(
          'Jatah amplop berhasil dihapus.',
          'info',
          prevBudget
            ? {
                label: 'Batalkan (Undo)',
                onClick: async () => {
                  await get().setBudget(prevBudget.category, prevBudget.limit);
                },
              }
            : null,
          5000
        );

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
        const goalToDelete = get().goals.find((g) => g.id === goalId);
        if (!goalToDelete) return;
        const prevGoal = { ...goalToDelete };

        set((state) => ({
          goals: state.goals.filter((g) => g.id !== goalId),
        }));

        get().showToast(
          'Kantong tabungan berhasil dihapus.',
          'info',
          {
            label: 'Batalkan (Undo)',
            onClick: async () => {
              await get().addGoal(prevGoal);
            },
          },
          5000
        );

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

        const sourceWallet = invData.sourceWallet;
        const usdRate = get().usdRate || 16250;

        set((state) => {
          const newBalances = { ...state.walletBalances };
          let newTxs = state.transactions;

          if (sourceWallet && sourceWallet !== 'none') {
            const deductAmt = sourceWallet === 'paypal' ? invData.amount / usdRate : invData.amount;
            newBalances[sourceWallet] = (newBalances[sourceWallet] || 0) - deductAmt;

            const transferTx = {
              id: `tx_${Date.now()}`,
              type: 'transfer',
              category: 'transfer',
              amount: deductAmt,
              wallet: sourceWallet,
              toWallet: 'investasi',
              note: `Investasi: ${invData.name} (${invData.type})`,
              date: new Date().toISOString(),
            };
            newTxs = [transferTx, ...state.transactions];
          }

          return {
            investments: [...state.investments, newInv],
            walletBalances: newBalances,
            transactions: newTxs,
          };
        });

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

            if (sourceWallet && sourceWallet !== 'none') {
              const currentBal = get().walletBalances[sourceWallet];
              await db.upsertWalletBalance(sourceWallet, currentBal, user.id);
              const deductAmt = sourceWallet === 'paypal' ? invData.amount / usdRate : invData.amount;
              await db.insertTransaction({
                type: 'transfer',
                amount: deductAmt,
                category: 'transfer',
                wallet: sourceWallet,
                note: `[Transfer ke Investasi] Beli ${invData.name}`,
                date: new Date().toISOString(),
              }, user.id).catch(console.warn);
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

      topUpInvestment: async (invId, addAmount, sourceWallet) => {
        const user = get().user;
        const inv = get().investments.find((i) => i.id === invId);
        if (!inv || addAmount <= 0) return;

        const usdRate = get().usdRate || 16250;
        const newTotalAmount = inv.amount + addAmount;

        set((state) => {
          const newBalances = { ...state.walletBalances };
          let newTxs = state.transactions;

          if (sourceWallet && sourceWallet !== 'none') {
            const deductAmt = sourceWallet === 'paypal' ? addAmount / usdRate : addAmount;
            newBalances[sourceWallet] = (newBalances[sourceWallet] || 0) - deductAmt;

            const transferTx = {
              id: `tx_${Date.now()}`,
              type: 'transfer',
              category: 'transfer',
              amount: deductAmt,
              wallet: sourceWallet,
              toWallet: 'investasi',
              note: `Top Up Investasi: ${inv.name}`,
              date: new Date().toISOString(),
            };
            newTxs = [transferTx, ...state.transactions];
          }

          return {
            investments: state.investments.map((i) =>
              i.id === invId ? { ...i, amount: newTotalAmount } : i
            ),
            walletBalances: newBalances,
            transactions: newTxs,
          };
        });

        get().showToast(`Top up investasi Rp ${addAmount.toLocaleString('id-ID')} berhasil! 📈`);

        if (user && isValidUUID(user.id)) {
          try {
            await db.updateInvestmentAmount(invId, newTotalAmount, user.id);

            if (sourceWallet && sourceWallet !== 'none') {
              const currentBal = get().walletBalances[sourceWallet];
              await db.upsertWalletBalance(sourceWallet, currentBal, user.id);
              const deductAmt = sourceWallet === 'paypal' ? addAmount / usdRate : addAmount;
              await db.insertTransaction({
                type: 'transfer',
                amount: deductAmt,
                category: 'transfer',
                wallet: sourceWallet,
                note: `[Transfer ke Investasi] Top Up ${inv.name}`,
                date: new Date().toISOString(),
              }, user.id).catch(console.warn);
            }
          } catch (error) {
            console.error('Failed to sync top up investment in Supabase:', error);
          }
        }
      },

      deleteInvestment: async (invId) => {
        const user = get().user;
        const invToDelete = get().investments.find((i) => i.id === invId);
        if (!invToDelete) return;
        const prevInv = { ...invToDelete };

        set((state) => ({
          investments: state.investments.filter((inv) => inv.id !== invId),
        }));

        get().showToast(
          'Aset investasi berhasil dihapus.',
          'info',
          {
            label: 'Batalkan (Undo)',
            onClick: async () => {
              await get().addInvestment({ ...prevInv, sourceWallet: 'none' });
            },
          },
          5000
        );

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
      addCategory: async (newCat) => {
        const user = get().user;
        const id = newCat.id || `cat_${Date.now()}`;
        const catObj = {
          id,
          label: newCat.label,
          type: newCat.type || 'expense',
          iconName: newCat.iconName || 'Tag',
          color: newCat.color || '#4F46E5',
          colorBg: newCat.colorBg || '#EEF2FF',
          colorBorder: newCat.colorBorder || '#C7D2FE',
        };

        set((state) => {
          const nextExpense = newCat.type === 'income' ? state.expenseCategories : [...state.expenseCategories, catObj];
          const nextIncome = newCat.type === 'income' ? [...state.incomeCategories, catObj] : state.incomeCategories;
          
          const allCustom = [
            ...nextExpense.filter((c) => c.id.startsWith('cat_')),
            ...nextIncome.filter((c) => c.id.startsWith('cat_')),
          ];
          try {
            if (typeof window !== 'undefined') {
              localStorage.setItem('flowwallet_custom_categories', JSON.stringify(allCustom));
            }
          } catch {
            // ignore
          }

          return {
            expenseCategories: nextExpense,
            incomeCategories: nextIncome,
          };
        });

        get().showToast(`Kategori "${catObj.label}" berhasil dibuat! ✨`);

        // Sync to Supabase table and Auth user_metadata
        if (user && isValidUUID(user.id)) {
          try {
            await db.insertCategory(catObj, user.id);
            const allCustom = [
              ...get().expenseCategories.filter((c) => c.id.startsWith('cat_')),
              ...get().incomeCategories.filter((c) => c.id.startsWith('cat_')),
            ];
            await supabase.auth.updateUser({
              data: { custom_categories: allCustom },
            });
          } catch (error) {
            console.error('Failed to sync custom category to Supabase:', error);
          }
        }
        return catObj;
      },

      deleteCategory: async (catId) => {
        const user = get().user;
        set((state) => {
          const nextExpense = state.expenseCategories.filter((c) => c.id !== catId);
          const nextIncome = state.incomeCategories.filter((c) => c.id !== catId);
          const allCustom = [
            ...nextExpense.filter((c) => c.id.startsWith('cat_')),
            ...nextIncome.filter((c) => c.id.startsWith('cat_')),
          ];
          try {
            if (typeof window !== 'undefined') {
              localStorage.setItem('flowwallet_custom_categories', JSON.stringify(allCustom));
            }
          } catch {
            // ignore
          }

          return {
            expenseCategories: nextExpense,
            incomeCategories: nextIncome,
          };
        });

        if (user && isValidUUID(user.id)) {
          try {
            await db.deleteCategoryById(catId, user.id);
            const allCustom = [
              ...get().expenseCategories.filter((c) => c.id.startsWith('cat_')),
              ...get().incomeCategories.filter((c) => c.id.startsWith('cat_')),
            ];
            await supabase.auth.updateUser({
              data: { custom_categories: allCustom },
            });
          } catch (error) {
            console.error('Failed to delete category from Supabase:', error);
          }
        }
      },

      // --- UI ---
      toggleBalanceVisible: () => set((state) => ({ balanceVisible: !state.balanceVisible })),

      // --- Reset Data ---
      resetToSampleData: () => {
        set({
          transactions: [],
          budgets: [],
          goals: [],
          walletBalances: { cash: 0, bca: 0, mandiri: 0, seabank: 0, paypal: 0, gopay: 0, ovo: 0, dana: 0 },
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
          walletBalances: { cash: 0, bca: 0, mandiri: 0, seabank: 0, paypal: 0, gopay: 0, ovo: 0, dana: 0 },
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
          walletBalances: { cash: 0, bca: 0, mandiri: 0, seabank: 0, paypal: 0, gopay: 0, ovo: 0, dana: 0 },
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

      getMonthlyStats: (date = new Date(), excludedCategories = null) => {
        const txs = get().transactions;
        const usdRate = get().usdRate || 16250;
        const excluded = Array.isArray(excludedCategories) ? excludedCategories : (get().hiddenExpenseCategories || []);
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
          .filter((tx) => tx.type === 'expense' && !excluded.includes(tx.category))
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

      getCategoryExpenses: (date = new Date(), excludedCategories = null) => {
        const txs = get().transactions;
        const usdRate = get().usdRate || 16250;
        const excluded = Array.isArray(excludedCategories) ? excludedCategories : (get().hiddenExpenseCategories || []);
        const month = date.getMonth();
        const year = date.getFullYear();
        const monthExpenses = txs.filter((tx) => {
          const d = new Date(tx.date);
          return tx.type === 'expense' && d.getMonth() === month && d.getFullYear() === year && !excluded.includes(tx.category);
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
