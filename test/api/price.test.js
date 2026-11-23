import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import handler from '../../api/price';

const KEY = 'test-key-123';

// Minimal stand-in for Vercel's Node response object
const mockRes = () => {
  const res = { statusCode: 200, headers: {}, body: undefined };
  res.status = (code) => { res.statusCode = code; return res; };
  res.setHeader = (name, value) => { res.headers[name.toLowerCase()] = value; return res; };
  res.json = (body) => { res.body = body; return res; };
  return res;
};

const upstream = (json) => vi.fn(async () => ({ ok: true, json: async () => json }));

describe('GET /api/price', () => {
  beforeEach(() => { process.env.TWELVE_DATA_API_KEY = KEY; });
  afterEach(() => { vi.unstubAllGlobals(); delete process.env.TWELVE_DATA_API_KEY; });

  it('returns 400 for invalid symbols', async () => {
    const res = mockRes();
    await handler({ query: { symbols: 'QQQ;X' } }, res);
    expect(res.statusCode).toBe(400);
  });

  it('returns 500 when TWELVE_DATA_API_KEY is missing', async () => {
    delete process.env.TWELVE_DATA_API_KEY;
    const res = mockRes();
    await handler({ query: { symbols: 'QQQ' } }, res);
    expect(res.statusCode).toBe(500);
  });

  it('returns 502 when upstream reports an error', async () => {
    vi.stubGlobal('fetch', upstream({ code: 429, status: 'error', message: 'quota' }));
    const res = mockRes();
    await handler({ query: { symbols: 'QQQ' } }, res);
    expect(res.statusCode).toBe(502);
  });

  it('returns prices with cache header', async () => {
    vi.stubGlobal('fetch', upstream({ QQQ: { price: '610.042480' }, AAPL: { price: '342.67999' } }));
    const res = mockRes();
    await handler({ query: { symbols: 'QQQ,AAPL' } }, res);
    expect(res.statusCode).toBe(200);
    expect(res.headers['cache-control']).toBe('s-maxage=300, stale-while-revalidate=600');
    expect(res.body.prices.QQQ).toBe(610.04248);
    expect(typeof res.body.fetchedAt).toBe('string');
  });

  it('never includes the api key in the response body', async () => {
    vi.stubGlobal('fetch', upstream({ code: 429, status: 'error', message: `bad key ${KEY}` }));
    const res = mockRes();
    await handler({ query: { symbols: 'QQQ' } }, res);
    expect(JSON.stringify(res.body)).not.toContain(KEY);
  });
});
