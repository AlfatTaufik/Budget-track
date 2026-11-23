import { describe, it, expect } from 'vitest';
import { validateSymbols, parseTwelveDataPrices } from '../../api/_twelveData';

// Response shapes copied from real Twelve Data answers (23 Nov 2026)
describe('_twelveData', () => {
  it('validateSymbols', () => {
    expect(validateSymbols('qqq, AAPL,QQQ')).toEqual(['QQQ', 'AAPL']);
    expect(validateSymbols('')).toBeNull();
    expect(validateSymbols('QQQ;DROP')).toBeNull();
    expect(validateSymbols(Array.from({ length: 11 }, (_, i) => `A${i}`).join(','))).toBeNull();
  });

  it('parses a single-symbol response', () => {
    expect(parseTwelveDataPrices({ price: '610.042480' }, ['QQQ'])).toEqual({ QQQ: 610.04248 });
  });

  it('parses a batch response', () => {
    expect(parseTwelveDataPrices({ QQQ: { price: '610.042480' }, AAPL: { price: '342.67999' } }, ['QQQ', 'AAPL']))
      .toEqual({ QQQ: 610.04248, AAPL: 342.67999 });
  });

  it('drops errored symbols but keeps the rest', () => {
    const json = { AAPL: { price: '342.67999' }, ZZZZQ: { code: 404, status: 'error', message: 'symbol not found' } };
    expect(parseTwelveDataPrices(json, ['AAPL', 'ZZZZQ'])).toEqual({ AAPL: 342.67999 });
  });
});
