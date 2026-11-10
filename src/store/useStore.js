import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_TAGS, EXPENSE_CATEGORIES, INCOME_CATEGORIES, MAIN_WALLET_ID, INVESTMENT_TYPE_STYLES } from '../utils/categories';
import * as db from '../lib/db';
import supabase from '../lib/supabase';

// Helper to verify if user ID is a valid Supabase UUID
const isValidUUID = (str) =>
  typeof str === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

// --- Single Wallet Helpers ---
// The app has exactly one spendable wallet. Legacy transactions may still carry old wallet ids / USD amounts.
const txToIdr = (tx, usdRate) =>
  tx.wallet === 'paypal' || tx.currency === 'USD' ? tx.amount * (tx.exchangeRate || usdRate) : tx.amount;

// Effect of a transaction on the wallet balance (legacy wallet-to-wallet transfers are net zero)
const walletDelta = (tx, usdRate) => {
  const idr = txToIdr(tx, usdRate);
  if (tx.type === 'income') return idr;
  if (tx.type === 'expense') return -idr;
  if (tx.type === 'transfer') return !tx.toWallet || tx.toWallet === 'investasi' ? -idr : 0;
  return 0;
};

// One-time opening position applied when an existing account moves to the single wallet model
const OPENING_POSITION = {
  walletBalance: 1500000,
  investments: [
    { match: /etf/i, name: 'ETF', type: 'ETF', amount: 19400000 },
    { match: /sea\s*bank/i, name: 'SeaBank', type: 'Tabungan', amount: 1000000 },
  ],
};

const withInvestmentStyle = (inv) => {
  const style = INVESTMENT_TYPE_STYLES[inv.type] || INVESTMENT_TYPE_STYLES['Lainnya'];
  return { ...inv, iconName: style.icon, color: style.color, colorBg: style.bg, colorBorder: style.border };
};

const withBuiltIns = (stored, builtIns) => [
  ...builtIns,
  ...(stored || []).filter((c) => !builtIns.some((b) => b.id === c.id)),
];

// Dedupe concurrent loads (getSession + onAuthStateChange both fire on startup)
const loadsInFlight = new Map();

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
      walletBalance: 0,
      tags: DEFAULT_TAGS,
      expenseCategories: initialExpenseCategories,
      incomeCategories: initialIncomeCategories,
      balanceVisible: true,
      dataLoaded: false,
      hiddenExpenseCategories: [], // Category IDs hidden from expense calculations/views (e.g. 'bills')
      selectedAnalyticsMonth: { year: new Date().getFullYear(), month: new Date().getMonth() },

      // --- Selected Analytics Month Handlers ---
      setSelectedAnalyticsMonth: (monthObj) => {
        if (!monthObj) return;
        set({
          selectedAnalyticsMonth: {
            year: Number(monthObj.year),
            month: Number(monthObj.month),
          },
        });
      },

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
        if (loadsInFlight.has(userId)) return loadsInFlight.get(userId);
        const run = get()._loadUserData(userId).finally(() => loadsInFlight.delete(userId));
        loadsInFlight.set(userId, run);
        return run;
      },

      _loadUserData: async (userId) => {
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
              return null;
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
                color: c.color || '#0E0E0E',
                colorBg: c.colorBg || c.color_bg || '#E4DED0',
                colorBorder: c.colorBorder || c.color_border || '#0E0E0E',
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
            color: g.color || '#0E0E0E',
          }));

          let formattedInvestments = (investments || []).map((inv) =>
            withInvestmentStyle({ ...inv, amount: parseFloat(inv.amount) })
          );

          // Single wallet: the 'dompet' row is the only balance. Accounts still on the old
          // multi-wallet model are moved over once, using the opening position.
          let walletBalance = get().walletBalance || 0;
          if (walletBalances) {
            if (MAIN_WALLET_ID in walletBalances) {
              walletBalance = walletBalances[MAIN_WALLET_ID];
            } else {
              const hasLegacyData =
                Object.keys(walletBalances).length > 0 || formattedTxs.length > 0 || formattedInvestments.length > 0;
              walletBalance = hasLegacyData ? OPENING_POSITION.walletBalance : 0;
              try {
                if (hasLegacyData) {
                  for (const target of OPENING_POSITION.investments) {
                    const existing = formattedInvestments.find((inv) => target.match.test(inv.name || ''));
                    if (existing) {
                      await db.updateInvestmentAmount(existing.id, target.amount, userId);
                      formattedInvestments = formattedInvestments.map((inv) =>
                        inv.id === existing.id ? { ...inv, amount: target.amount } : inv
                      );
                    } else {
                      const saved = await db.insertInvestment(
                        { name: target.name, type: target.type, amount: target.amount },
                        userId
                      );
                      formattedInvestments = [
                        ...formattedInvestments,
                        withInvestmentStyle({ ...saved, amount: parseFloat(saved.amount) }),
                      ];
                    }
                  }
                }
                await db.upsertWalletBalance(MAIN_WALLET_ID, walletBalance, userId);
                await db.deleteLegacyWalletBalances(MAIN_WALLET_ID, userId);
              } catch (err) {
                console.error('Failed to move account to single wallet:', err);
              }
            }
          }

          set({
            transactions: formattedTxs,
            budgets: formattedBudgets,
            goals: formattedGoals,
            investments: formattedInvestments,
            walletBalance,
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
        const newTx = {
          ...tx,
          amount: txToIdr(tx, usdRate),
          wallet: MAIN_WALLET_ID,
          currency: 'IDR',
          exchangeRate: 1,
          id: `tx_${Date.now()}`,
          date: tx.date || new Date().toISOString(),
        };

        // Instant Local Update
        set((state) => ({
          transactions: [newTx, ...state.transactions],
          walletBalance: state.walletBalance + walletDelta(newTx, usdRate),
        }));

        get().showToast(
          newTx.type === 'expense'
            ? 'Pengeluaran berhasil dicatat! ✨'
            : newTx.type === 'transfer'
            ? 'Pemindahan dana berhasil dicatat! 🔄'
            : 'Pemasukan berhasil dicatat! ✨'
        );

        // Sync to Supabase if valid user
        if (user && isValidUUID(user.id)) {
          try {
            const noteText = newTx.type === 'transfer' && newTx.toWallet
              ? (newTx.note
                  ? (newTx.note.includes('[Transfer ke') ? newTx.note : `[Transfer ke ${newTx.toWallet}] ${newTx.note}`)
                  : `[Transfer ke ${newTx.toWallet}]`)
              : (newTx.note || null);

            const saved = await db.insertTransaction(
              { type: newTx.type, amount: newTx.amount, category: newTx.category || 'transfer', wallet: MAIN_WALLET_ID, note: noteText, date: newTx.date },
              user.id
            );
            if (saved?.id) {
              set((state) => ({
                transactions: state.transactions.map((t) =>
                  t.id === newTx.id ? { ...t, id: saved.id } : t
                ),
              }));
            }
            await db.upsertWalletBalance(MAIN_WALLET_ID, get().walletBalance, user.id);
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

        set((state) => ({
          transactions: state.transactions.filter((tx) => tx.id !== id),
          walletBalance: state.walletBalance - walletDelta(txToDelete, usdRate),
        }));

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
            await db.upsertWalletBalance(MAIN_WALLET_ID, get().walletBalance, user.id);
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

        // Edited amounts are always entered in Rupiah
        const newTx = {
          ...oldTx,
          ...updatedTx,
          wallet: MAIN_WALLET_ID,
          currency: 'IDR',
          exchangeRate: 1,
        };

        // Revert the old impact, apply the new one
        set((state) => ({
          transactions: state.transactions.map((tx) => (tx.id === id ? newTx : tx)),
          walletBalance: state.walletBalance - walletDelta(oldTx, usdRate) + walletDelta(newTx, usdRate),
        }));

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
                wallet: MAIN_WALLET_ID,
                note: noteText,
                date: newTx.date,
              },
              user.id
            );
            await db.upsertWalletBalance(MAIN_WALLET_ID, get().walletBalance, user.id);
          } catch (error) {
            console.error('Failed to update transaction in Supabase:', error);
          }
        }
      },

      // --- Manually set the wallet balance (e.g. to match the real balance) ---
      setWalletBalance: async (amount) => {
        const user = get().user;
        const value = Number(amount);
        if (!Number.isFinite(value) || value < 0) return;
        set({ walletBalance: value });
        get().showToast('Saldo dompet berhasil diperbarui!');

        if (user && isValidUUID(user.id)) {
          try {
            await db.upsertWalletBalance(MAIN_WALLET_ID, value, user.id);
          } catch (error) {
            console.error('Failed to sync wallet balance:', error);
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
              color: goalData.color || '#0E0E0E',
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
      // fromWallet: true = money leaves the wallet, false = record an asset you already own
      addInvestment: async ({ fromWallet = false, ...invData }) => {
        const user = get().user;
        const tempId = `inv_${Date.now()}`;
        const newInv = withInvestmentStyle({ ...invData, id: tempId });
        const transferTx = fromWallet
          ? {
              id: `tx_${Date.now()}`,
              type: 'transfer',
              category: 'transfer',
              amount: invData.amount,
              wallet: MAIN_WALLET_ID,
              toWallet: 'investasi',
              note: `Investasi: ${invData.name} (${invData.type})`,
              date: new Date().toISOString(),
            }
          : null;

        set((state) => ({
          investments: [...state.investments, newInv],
          walletBalance: state.walletBalance - (fromWallet ? invData.amount : 0),
          transactions: transferTx ? [transferTx, ...state.transactions] : state.transactions,
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

            if (transferTx) {
              await db.upsertWalletBalance(MAIN_WALLET_ID, get().walletBalance, user.id);
              await db.insertTransaction({
                type: 'transfer',
                amount: transferTx.amount,
                category: 'transfer',
                wallet: MAIN_WALLET_ID,
                note: `[Transfer ke investasi] Beli ${invData.name}`,
                date: transferTx.date,
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

      topUpInvestment: async (invId, addAmount, fromWallet = true) => {
        const user = get().user;
        const inv = get().investments.find((i) => i.id === invId);
        if (!inv || addAmount <= 0) return;

        const newTotalAmount = inv.amount + addAmount;
        const transferTx = fromWallet
          ? {
              id: `tx_${Date.now()}`,
              type: 'transfer',
              category: 'transfer',
              amount: addAmount,
              wallet: MAIN_WALLET_ID,
              toWallet: 'investasi',
              note: `Top Up Investasi: ${inv.name}`,
              date: new Date().toISOString(),
            }
          : null;

        set((state) => ({
          investments: state.investments.map((i) =>
            i.id === invId ? { ...i, amount: newTotalAmount } : i
          ),
          walletBalance: state.walletBalance - (fromWallet ? addAmount : 0),
          transactions: transferTx ? [transferTx, ...state.transactions] : state.transactions,
        }));

        get().showToast(`Top up investasi Rp ${addAmount.toLocaleString('id-ID')} berhasil! 📈`);

        if (user && isValidUUID(user.id)) {
          try {
            await db.updateInvestmentAmount(invId, newTotalAmount, user.id);

            if (transferTx) {
              await db.upsertWalletBalance(MAIN_WALLET_ID, get().walletBalance, user.id);
              await db.insertTransaction({
                type: 'transfer',
                amount: addAmount,
                category: 'transfer',
                wallet: MAIN_WALLET_ID,
                note: `[Transfer ke investasi] Top Up ${inv.name}`,
                date: transferTx.date,
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
              await get().addInvestment({ ...prevInv, fromWallet: false });
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
          color: newCat.color || '#0E0E0E',
          colorBg: newCat.colorBg || '#E4DED0',
          colorBorder: newCat.colorBorder || '#0E0E0E',
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
          walletBalance: 0,
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
          walletBalance: 0,
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
          walletBalance: 0,
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
        return get().walletBalance || 0;
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
        const txs = get().transactions || [];
        const usdRate = get().usdRate || 16250;
        const result = [];
        const now = new Date();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
        const fullMonthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
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
          result.push({
            name: months[month],
            fullName: `${fullMonthNames[month]} ${year}`,
            shortMonth: months[month],
            month,
            year,
            income,
            expense,
            net: income - expense,
            count: monthTxs.length,
          });
        }
        return result;
      },

      getAvailableMonths: () => {
        const txs = get().transactions || [];
        const fullMonthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const now = new Date();
        const map = new Map();

        // Always provide at least the last 6 months
        for (let i = 0; i < 6; i++) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const y = d.getFullYear();
          const m = d.getMonth();
          const key = `${y}-${String(m).padStart(2, '0')}`;
          map.set(key, { year: y, month: m, label: `${fullMonthNames[m]} ${y}`, key });
        }

        // Add any other month present in transactions
        txs.forEach((tx) => {
          if (!tx.date) return;
          const d = new Date(tx.date);
          if (isNaN(d.getTime())) return;
          const y = d.getFullYear();
          const m = d.getMonth();
          const key = `${y}-${String(m).padStart(2, '0')}`;
          if (!map.has(key)) {
            map.set(key, { year: y, month: m, label: `${fullMonthNames[m]} ${y}`, key });
          }
        });

        // Sort descending (latest month first)
        return Array.from(map.values()).sort((a, b) => {
          if (a.year !== b.year) return b.year - a.year;
          return b.month - a.month;
        });
      },

      getMonthlySummary: (targetDate = new Date()) => {
        const txs = get().transactions || [];
        const usdRate = get().usdRate || 16250;
        const d = targetDate instanceof Date ? targetDate : new Date(targetDate);
        const year = d.getFullYear();
        const month = d.getMonth();

        // Current targeted month
        const currentMonthTxs = txs.filter((tx) => {
          const td = new Date(tx.date);
          return td.getMonth() === month && td.getFullYear() === year;
        });

        const income = currentMonthTxs
          .filter((t) => t.type === 'income')
          .reduce((s, t) => s + (t.wallet === 'paypal' || t.currency === 'USD' ? t.amount * (t.exchangeRate || usdRate) : t.amount), 0);

        const expense = currentMonthTxs
          .filter((t) => t.type === 'expense')
          .reduce((s, t) => s + (t.wallet === 'paypal' || t.currency === 'USD' ? t.amount * (t.exchangeRate || usdRate) : t.amount), 0);

        // Previous month
        const prevDate = new Date(year, month - 1, 1);
        const prevYear = prevDate.getFullYear();
        const prevMonth = prevDate.getMonth();

        const prevMonthExpenses = txs
          .filter((tx) => {
            const td = new Date(tx.date);
            return tx.type === 'expense' && td.getMonth() === prevMonth && td.getFullYear() === prevYear;
          })
          .reduce((s, t) => s + (t.wallet === 'paypal' || t.currency === 'USD' ? t.amount * (t.exchangeRate || usdRate) : t.amount), 0);

        const diffExpense = expense - prevMonthExpenses;
        let diffPercent = 0;
        if (prevMonthExpenses > 0) {
          diffPercent = ((expense - prevMonthExpenses) / prevMonthExpenses) * 100;
        } else if (expense > 0) {
          diffPercent = 100;
        }

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const now = new Date();
        const isCurrentMonthNow = now.getFullYear() === year && now.getMonth() === month;
        const daysCount = isCurrentMonthNow ? Math.max(1, now.getDate()) : daysInMonth;
        const avgDailyExpense = Math.round(expense / daysCount);

        return {
          year,
          month,
          income,
          expense,
          net: income - expense,
          prevMonthExpenses,
          diffExpense,
          diffPercent,
          isHigherThanPrev: diffExpense > 0,
          avgDailyExpense,
          txCount: currentMonthTxs.length,
          expenseTxCount: currentMonthTxs.filter((t) => t.type === 'expense').length,
        };
      },

      getMonthlyTransactions: (targetDate = new Date(), type = 'all', category = null) => {
        const txs = get().transactions || [];
        const usdRate = get().usdRate || 16250;
        const d = targetDate instanceof Date ? targetDate : new Date(targetDate);
        const year = d.getFullYear();
        const month = d.getMonth();

        return txs
          .filter((tx) => {
            const td = new Date(tx.date);
            if (td.getMonth() !== month || td.getFullYear() !== year) return false;
            if (type !== 'all' && tx.type !== type) return false;
            if (category && tx.category !== category) return false;
            return true;
          })
          .map((tx) => ({
            ...tx,
            idrAmount: tx.wallet === 'paypal' || tx.currency === 'USD' ? tx.amount * (tx.exchangeRate || usdRate) : tx.amount,
          }))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
      version: 8,
      migrate: () => ({
        // On version upgrade, clear any persisted finance data
      }),
      // Built-in categories always come from code, so palette changes reach stored sessions
      merge: (persisted, current) => ({
        ...current,
        ...persisted,
        expenseCategories: withBuiltIns(persisted?.expenseCategories, EXPENSE_CATEGORIES),
        incomeCategories: withBuiltIns(persisted?.incomeCategories, INCOME_CATEGORIES),
      }),
      partialize: (state) => ({
        user: state.user,
        balanceVisible: state.balanceVisible,
        tags: state.tags,
        expenseCategories: state.expenseCategories,
        incomeCategories: state.incomeCategories,
        transactions: state.transactions,
        budgets: state.budgets,
        goals: state.goals,
        investments: state.investments,
        walletBalance: state.walletBalance,
        hiddenExpenseCategories: state.hiddenExpenseCategories,
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
