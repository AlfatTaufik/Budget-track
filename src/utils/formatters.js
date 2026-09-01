// Formatters utility
export const formatIDR = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatCompact = (amount) => {
  // Always return exact specific number as requested by user (no Jt/rb rounding)
  return formatIDR(amount);
};

export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

export const formatDateShort = (dateStr) => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
  }).format(date);
};

export const formatMonthYear = (dateStr) => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
  }).format(date);
};

export const isToday = (dateStr) => {
  if (!dateStr) return false;
  const today = new Date();
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const isYesterday = (dateStr) => {
  if (!dateStr) return false;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
};

export const groupByDate = (transactions = []) => {
  const groups = {};
  transactions.forEach((tx) => {
    if (!tx) return;
    let key = '';
    try {
      const d = new Date(tx.date || Date.now());
      if (!isNaN(d.getTime())) {
        key = d.toISOString().split('T')[0];
      } else {
        key = String(tx.date || '').split('T')[0] || 'Lainnya';
      }
    } catch {
      key = 'Lainnya';
    }
    if (!groups[key]) groups[key] = [];
    groups[key].push(tx);
  });
  return Object.entries(groups).sort(([a], [b]) => {
    const da = new Date(a).getTime();
    const db = new Date(b).getTime();
    if (isNaN(da) || isNaN(db)) return 0;
    return db - da;
  });
};

export const getMonthName = (monthIndex) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
  return months[monthIndex] || '';
};
