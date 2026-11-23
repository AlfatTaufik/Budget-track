// Converts investment rows between Supabase (snake_case, NUMERIC as strings) and the app (camelCase, numbers)

const toNumberOrNull = (value) => (value === null || value === undefined ? null : parseFloat(value));

export const fromDbInvestment = (row) => {
  const { avg_price_usd, ...rest } = row;
  return {
    ...rest,
    amount: parseFloat(row.amount),
    symbol: row.symbol ?? null,
    units: toNumberOrNull(row.units),
    avgPriceUsd: toNumberOrNull(avg_price_usd),
  };
};

export const toDbInvestment = (inv) => ({
  name: inv.name,
  type: inv.type,
  amount: inv.amount,
  symbol: inv.symbol ?? null,
  units: inv.units ?? null,
  avg_price_usd: inv.avgPriceUsd ?? null,
});
