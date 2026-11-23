import React from 'react';
import { gainIdr, gainPct } from '../../utils/marketValue';
import { formatIDR } from '../../utils/formatters';

const unitsText = (units) =>
  Number(units).toLocaleString('id-ID', { minimumFractionDigits: 4, maximumFractionDigits: 8 });

const timeText = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `${String(d.getHours()).padStart(2, '0')}.${String(d.getMinutes()).padStart(2, '0')}`;
};

// One small line under a market-priced investment: code · units, gain/loss, price time
const MarketValueLine = ({ inv, usdRate, priceUpdatedAt, priceError, hidden = false, compact = false }) => {
  if (!inv?.symbol) return null;

  const price = inv.lastPriceUsd;
  const hasGain = Number.isFinite(price) && inv.avgPriceUsd > 0;
  const gain = hasGain ? gainIdr(inv.units, price, inv.avgPriceUsd, usdRate) : null;
  const pct = hasGain ? gainPct(price, inv.avgPriceUsd) : null;
  const time = timeText(priceUpdatedAt);
  const loss = gain != null && gain < 0;
  const sign = loss ? '−' : '+';
  const pctText = pct != null
    ? `${sign}${Math.abs(pct).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
    : null;

  // Narrow rows (home card): percentage and price time only
  if (compact) {
    return (
      <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
        {pctText && !hidden && (
          <span style={{ fontWeight: 700, color: loss ? 'var(--red-text)' : 'var(--ink, #0E0E0E)' }}>{pctText}</span>
        )}
        {pctText && !hidden && time && ' · '}
        {time && (priceError ? `harga terakhir ${time}` : `harga ${time}`)}
      </div>
    );
  }

  return (
    <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', display: 'flex', flexWrap: 'wrap', gap: '2px 8px' }}>
      <span>{inv.symbol} · {unitsText(inv.units)} unit</span>
      {gain != null && !hidden && (
        <span style={{ fontWeight: 700, color: loss ? 'var(--red-text)' : 'var(--ink, #0E0E0E)' }}>
          {sign}{formatIDR(Math.abs(gain))}
          {pctText && ` (${pctText})`}
        </span>
      )}
      {time && <span>{priceError ? `harga terakhir ${time}` : `harga per ${time}`}</span>}
    </div>
  );
};

export default MarketValueLine;
