const SYMBOL_RE = /^[A-Z][A-Z0-9.-]{0,9}$/;

// Looks up one US ticker through /api/price.
// status: 'ok' | 'not_found' | 'unavailable' (service unreachable, e.g. local dev) | 'empty'
export const checkSymbol = async (raw, fetchFn = fetch) => {
  const symbol = String(raw ?? '').trim().toUpperCase();
  if (!symbol) return { status: 'empty', symbol };
  if (!SYMBOL_RE.test(symbol)) return { status: 'not_found', symbol };
  try {
    const res = await fetchFn(`/api/price?symbols=${encodeURIComponent(symbol)}`);
    const body = await res.json();
    const priceUsd = res.ok ? body?.prices?.[symbol] : undefined;
    if (Number.isFinite(priceUsd) && priceUsd > 0) return { status: 'ok', symbol, priceUsd };
    return { status: 'not_found', symbol };
  } catch {
    return { status: 'unavailable', symbol };
  }
};
