import React, { useState } from 'react';
import { checkSymbol } from '../../utils/symbolCheck';
import { marketValueIdr, parseDecimalInput } from '../../utils/marketValue';
import { formatIDR } from '../../utils/formatters';

const labelStyle = { fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 };

// Form state for a US-market position: code, units, average buy price (USD)
export const useMarketPosition = (inv = null) => {
  const [symbol, setSymbolRaw] = useState(inv?.symbol || '');
  const [units, setUnits] = useState(inv?.units != null ? String(inv.units) : '');
  const [avgPrice, setAvgPrice] = useState(inv?.avgPriceUsd != null ? String(inv.avgPriceUsd) : '');
  const [check, setCheck] = useState(
    inv?.symbol ? { status: 'ok', symbol: inv.symbol, priceUsd: inv.lastPriceUsd } : { status: 'idle' }
  );

  const setSymbol = (v) => {
    setSymbolRaw(v.toUpperCase());
    setCheck({ status: 'idle' });
  };

  const runCheck = async () => {
    if (!symbol.trim()) return;
    setCheck({ status: 'checking' });
    setCheck(await checkSymbol(symbol));
  };

  const parsedUnits = parseDecimalInput(units);
  const parsedAvg = parseDecimalInput(avgPrice);
  const codeOk = check.status === 'ok' || check.status === 'unavailable';
  const valid = codeOk && parsedUnits > 0 && parsedAvg > 0;
  const priceUsd = Number.isFinite(check.priceUsd) && check.priceUsd > 0 ? check.priceUsd : parsedAvg;

  return {
    symbol, setSymbol, units, setUnits, avgPrice, setAvgPrice, check, runCheck,
    parsedUnits, parsedAvg, valid, priceUsd,
    position: { symbol: symbol.trim().toUpperCase(), units: parsedUnits, avgPriceUsd: parsedAvg },
  };
};

const MarketPositionFields = ({ pos, usdRate }) => {
  const { symbol, setSymbol, units, setUnits, avgPrice, setAvgPrice, check, runCheck, parsedUnits, priceUsd, valid } = pos;
  const preview = valid ? marketValueIdr(parsedUnits, priceUsd, usdRate) : null;

  return (
    <>
      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>Kode saham / ETF (bursa AS)</label>
        <input
          type="text"
          placeholder="Contoh: QQQ, AAPL"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          onBlur={runCheck}
          maxLength={10}
          autoCapitalize="characters"
        />
        <div style={{ fontSize: '0.6875rem', marginTop: 4, minHeight: 14 }}>
          {check.status === 'checking' && <span style={{ color: 'var(--text-muted)' }}>Memeriksa kode…</span>}
          {check.status === 'ok' && Number.isFinite(check.priceUsd) && (
            <span style={{ color: 'var(--text-primary)' }}>Harga terkini US${check.priceUsd.toFixed(2)}</span>
          )}
          {check.status === 'not_found' && <span style={{ color: 'var(--red-text)', fontWeight: 700 }}>Kode tidak ditemukan</span>}
          {check.status === 'unavailable' && (
            <span style={{ color: 'var(--text-muted)' }}>Harga tidak bisa diambil sekarang; nilai memakai harga beli.</span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Jumlah unit</label>
          <input type="text" inputMode="decimal" placeholder="Contoh: 1,25" value={units} onChange={(e) => setUnits(e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Harga beli rata-rata (USD)</label>
          <input type="text" inputMode="decimal" placeholder="Contoh: 480,50" value={avgPrice} onChange={(e) => setAvgPrice(e.target.value)} />
        </div>
      </div>

      {preview != null && (
        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
          ≈ {formatIDR(preview)}
        </div>
      )}
    </>
  );
};

export default MarketPositionFields;
