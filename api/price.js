import { validateSymbols, parseTwelveDataPrices } from './_twelveData.js';

// GET /api/price?symbols=QQQ,AAPL → { prices: { QQQ: 610.04 }, fetchedAt }
// The Twelve Data key stays on the server; upstream messages are never echoed (they can contain the key).
export default async function handler(req, res) {
  const symbols = validateSymbols(req.query?.symbols);
  if (!symbols) return res.status(400).json({ error: 'invalid symbols' });

  const key = process.env.TWELVE_DATA_API_KEY;
  if (!key) return res.status(500).json({ error: 'price service not configured' });

  try {
    const url = `https://api.twelvedata.com/price?symbol=${encodeURIComponent(symbols.join(','))}&apikey=${encodeURIComponent(key)}`;
    const upstream = await fetch(url);
    const json = await upstream.json();
    if (!upstream.ok || json?.status === 'error') return res.status(502).json({ error: 'upstream error' });

    const prices = parseTwelveDataPrices(json, symbols);
    if (Object.keys(prices).length === 0) return res.status(502).json({ error: 'no prices' });

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ prices, fetchedAt: new Date().toISOString() });
  } catch {
    return res.status(502).json({ error: 'upstream unreachable' });
  }
}
