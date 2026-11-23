import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../lib/supabase', () => ({
  default: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: vi.fn(),
      updateUser: vi.fn(),
    },
  },
}));

vi.mock('../lib/db', () => ({
  insertInvestment: vi.fn(async (inv) => ({ ...inv, id: 'srv-1' })),
  updateInvestmentPosition: vi.fn(async () => ({})),
  updateInvestmentAmount: vi.fn(async () => ({})),
  deleteInvestmentById: vi.fn(async () => {}),
  upsertWalletBalance: vi.fn(async () => {}),
  insertTransaction: vi.fn(async () => ({})),
}));

const STORAGE_KEY = 'flowwallet-storage';
const VALID_USER = { id: '11111111-2222-3333-4444-555555555555', email: 'a@b.c' };

// In-memory localStorage shared across "reloads" of the store module
const makeStorage = () => {
  const data = new Map();
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
    removeItem: (k) => data.delete(k),
    clear: () => data.clear(),
  };
};

// Routes the two external calls the store makes: exchange rate and /api/price
const makeFetch = ({ rate = 16500, prices = {}, rateFails = false, priceFails = false } = {}) =>
  vi.fn(async (url) => {
    if (String(url).includes('open.er-api.com')) {
      if (rateFails) throw new Error('rate offline');
      return { ok: true, json: async () => ({ rates: { IDR: rate } }) };
    }
    if (String(url).startsWith('/api/price')) {
      if (priceFails) throw new Error('price offline');
      return { ok: true, json: async () => ({ prices, fetchedAt: new Date().toISOString() }) };
    }
    throw new Error(`unexpected fetch ${url}`);
  });

const priceCalls = (fetchMock) => fetchMock.mock.calls.filter(([u]) => String(u).startsWith('/api/price')).length;

const loadStore = async (fetchMock) => {
  vi.stubGlobal('fetch', fetchMock);
  vi.resetModules();
  const { default: useStore } = await import('./useStore');
  await useStore.getState().fetchUsdRate();
  return useStore;
};

const qqq = { id: 'q', name: 'QQQ', type: 'ETF', amount: 1000, symbol: 'QQQ', units: 1.25, avgPriceUsd: 500 };
const aapl = { id: 'a', name: 'AAPL', type: 'Saham', amount: 2000, symbol: 'AAPL', units: 3, avgPriceUsd: 200 };

describe('market prices in the store', () => {
  let storage;
  beforeEach(() => {
    storage = makeStorage();
    vi.stubGlobal('localStorage', storage);
    // zustand's persist reads window.localStorage; without a window it silently stops persisting
    vi.stubGlobal('window', globalThis);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('updates market amounts from /api/price', async () => {
    const store = await loadStore(makeFetch({ rate: 16500, prices: { QQQ: 610.04248 } }));
    store.setState({ investments: [qqq] });
    await store.getState().refreshMarketPrices({ force: true });
    const inv = store.getState().investments[0];
    expect(inv.amount).toBe(12582126);
    expect(inv.lastPriceUsd).toBe(610.04248);
    expect(store.getState().priceError).toBeNull();
    expect(typeof store.getState().priceUpdatedAt).toBe('string');
  });

  it('keeps amounts when price fetch fails', async () => {
    const store = await loadStore(makeFetch({ priceFails: true }));
    store.setState({ investments: [qqq] });
    await store.getState().refreshMarketPrices({ force: true });
    expect(store.getState().investments[0].amount).toBe(1000);
    expect(store.getState().priceError).toBeTruthy();
  });

  it('updates only investments whose symbol came back', async () => {
    const store = await loadStore(makeFetch({ rate: 16500, prices: { QQQ: 610.04248 } }));
    store.setState({ investments: [qqq, aapl] });
    await store.getState().refreshMarketPrices({ force: true });
    const [q, a] = store.getState().investments;
    expect(q.amount).toBe(12582126);
    expect(a.amount).toBe(2000);
  });

  it('never changes walletBalance on refresh', async () => {
    const store = await loadStore(makeFetch({ prices: { QQQ: 610.04248 } }));
    store.setState({ investments: [qqq], walletBalance: 1500000 });
    await store.getState().refreshMarketPrices({ force: true });
    expect(store.getState().walletBalance).toBe(1500000);
  });

  it('skips refresh within 5 minutes unless forced', async () => {
    const fetchMock = makeFetch({ prices: { QQQ: 610.04248 } });
    const store = await loadStore(fetchMock);
    store.setState({ investments: [qqq], priceUpdatedAt: null });
    await store.getState().refreshMarketPrices();
    await store.getState().refreshMarketPrices();
    expect(priceCalls(fetchMock)).toBe(1);
    await store.getState().refreshMarketPrices({ force: true });
    expect(priceCalls(fetchMock)).toBe(2);
  });

  it('keeps persisted usdRate when rate fetch fails', async () => {
    const first = await loadStore(makeFetch({ rate: 16900 }));
    expect(first.getState().usdRate).toBe(16900);
    // App reloads and the rate service is down: the last known rate must survive
    const second = await loadStore(makeFetch({ rateFails: true }));
    expect(second.getState().usdRate).toBe(16900);
  });

  it('topUpMarketInvestment merges units and deducts wallet', async () => {
    const store = await loadStore(makeFetch({ rate: 16500 }));
    store.setState({ investments: [{ ...qqq, units: 2, avgPriceUsd: 500 }], walletBalance: 100000000, transactions: [] });
    await store.getState().topUpMarketInvestment('q', 2, 700, true);
    const inv = store.getState().investments[0];
    expect(inv.units).toBe(4);
    expect(inv.avgPriceUsd).toBe(600);
    expect(store.getState().walletBalance).toBe(100000000 - 2 * 700 * 16500);
    expect(store.getState().transactions[0]).toMatchObject({ type: 'transfer', toWallet: 'investasi', amount: 2 * 700 * 16500 });
  });

  it('undo after delete restores symbol, units and avgPriceUsd', async () => {
    const db = await import('../lib/db');
    const store = await loadStore(makeFetch({ prices: { QQQ: 610.04248 } }));
    store.setState({ user: VALID_USER, investments: [qqq] });
    await store.getState().deleteInvestment('q');
    await store.getState().toast.action.onClick();
    expect(store.getState().investments[0]).toMatchObject({ symbol: 'QQQ', units: 1.25, avgPriceUsd: 500 });
    expect(db.insertInvestment).toHaveBeenLastCalledWith(
      expect.objectContaining({ symbol: 'QQQ', units: 1.25, avg_price_usd: 500 }),
      VALID_USER.id
    );
  });
});
