// Categories and wallets configuration with StudyTracker pastel palette (Emerald, Rose, Indigo, Purple, Amber, Sky, Zinc)

export const EXPENSE_CATEGORIES = [
  { id: 'food', label: 'Makan & Minum', iconName: 'UtensilsCrossed', color: '#E11D48', colorBg: '#FFF1F2', colorBorder: '#FECDD3' },  // Rose
  { id: 'transport', label: 'Transportasi', iconName: 'Car', color: '#0284C7', colorBg: '#F0F9FF', colorBorder: '#BAE6FD' },          // Sky
  { id: 'shopping', label: 'Belanja', iconName: 'ShoppingBag', color: '#7E22CE', colorBg: '#FAF5FF', colorBorder: '#E9D5FF' },        // Purple
  { id: 'entertainment', label: 'Hiburan', iconName: 'Gamepad2', color: '#D97706', colorBg: '#FFFBEB', colorBorder: '#FDE68A' },     // Amber
  { id: 'health', label: 'Kesehatan', iconName: 'Pill', color: '#059669', colorBg: '#ECFDF5', colorBorder: '#A7F3D0' },              // Emerald
  { id: 'bills', label: 'Tagihan', iconName: 'Lightbulb', color: '#EA580C', colorBg: '#FFF7ED', colorBorder: '#FED7AA' },            // Orange
  { id: 'education', label: 'Pendidikan', iconName: 'GraduationCap', color: '#4F46E5', colorBg: '#EEF2FF', colorBorder: '#C7D2FE' },  // Indigo
  { id: 'coffee', label: 'Kopi & Cafe', iconName: 'Coffee', color: '#B45309', colorBg: '#FFFBEB', colorBorder: '#FDE68A' },          // Amber/Brown
  { id: 'subscription', label: 'Langganan', iconName: 'Smartphone', color: '#9333EA', colorBg: '#FAF5FF', colorBorder: '#E9D5FF' },  // Violet
  { id: 'other_expense', label: 'Lainnya', iconName: 'MoreHorizontal', color: '#52525B', colorBg: '#F4F4F5', colorBorder: '#E4E4E7' },// Zinc
];

export const INCOME_CATEGORIES = [
  { id: 'salary', label: 'Gaji', iconName: 'Briefcase', color: '#059669', colorBg: '#ECFDF5', colorBorder: '#A7F3D0' },              // Emerald
  { id: 'freelance', label: 'Freelance', iconName: 'Laptop', color: '#4F46E5', colorBg: '#EEF2FF', colorBorder: '#C7D2FE' },          // Indigo
  { id: 'investment', label: 'Investasi', iconName: 'TrendingUp', color: '#0284C7', colorBg: '#F0F9FF', colorBorder: '#BAE6FD' },     // Sky
  { id: 'gift', label: 'Hadiah', iconName: 'Gift', color: '#DB2777', colorBg: '#FDF2F8', colorBorder: '#FBCFE8' },                   // Pink
  { id: 'business', label: 'Bisnis', iconName: 'Store', color: '#D97706', colorBg: '#FFFBEB', colorBorder: '#FDE68A' },              // Amber
  { id: 'other_income', label: 'Lainnya', iconName: 'Coins', color: '#059669', colorBg: '#ECFDF5', colorBorder: '#A7F3D0' },         // Emerald
];

export const WALLETS = [
  { id: 'cash', label: 'Tunai', currency: 'IDR', iconName: 'Banknote', color: '#059669', colorBg: '#ECFDF5', colorBorder: '#A7F3D0' },
  { id: 'bca', label: 'BCA', currency: 'IDR', iconName: 'Building2', color: '#0284C7', colorBg: '#F0F9FF', colorBorder: '#BAE6FD' },
  { id: 'mandiri', label: 'Mandiri', currency: 'IDR', iconName: 'Building2', color: '#D97706', colorBg: '#FFFBEB', colorBorder: '#FDE68A' },
  { id: 'seabank', label: 'SeaBank', currency: 'IDR', iconName: 'Building2', color: '#EA580C', colorBg: '#FFF7ED', colorBorder: '#FED7AA' },
  { id: 'paypal', label: 'PayPal', currency: 'USD', iconName: 'CreditCard', color: '#0079C1', colorBg: '#F0F7FF', colorBorder: '#BAE0FD' },
  { id: 'gopay', label: 'GoPay', currency: 'IDR', iconName: 'Smartphone', color: '#059669', colorBg: '#ECFDF5', colorBorder: '#A7F3D0' },
  { id: 'ovo', label: 'OVO', currency: 'IDR', iconName: 'Smartphone', color: '#7E22CE', colorBg: '#FAF5FF', colorBorder: '#E9D5FF' },
  { id: 'dana', label: 'DANA', currency: 'IDR', iconName: 'CreditCard', color: '#0284C7', colorBg: '#F0F9FF', colorBorder: '#BAE0FD' },
];

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
  { hex: '#E11D48', bg: '#FFF1F2', border: '#FECDD3', label: 'Rose' },
  { hex: '#0284C7', bg: '#F0F9FF', border: '#BAE6FD', label: 'Sky' },
  { hex: '#059669', bg: '#ECFDF5', border: '#A7F3D0', label: 'Emerald' },
  { hex: '#7E22CE', bg: '#FAF5FF', border: '#E9D5FF', label: 'Purple' },
  { hex: '#D97706', bg: '#FFFBEB', border: '#FDE68A', label: 'Amber' },
  { hex: '#EA580C', bg: '#FFF7ED', border: '#FED7AA', label: 'Orange' },
  { hex: '#4F46E5', bg: '#EEF2FF', border: '#C7D2FE', label: 'Indigo' },
  { hex: '#DB2777', bg: '#FDF2F8', border: '#FBCFE8', label: 'Pink' },
  { hex: '#0D9488', bg: '#F0FDFA', border: '#99F6E4', label: 'Teal' },
  { hex: '#52525B', bg: '#F4F4F5', border: '#E4E4E7', label: 'Zinc' },
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
    color: '#52525B',
    colorBg: '#F4F4F5',
    colorBorder: '#E4E4E7',
  };
};

export const getWalletById = (id) => {
  return WALLETS.find((w) => w.id === id) || WALLETS[0];
};
