// Categories and wallet configuration (neo-brutalist palette: saturated tiles, black outlines)

export const EXPENSE_CATEGORIES = [
  { id: 'food', label: 'Makan & Minum', iconName: 'UtensilsCrossed', color: '#C1123A', colorBg: '#FFD0D6', colorBorder: '#111111' },  // Rose
  { id: 'transport', label: 'Transportasi', iconName: 'Car', color: '#0369A1', colorBg: '#BFE4FF', colorBorder: '#111111' },          // Sky
  { id: 'shopping', label: 'Belanja', iconName: 'ShoppingBag', color: '#7E22CE', colorBg: '#E3D1FF', colorBorder: '#111111' },        // Purple
  { id: 'entertainment', label: 'Hiburan', iconName: 'Gamepad2', color: '#A85800', colorBg: '#FFE89A', colorBorder: '#111111' },     // Amber
  { id: 'health', label: 'Kesehatan', iconName: 'Pill', color: '#046C4E', colorBg: '#C4F2DA', colorBorder: '#111111' },              // Emerald
  { id: 'bills', label: 'Tagihan', iconName: 'Lightbulb', color: '#C2410C', colorBg: '#FFD3B0', colorBorder: '#111111' },            // Orange
  { id: 'education', label: 'Pendidikan', iconName: 'GraduationCap', color: '#4F46E5', colorBg: '#D5DBFF', colorBorder: '#111111' },  // Indigo
  { id: 'coffee', label: 'Kopi & Cafe', iconName: 'Coffee', color: '#B45309', colorBg: '#FFE89A', colorBorder: '#111111' },          // Amber/Brown
  { id: 'subscription', label: 'Langganan', iconName: 'Smartphone', color: '#9333EA', colorBg: '#E3D1FF', colorBorder: '#111111' },  // Violet
  { id: 'other_expense', label: 'Lainnya', iconName: 'MoreHorizontal', color: '#44403C', colorBg: '#F3EAD3', colorBorder: '#111111' },// Zinc
];

export const INCOME_CATEGORIES = [
  { id: 'salary', label: 'Gaji', iconName: 'Briefcase', color: '#046C4E', colorBg: '#C4F2DA', colorBorder: '#111111' },              // Emerald
  { id: 'freelance', label: 'Freelance', iconName: 'Laptop', color: '#4F46E5', colorBg: '#D5DBFF', colorBorder: '#111111' },          // Indigo
  { id: 'investment', label: 'Investasi', iconName: 'TrendingUp', color: '#0369A1', colorBg: '#BFE4FF', colorBorder: '#111111' },     // Sky
  { id: 'gift', label: 'Hadiah', iconName: 'Gift', color: '#DB2777', colorBg: '#FFC7F0', colorBorder: '#111111' },                   // Pink
  { id: 'business', label: 'Bisnis', iconName: 'Store', color: '#A85800', colorBg: '#FFE89A', colorBorder: '#111111' },              // Amber
  { id: 'other_income', label: 'Lainnya', iconName: 'Coins', color: '#046C4E', colorBg: '#C4F2DA', colorBorder: '#111111' },         // Emerald
];

// Single wallet: all spendable money lives in one place
export const MAIN_WALLET_ID = 'dompet';

export const WALLETS = [
  { id: MAIN_WALLET_ID, label: 'Dompet', currency: 'IDR', iconName: 'Wallet', color: '#111111', colorBg: '#FFD23F', colorBorder: '#111111' },
];

const INVESTMENT_DESTINATION = { id: 'investasi', label: 'Investasi', currency: 'IDR', iconName: 'TrendingUp', color: '#111111', colorBg: '#C4F2DA', colorBorder: '#111111' };

export const INVESTMENT_TYPES = ['ETF', 'Saham', 'Reksa Dana', 'Tabungan', 'Emas', 'Crypto', 'Properti', 'Lainnya'];

export const INVESTMENT_TYPE_STYLES = {
  'ETF': { icon: 'TrendingUp', color: '#111111', bg: '#C4F2DA', border: '#111111' },
  'Saham': { icon: 'TrendingUp', color: '#111111', bg: '#BFE4FF', border: '#111111' },
  'Reksa Dana': { icon: 'Coins', color: '#111111', bg: '#E3D1FF', border: '#111111' },
  'Tabungan': { icon: 'Building2', color: '#111111', bg: '#FFD3B0', border: '#111111' },
  'Emas': { icon: 'ShieldCheck', color: '#111111', bg: '#FFD23F', border: '#111111' },
  'Crypto': { icon: 'Sparkles', color: '#111111', bg: '#FFC7F0', border: '#111111' },
  'Properti': { icon: 'Building2', color: '#111111', bg: '#B8E986', border: '#111111' },
  'Lainnya': { icon: 'Target', color: '#111111', bg: '#F3EAD3', border: '#111111' },
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
  { hex: '#C1123A', bg: '#FFD0D6', border: '#111111', label: 'Rose' },
  { hex: '#0369A1', bg: '#BFE4FF', border: '#111111', label: 'Sky' },
  { hex: '#046C4E', bg: '#C4F2DA', border: '#111111', label: 'Emerald' },
  { hex: '#7E22CE', bg: '#E3D1FF', border: '#111111', label: 'Purple' },
  { hex: '#A85800', bg: '#FFE89A', border: '#111111', label: 'Amber' },
  { hex: '#C2410C', bg: '#FFD3B0', border: '#111111', label: 'Orange' },
  { hex: '#4F46E5', bg: '#D5DBFF', border: '#111111', label: 'Indigo' },
  { hex: '#DB2777', bg: '#FFC7F0', border: '#111111', label: 'Pink' },
  { hex: '#0D9488', bg: '#B9F1E8', border: '#111111', label: 'Teal' },
  { hex: '#44403C', bg: '#F3EAD3', border: '#111111', label: 'Zinc' },
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
    colorBg: '#F3EAD3',
    colorBorder: '#111111',
  };
};

// Legacy transactions may reference old wallet ids; they all resolve to the single wallet
export const getWalletById = (id) => {
  return id === 'investasi' ? INVESTMENT_DESTINATION : WALLETS[0];
};
