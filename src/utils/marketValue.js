// Pure calculations for market-priced investments (US stocks/ETFs priced in USD)

export const marketValueIdr = (units, priceUsd, usdRate) => Math.round(units * priceUsd * usdRate);

export const gainIdr = (units, priceUsd, avgPriceUsd, usdRate) =>
  Math.round(units * (priceUsd - avgPriceUsd) * usdRate);

export const gainPct = (priceUsd, avgPriceUsd) => {
  if (!(avgPriceUsd > 0)) return null;
  return (priceUsd / avgPriceUsd - 1) * 100;
};

// Weighted average price after buying more units
export const mergeTopUp = (position, addUnits, addPriceUsd) => {
  const units = position.units + addUnits;
  const avgPriceUsd = (position.units * position.avgPriceUsd + addUnits * addPriceUsd) / units;
  return { units, avgPriceUsd };
};

// Accepts Indonesian ("1.234,5", "0,25") and plain ("610.04") decimals; anything else is NaN
export const parseDecimalInput = (raw) => {
  const text = String(raw ?? '').trim();
  const normalized = text.includes(',') ? text.replace(/\./g, '').replace(',', '.') : text;
  return /^\d+(\.\d+)?$/.test(normalized) ? Number(normalized) : NaN;
};
