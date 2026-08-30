// Sample data for demo purposes
const now = new Date();
const d = (daysAgo, h = 10, m = 0) => {
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  date.setHours(h, m, 0, 0);
  return date.toISOString();
};

export const SAMPLE_TRANSACTIONS = [
  // Today
  { id: 'tx1', type: 'expense', amount: 45000, category: 'coffee', wallet: 'gopay', note: 'Kopi susu Kenjiro', date: d(0, 8, 30) },
  { id: 'tx2', type: 'expense', amount: 75000, category: 'food', wallet: 'gopay', note: 'Makan siang GoFood', date: d(0, 12, 15) },
  { id: 'tx3', type: 'expense', amount: 25000, category: 'transport', wallet: 'gopay', note: 'Ojek ke kampus', date: d(0, 7, 0) },

  // Yesterday
  { id: 'tx4', type: 'expense', amount: 199000, category: 'subscription', wallet: 'bca', note: 'Netflix bulanan', date: d(1, 9, 0) },
  { id: 'tx5', type: 'expense', amount: 320000, category: 'shopping', wallet: 'bca', note: 'Shopee — headset', date: d(1, 15, 30) },
  { id: 'tx6', type: 'income', amount: 500000, category: 'freelance', wallet: 'bca', note: 'Desain logo client', date: d(1, 17, 0) },

  // 2 days ago
  { id: 'tx7', type: 'expense', amount: 120000, category: 'food', wallet: 'cash', note: 'Warung bu Sari makan malam', date: d(2, 19, 0) },
  { id: 'tx8', type: 'expense', amount: 15000, category: 'transport', wallet: 'gopay', note: 'GoCar ke mall', date: d(2, 14, 0) },
  { id: 'tx9', type: 'expense', amount: 89000, category: 'entertainment', wallet: 'gopay', note: 'Steam — game sale', date: d(2, 20, 0) },

  // 3 days ago
  { id: 'tx10', type: 'expense', amount: 350000, category: 'health', wallet: 'bca', note: 'Vitamin & suplemen', date: d(3, 11, 0) },
  { id: 'tx11', type: 'income', amount: 5000000, category: 'salary', wallet: 'bca', note: 'Gaji bulan ini', date: d(3, 9, 0) },

  // 5 days ago
  { id: 'tx12', type: 'expense', amount: 500000, category: 'bills', wallet: 'bca', note: 'Tagihan listrik PLN', date: d(5, 10, 0) },
  { id: 'tx13', type: 'expense', amount: 250000, category: 'education', wallet: 'gopay', note: 'Udemy course React', date: d(5, 16, 0) },
  { id: 'tx14', type: 'expense', amount: 65000, category: 'coffee', wallet: 'ovo', note: 'Meeting di Starbucks', date: d(5, 14, 30) },

  // 7 days ago
  { id: 'tx15', type: 'expense', amount: 780000, category: 'shopping', wallet: 'bca', note: 'Pakaian di mall', date: d(7, 15, 0) },
  { id: 'tx16', type: 'income', amount: 300000, category: 'freelance', wallet: 'dana', note: 'Translate dokumen', date: d(7, 18, 0) },

  // 10 days ago
  { id: 'tx17', type: 'expense', amount: 45000, category: 'food', wallet: 'cash', note: 'Bakso bang Haji', date: d(10, 12, 0) },
  { id: 'tx18', type: 'expense', amount: 99000, category: 'subscription', wallet: 'gopay', note: 'Spotify Premium', date: d(10, 9, 0) },
  { id: 'tx19', type: 'expense', amount: 175000, category: 'transport', wallet: 'bca', note: 'Bensin full tank', date: d(10, 8, 0) },
  { id: 'tx20', type: 'income', amount: 1500000, category: 'business', wallet: 'bca', note: 'Hasil jualan online', date: d(10, 20, 0) },
];

export const SAMPLE_BUDGETS = [
  { id: 'b1', category: 'food', limit: 1500000 },
  { id: 'b2', category: 'transport', limit: 500000 },
  { id: 'b3', category: 'shopping', limit: 1000000 },
  { id: 'b4', category: 'coffee', limit: 300000 },
  { id: 'b5', category: 'entertainment', limit: 500000 },
  { id: 'b6', category: 'subscription', limit: 400000 },
];

export const SAMPLE_GOALS = [
  { id: 'g1', name: 'Dana Darurat', iconName: 'ShieldCheck', targetAmount: 30000000, savedAmount: 12500000, color: '#059669', colorBg: '#ECFDF5', colorBorder: '#A7F3D0', deadline: '2026-12-31' },
  { id: 'g2', name: 'Laptop Baru', iconName: 'Laptop', targetAmount: 15000000, savedAmount: 4750000, color: '#4F46E5', colorBg: '#EEF2FF', colorBorder: '#C7D2FE', deadline: '2026-06-30' },
  { id: 'g3', name: 'Liburan Bali', iconName: 'Palmtree', targetAmount: 5000000, savedAmount: 3200000, color: '#D97706', colorBg: '#FFFBEB', colorBorder: '#FDE68A', deadline: '2026-03-15' },
  { id: 'g4', name: 'Kamera Mirrorless', iconName: 'Camera', targetAmount: 8000000, savedAmount: 1000000, color: '#0284C7', colorBg: '#F0F9FF', colorBorder: '#BAE6FD', deadline: '2027-01-01' },
];

export const SAMPLE_WALLETS_BALANCE = {
  cash: 850000,
  bca: 12450000,
  mandiri: 3200000,
  gopay: 1250000,
  ovo: 450000,
  shopeepay: 230000,
  dana: 580000,
};

export const SAMPLE_INVESTMENTS = [
  { id: 'inv1', name: 'Saham BBCA', type: 'Saham', amount: 12000000, iconName: 'TrendingUp', color: '#0284C7', colorBg: '#F0F9FF', colorBorder: '#BAE6FD' },
  { id: 'inv2', name: 'Bibit RDPU', type: 'Reksa Dana', amount: 8500000, iconName: 'Coins', color: '#4F46E5', colorBg: '#EEF2FF', colorBorder: '#C7D2FE' },
  { id: 'inv3', name: 'Emas Logam Mulia', type: 'Emas', amount: 5400000, iconName: 'ShieldCheck', color: '#D97706', colorBg: '#FFFBEB', colorBorder: '#FDE68A' },
];
