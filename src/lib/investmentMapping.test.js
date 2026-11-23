import { describe, it, expect } from 'vitest';
import { fromDbInvestment, toDbInvestment } from './investmentMapping';

describe('investmentMapping', () => {
  it('maps a market row', () => {
    expect(fromDbInvestment({ id: 'a', name: 'QQQ', type: 'ETF', amount: '12582075.00', symbol: 'QQQ', units: '1.25000000', avg_price_usd: '500.0000' }))
      .toMatchObject({ amount: 12582075, symbol: 'QQQ', units: 1.25, avgPriceUsd: 500 });
  });

  it('maps a manual row', () => {
    expect(fromDbInvestment({ id: 'b', name: 'SeaBank', type: 'Tabungan', amount: '1000000', symbol: null, units: null, avg_price_usd: null }))
      .toMatchObject({ amount: 1000000, symbol: null, units: null, avgPriceUsd: null });
  });

  it('round-trips to db shape', () => {
    expect(toDbInvestment({ name: 'QQQ', type: 'ETF', amount: 1, symbol: 'QQQ', units: 1.25, avgPriceUsd: 500, iconName: 'x' }))
      .toEqual({ name: 'QQQ', type: 'ETF', amount: 1, symbol: 'QQQ', units: 1.25, avg_price_usd: 500 });
  });
});
