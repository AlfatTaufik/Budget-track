// Categories and wallet configuration. Colors follow style.md: ink, red and concrete greys only.

export const EXPENSE_CATEGORIES = [
  { id: 'food', label: 'Makan & Minum', iconName: 'UtensilsCrossed', color: '#E0271B', colorBg: '#E4DED0', colorBorder: '#0E0E0E' },
  { id: 'transport', label: 'Transportasi', iconName: 'Car', color: '#0E0E0E', colorBg: '#E4DED0', colorBorder: '#0E0E0E' },
  { id: 'shopping', label: 'Belanja', iconName: 'ShoppingBag', color: '#52504C', colorBg: '#E4DED0', colorBorder: '#0E0E0E' },
  { id: 'entertainment', label: 'Hiburan', iconName: 'Gamepad2', color: '#7A746A', colorBg: '#E4DED0', colorBorder: '#0E0E0E' },
  { id: 'health', label: 'Kesehatan', iconName: 'Pill', color: '#2B2A28', colorBg: '#E4DED0', colorBorder: '#0E0E0E' },
  { id: 'bills', label: 'Tagihan', iconName: 'Lightbulb', color: '#8F1A12', colorBg: '#E4DED0', colorBorder: '#0E0E0E' },
  { id: 'education', label: 'Pendidikan', iconName: 'GraduationCap', color: '#3A3A38', colorBg: '#E4DED0', colorBorder: '#0E0E0E' },
  { id: 'coffee', label: 'Kopi & Cafe', iconName: 'Coffee', color: '#6B6862', colorBg: '#E4DED0', colorBorder: '#0E0E0E' },
  { id: 'subscription', label: 'Langganan', iconName: 'Smartphone', color: '#A8A39A', colorBg: '#E4DED0', colorBorder: '#0E0E0E' },
  { id: 'other_expense', label: 'Lainnya', iconName: 'MoreHorizontal', color: '#1C1C1B', colorBg: '#E4DED0', colorBorder: '#0E0E0E' },
];

export const INCOME_CATEGORIES = [
  { id: 'salary', label: 'Gaji', iconName: 'Briefcase', color: '#0E0E0E', colorBg: '#E4DED0', colorBorder: '#0E0E0E' },
  { id: 'freelance', label: 'Freelance', iconName: 'Laptop', color: '#52504C', colorBg: '#E4DED0', colorBorder: '#0E0E0E' },
  { id: 'investment', label: 'Investasi', iconName: 'TrendingUp', color: '#7A746A', colorBg: '#E4DED0', colorBorder: '#0E0E0E' },
  { id: 'gift', label: 'Hadiah', iconName: 'Gift', color: '#E0271B', colorBg: '#E4DED0', colorBorder: '#0E0E0E' },
  { id: 'business', label: 'Bisnis', iconName: 'Store', color: '#3A3A38', colorBg: '#E4DED0', colorBorder: '#0E0E0E' },
  { id: 'other_income', label: 'Lainnya', iconName: 'Coins', color: '#A8A39A', colorBg: '#E4DED0', colorBorder: '#0E0E0E' },
];

// Single wallet: all spendable money lives in one place
export const MAIN_WALLET_ID = 'dompet';

export const WALLETS = [
  { id: MAIN_WALLET_ID, label: 'Dompet', currency: 'IDR', iconName: 'Wallet', color: '#0E0E0E', colorBg: '#E4DED0', colorBorder: '#0E0E0E' },
];

const INVESTMENT_DESTINATION = { id: 'investasi', label: 'Investasi', currency: 'IDR', iconName: 'TrendingUp', color: '#0E0E0E', colorBg: '#FFFFFF', colorBorder: '#0E0E0E' };

export const INVESTMENT_TYPES = ['ETF', 'Saham', 'Reksa Dana', 'Tabungan', 'Emas', 'Crypto', 'Properti', 'Lainnya'];

export const INVESTMENT_TYPE_STYLES = {
  'ETF': { icon: 'TrendingUp', color: '#0E0E0E', bg: '#E4DED0', border: '#0E0E0E' },
  'Saham': { icon: 'TrendingUp', color: '#0E0E0E', bg: '#E4DED0', border: '#0E0E0E' },
  'Reksa Dana': { icon: 'Coins', color: '#0E0E0E', bg: '#E4DED0', border: '#0E0E0E' },
  'Tabungan': { icon: 'Building2', color: '#0E0E0E', bg: '#E4DED0', border: '#0E0E0E' },
  'Emas': { icon: 'ShieldCheck', color: '#0E0E0E', bg: '#E4DED0', border: '#0E0E0E' },
  'Crypto': { icon: 'Sparkles', color: '#0E0E0E', bg: '#E4DED0', border: '#0E0E0E' },
  'Properti': { icon: 'Building2', color: '#0E0E0E', bg: '#E4DED0', border: '#0E0E0E' },
  'Lainnya': { icon: 'Target', color: '#0E0E0E', bg: '#E4DED0', border: '#0E0E0E' },
};

export const DEFAULT_TAGS = [
  'Pribadi',
  'Kantor',
  'Liburan',
  'Keluarga',
  'Hobi',
  'Self-Reward',
  'Bulanan',
  'Mendesak',
  'Online',
];

export const CATEGORY_ICON_OPTIONS = [
  { name: 'UtensilsCrossed', label: 'Makan' },
  { name: 'Coffee', label: 'Kopi' },
  { name: 'ShoppingBag', label: 'Belanja' },
  { name: 'ShoppingCart', label: 'Troli' },
  { name: 'Car', label: 'Kendaraan' },
  { name: 'Plane', label: 'Travel' },
  { name: 'Gamepad2', label: 'Game' },
  { name: 'Pill', label: 'Obat' },
  { name: 'Heart', label: 'Kesehatan' },
  { name: 'Dumbbell', label: 'Gym' },
  { name: 'Shirt', label: 'Pakaian' },
  { name: 'Home', label: 'Rumah' },
  { name: 'Dog', label: 'Hewan' },
  { name: 'BookOpen', label: 'Buku' },
  { name: 'GraduationCap', label: 'Edukasi' },
  { name: 'Music', label: 'Musik' },
  { name: 'Smartphone', label: 'Gadget' },
  { name: 'Lightbulb', label: 'Listrik' },
  { name: 'Gift', label: 'Hadiah' },
  { name: 'Sparkles', label: 'Kecantikan' },
  { name: 'Star', label: 'Favorit' },
  { name: 'Briefcase', label: 'Kerja' },
  { name: 'Store', label: 'Toko' },
  { name: 'Coins', label: 'Koin' },
  { name: 'TrendingUp', label: 'Investasi' },
  { name: 'Tag', label: 'Lainnya' },
];

export const CATEGORY_COLOR_OPTIONS = [
  { hex: '#E0271B', bg: '#E4DED0', border: '#0E0E0E', label: 'Merah' },
  { hex: '#8F1A12', bg: '#E4DED0', border: '#0E0E0E', label: 'Merah Tua' },
  { hex: '#0E0E0E', bg: '#E4DED0', border: '#0E0E0E', label: 'Hitam' },
  { hex: '#2B2A28', bg: '#E4DED0', border: '#0E0E0E', label: 'Arang' },
  { hex: '#3A3A38', bg: '#E4DED0', border: '#0E0E0E', label: 'Grafit' },
  { hex: '#52504C', bg: '#E4DED0', border: '#0E0E0E', label: 'Beton Tua' },
  { hex: '#6B6862', bg: '#E4DED0', border: '#0E0E0E', label: 'Batu' },
  { hex: '#7A746A', bg: '#E4DED0', border: '#0E0E0E', label: 'Semen' },
  { hex: '#A8A39A', bg: '#E4DED0', border: '#0E0E0E', label: 'Beton' },
];

export const getCategoryById = (id, extraCategories = []) => {
  let localCategories = [];
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('flowwallet_custom_categories') : null;
    if (raw) localCategories = JSON.parse(raw);
  } catch {
    // ignore
  }
  const all = [...extraCategories, ...localCategories, ...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
  const found = all.find((c) => c.id === id);
  if (found) return found;
  return {
    id: id || 'other',
    label: id && id.startsWith('cat_') ? 'Kategori Khusus' : (id || 'Lainnya'),
    iconName: 'Tag',
    color: '#44403C',
    colorBg: '#E4DED0',
    colorBorder: '#0E0E0E',
  };
};

// Legacy transactions may reference old wallet ids; they all resolve to the single wallet
export const getWalletById = (id) => {
  return id === 'investasi' ? INVESTMENT_DESTINATION : WALLETS[0];
};
