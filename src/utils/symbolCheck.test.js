import { describe, it, expect, vi } from 'vitest';
import { checkSymbol } from './symbolCheck';

const reply = (status, body) => vi.fn(async () => ({ ok: status === 200, status, json: async () => body }));

describe('checkSymbol', () => {
  it('returns the price for a known code', async () => {
    const fetchFn = reply(200, { prices: { QQQ: 610.04 } });
    expect(await checkSymbol(' qqq ', fetchFn)).toEqual({ status: 'ok', symbol: 'QQQ', priceUsd: 610.04 });
    expect(fetchFn).toHaveBeenCalledWith('/api/price?symbols=QQQ');
  });

  it('reports not found when the server rejects or returns no price', async () => {
    expect((await checkSymbol('ZZZZQ', reply(502, { error: 'x' }))).status).toBe('not_found');
    expect((await checkSymbol('ZZZZQ', reply(400, { error: 'x' }))).status).toBe('not_found');
    expect((await checkSymbol('ZZZZQ', reply(200, { prices: {} }))).status).toBe('not_found');
  });

  it('rejects malformed codes without calling the server', async () => {
    const fetchFn = reply(200, {});
    expect((await checkSymbol('qq q!', fetchFn)).status).toBe('not_found');
    expect((await checkSymbol('', fetchFn)).status).toBe('empty');
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('reports unavailable when the price service cannot be reached', async () => {
    const offline = vi.fn(async () => { throw new Error('offline'); });
    expect((await checkSymbol('QQQ', offline)).status).toBe('unavailable');
    const htmlFallback = vi.fn(async () => ({ ok: true, status: 200, json: async () => { throw new SyntaxError('html'); } }));
    expect((await checkSymbol('QQQ', htmlFallback)).status).toBe('unavailable');
  });
});
