// Helpers for /api/price. The leading underscore keeps Vercel from deploying this file as an endpoint.

const SYMBOL = /^[A-Z][A-Z0-9.\-]{0,9}$/;
const MAX_SYMBOLS = 10;

export const validateSymbols = (raw) => {
  const symbols = [...new Set(String(raw ?? '').split(',').map((s) => s.trim().toUpperCase()).filter(Boolean))];
  if (symbols.length === 0 || symbols.length > MAX_SYMBOLS) return null;
  return symbols.every((s) => SYMBOL.test(s)) ? symbols : null;
};

const toPrice = (entry) => {
  if (!entry || entry.status === 'error') return null;
  const price = Number(entry.price);
  return Number.isFinite(price) && price > 0 ? price : null;
};

// Twelve Data answers `{ price }` for one symbol and `{ SYM: { price } }` for several
export const parseTwelveDataPrices = (json, symbols) => {
  const prices = {};
  const single = symbols.length === 1 && json && 'price' in json;
  for (const symbol of symbols) {
    const price = toPrice(single ? json : json?.[symbol]);
    if (price !== null) prices[symbol] = price;
  }
  return prices;
};
