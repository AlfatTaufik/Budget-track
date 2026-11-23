import { describe, it, expect } from 'vitest';
import { marketValueIdr, gainIdr, gainPct, mergeTopUp, parseDecimalInput } from './marketValue';

describe('marketValue', () => {
  it('marketValueIdr', () => expect(marketValueIdr(1.25, 610.04, 16500)).toBe(12582075));
  it('gainIdr', () => expect(gainIdr(2, 600, 500, 16000)).toBe(3200000));
  it('gainPct', () => {
    expect(gainPct(610, 500)).toBeCloseTo(22, 6);
    expect(gainPct(400, 500)).toBeCloseTo(-20, 6);
    expect(gainPct(610, 0)).toBeNull();
  });
  it('mergeTopUp', () => expect(mergeTopUp({ units: 2, avgPriceUsd: 500 }, 2, 700)).toEqual({ units: 4, avgPriceUsd: 600 }));
  it('parseDecimalInput', () => {
    expect(parseDecimalInput('0,25')).toBe(0.25);
    expect(parseDecimalInput('1.234,5')).toBe(1234.5);
    expect(parseDecimalInput('610.04')).toBe(610.04);
    expect(parseDecimalInput('')).toBeNaN();
    expect(parseDecimalInput('abc')).toBeNaN();
  });
});
