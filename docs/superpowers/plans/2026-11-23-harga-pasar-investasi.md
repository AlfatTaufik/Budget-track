# Harga Pasar Otomatis untuk Investasi — Rencana Implementasi

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Investasi QQQ/AAPL (dan ETF/saham AS lain) dicatat sebagai kode + unit + harga rata-rata USD, dan nilainya mengikuti harga pasar lewat fungsi Vercel yang menyimpan kunci Twelve Data secara rahasia.

**Architecture:** `api/price.js` (Vercel serverless) memanggil Twelve Data dan mengembalikan harga USD per kode dengan cache 5 menit. Store Zustand menghitung nilai rupiah (`unit × harga × kurs`) lalu menulisnya ke kolom `amount` yang sudah dipakai semua total. Tiga kolom opsional baru di tabel `investments`; investasi tanpa `symbol` tetap manual.

**Tech Stack:** React 19 + Vite 8, Zustand 5, Supabase JS 2, Vercel Functions (Node), Twelve Data REST, Vitest 5.1.1 (baru).

**Spec:** `docs/superpowers/specs/2026-11-23-harga-pasar-investasi-design.md`

## Global Constraints

- Kerjakan di branch `feat/harga-pasar-investasi`; jangan commit ke `main` (setiap push ke `main` langsung tayang di produksi Vercel).
- Kunci API hanya dibaca dari `process.env.TWELVE_DATA_API_KEY` di `api/`. Tidak boleh ada di kode `src/`, `.env*` yang ter-commit, atau berkas lain di repo (repo publik).
- Kolom baru: `symbol TEXT NULL`, `units NUMERIC(20,8) NULL`, `avg_price_usd NUMERIC(15,4) NULL`. Di JS: `symbol`, `units`, `avgPriceUsd`.
- `amount` tetap nilai rupiah terakhir yang diketahui untuk semua investasi; semua total yang ada terus membaca `amount`.
- Validasi kode: maksimal 10 kode per permintaan, masing-masing `^[A-Z][A-Z0-9.\-]{0,9}$`.
- Cache fungsi: `Cache-Control: s-maxage=300, stale-while-revalidate=600`. Interval pembaruan di klien: 5 menit (`300000` ms).
- Pembaruan harga tidak pernah mengubah `walletBalance`.
- Kegagalan harga atau kurs tidak boleh mengubah `amount` menjadi 0 atau NaN.
- Warna dan tipografi mengikuti `style.md`: untung dengan tanda `+` warna `--ink`, rugi dengan tanda `−` warna `--red-text`.
- `node_modules` saat ini berisi biner Windows (`@rolldown/binding-win32-x64-msvc`). Menjalankan `npm install` di Linux menambahkan biner Linux; bila nanti kembali ke Windows, jalankan `npm install` di sana.

## Review Focus

- **Fungsi harga mati atau internet putus:** nilai investasi tetap nilai terakhir, dan `priceError` terisi. → Task 4, `keeps amounts when price fetch fails`.
- **Ambil kurs gagal saat aplikasi dibuka:** kurs terakhir yang tersimpan dipakai, bukan 16.250. → Task 4, `keeps persisted usdRate when rate fetch fails`.
- **Satu kode tidak dikenal di antara yang valid:** kode lain tetap terbarui. → Task 2, `drops errored symbols but keeps the rest`; Task 4, `updates only investments whose symbol came back`.
- **Kuota Twelve Data habis** (jawaban `{"code":429,"status":"error"}` di tingkat atas): fungsi membalas 502 dan klien tidak mengubah apa pun. → Task 2, `returns 502 when upstream reports an error`.
- **Unit pecahan diketik dengan koma** (`0,25`): terbaca 0.25, bukan 25 atau NaN. → Task 1, `parseDecimalInput`.

---

### Task 1: Kerangka tes + rumus murni

**Files:**
- Modify: `package.json` (devDependency `vitest@5.1.1`, script `"test": "vitest run"`)
- Create: `src/utils/marketValue.js`
- Test: `src/utils/marketValue.test.js`

**Interfaces:**
- Produces:
  - `marketValueIdr(units: number, priceUsd: number, usdRate: number): number` (dibulatkan ke rupiah)
  - `gainIdr(units: number, priceUsd: number, avgPriceUsd: number, usdRate: number): number` (dibulatkan)
  - `gainPct(priceUsd: number, avgPriceUsd: number): number | null` (`null` bila `avgPriceUsd <= 0`)
  - `mergeTopUp(position: { units: number, avgPriceUsd: number }, addUnits: number, addPriceUsd: number): { units: number, avgPriceUsd: number }` (rata-rata tertimbang)
  - `parseDecimalInput(raw: string): number` (koma = desimal, titik = ribuan bila ada koma; tanpa koma, titik = desimal; tidak valid → `NaN`)

- [ ] **Step 1: Pasang Vitest**

Run: `npm install -D vitest@5.1.1` lalu tambahkan script `"test": "vitest run"`.
Expected: `npx vitest --version` mencetak `5.1.1`.

- [ ] **Step 2: Tulis tes yang gagal**

```js
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
```

- [ ] **Step 3: Jalankan, pastikan gagal**

Run: `npx vitest run src/utils/marketValue.test.js`
Expected: FAIL (modul belum ada).

- [ ] **Step 4: Implementasikan kelima fungsi di `src/utils/marketValue.js`**

- [ ] **Step 5: Jalankan, pastikan lulus**

Run: `npx vitest run src/utils/marketValue.test.js`
Expected: PASS, 5 tes.

- [ ] **Step 6: Commit**

```bash
git checkout -b feat/harga-pasar-investasi
git add package.json package-lock.json src/utils/marketValue.js src/utils/marketValue.test.js
git commit -m "test: tambah Vitest dan rumus nilai pasar investasi"
```

### Task 2: Fungsi harga di Vercel

**Files:**
- Create: `api/_twelveData.js` (awalan `_` agar Vercel tidak menjadikannya endpoint)
- Create: `api/price.js`
- Modify: `vercel.json` (rewrite `"source": "/((?!api/).*)"`)
- Test: `api/_twelveData.test.js`, `api/price.test.js`

**Interfaces:**
- Produces:
  - `validateSymbols(raw: string | undefined): string[] | null` (huruf besar, tanpa duplikat; `null` bila kosong, lebih dari 10, atau ada yang tidak cocok regex)
  - `parseTwelveDataPrices(json: object, symbols: string[]): Record<string, number>`
  - `GET /api/price?symbols=QQQ,AAPL` → `200 { prices: { QQQ: number, AAPL: number }, fetchedAt: string }`; `400` input tidak valid; `500` kunci tidak ada; `502` upstream gagal atau tidak ada harga sama sekali.

- [ ] **Step 1: Tulis tes yang gagal (format diambil dari jawaban asli Twelve Data, 23 Nov 2026)**

```js
// api/_twelveData.test.js
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
```

```js
// api/price.test.js — handler dipanggil dengan req/res tiruan; fetch di-stub dengan vi.stubGlobal
it('returns 400 for invalid symbols');            // res.status(400)
it('returns 500 when TWELVE_DATA_API_KEY is missing');
it('returns 502 when upstream reports an error'); // fetch → { code: 429, status: 'error', message: 'quota' }
it('returns prices with cache header');            // status 200, header Cache-Control = 's-maxage=300, stale-while-revalidate=600', body.prices.QQQ === 610.04248
it('never includes the api key in the response body');
```

- [ ] **Step 2: Jalankan, pastikan gagal**

Run: `npx vitest run api`
Expected: FAIL (modul belum ada).

- [ ] **Step 3: Implementasikan `api/_twelveData.js` dan `api/price.js`**

Handler gaya Vercel Node: `export default async function handler(req, res)`. Memanggil `https://api.twelvedata.com/price?symbol=<kode dipisah koma>&apikey=<kunci>`. Jawaban dengan `status: 'error'` di tingkat atas, atau hasil parse kosong, → 502.

- [ ] **Step 4: Jalankan, pastikan lulus**

Run: `npx vitest run api`
Expected: PASS, 9 tes.

- [ ] **Step 5: Commit**

```bash
git add api vercel.json
git commit -m "feat: fungsi Vercel /api/price untuk harga saham dan ETF AS"
```

### Task 3: Kolom database dan pemetaan data

**Files:**
- Create: `supabase/migrations/20261123_investments_market.sql`
- Modify: `supabase_schema.sql` (definisi tabel `investments`)
- Create: `src/lib/investmentMapping.js`
- Modify: `src/lib/db.js` (tambah `updateInvestmentPosition`)
- Test: `src/lib/investmentMapping.test.js`

**Interfaces:**
- Produces:
  - `fromDbInvestment(row: object): Investment`, dengan `Investment = { id, name, type, amount: number, symbol: string | null, units: number | null, avgPriceUsd: number | null, ... }`; angka diparse dari string NUMERIC, `null` tetap `null`.
  - `toDbInvestment(inv: Investment): { name, type, amount, symbol, units, avg_price_usd }`
  - `db.updateInvestmentPosition(invId: string, fields: { amount?: number, symbol?: string | null, units?: number | null, avg_price_usd?: number | null }, userId: string): Promise<object>`

- [ ] **Step 1: Tulis migrasi** — tiga `ALTER TABLE investments ADD COLUMN IF NOT EXISTS ...` sesuai Global Constraints; salin ke `supabase_schema.sql`.

- [ ] **Step 2: Tulis tes yang gagal**

```js
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
```

- [ ] **Step 3: Jalankan, pastikan gagal** — `npx vitest run src/lib/investmentMapping.test.js` → FAIL.

- [ ] **Step 4: Implementasikan `investmentMapping.js` dan `db.updateInvestmentPosition`** (pola sama dengan `updateInvestmentAmount`).

- [ ] **Step 5: Jalankan, pastikan lulus** — PASS, 3 tes.

- [ ] **Step 6: Commit**

```bash
git add supabase supabase_schema.sql src/lib/investmentMapping.js src/lib/investmentMapping.test.js src/lib/db.js
git commit -m "feat: kolom symbol, units, avg_price_usd untuk investasi"
```

### Task 4: Store — pembaruan harga, kurs cadangan, posisi pasar

**Files:**
- Modify: `src/store/useStore.js` (`loadUserData`, `addInvestment`, `deleteInvestment` undo, `fetchUsdRate`, `partialize`, aksi baru)
- Modify: `src/components/Analytics/AnalyticsPage.jsx` (panggil `refreshMarketPrices()` saat mount)
- Test: `src/store/marketPrices.test.js` (`vi.mock('../lib/supabase')`, `vi.mock('../lib/db')`, `vi.stubGlobal('fetch')`)

**Interfaces:**
- Consumes: Task 1 (`marketValueIdr`, `mergeTopUp`), Task 3 (`fromDbInvestment`, `toDbInvestment`, `db.updateInvestmentPosition`), `GET /api/price` dari Task 2.
- Produces (state + aksi store):
  - state: `priceUpdatedAt: string | null`, `priceError: string | null`, `usdRateUpdatedAt: string | null`; `usdRate`, `usdRateUpdatedAt`, `priceUpdatedAt` masuk `partialize`.
  - `refreshMarketPrices(opts?: { force?: boolean }): Promise<void>` — dilewati bila `!force` dan pembaruan terakhir < 300000 ms; hanya investasi dengan `symbol`; menyimpan `lastPriceUsd` per investasi dan menulis `amount` ke Supabase hanya bila berubah dan pengguna valid.
  - `updateInvestmentPosition(invId: string, pos: { symbol: string, units: number, avgPriceUsd: number }): Promise<void>` — juga dipakai untuk "Atur harga otomatis".
  - `topUpMarketInvestment(invId: string, addUnits: number, addPriceUsd: number, fromWallet: boolean): Promise<void>` — memotong dompet `addUnits × addPriceUsd × usdRate` lewat transaksi transfer ke `investasi` yang sudah ada.
  - `addInvestment` menerima `symbol`, `units`, `avgPriceUsd` opsional; untuk investasi pasar dengan `fromWallet`, dompet dipotong `units × avgPriceUsd × usdRate`.
  - `loadUserData` memakai `fromDbInvestment`, lalu memanggil `refreshMarketPrices({ force: true })`.

- [ ] **Step 1: Tulis tes yang gagal**

```js
it('updates market amounts from /api/price');                 // QQQ 1.25 unit, harga 610.04248, kurs 16500 → amount 12582126
it('keeps amounts when price fetch fails');                    // fetch reject → amount tetap, priceError terisi
it('updates only investments whose symbol came back');         // QQQ & AAPL, jawaban hanya QQQ → AAPL tidak berubah
it('never changes walletBalance on refresh');
it('skips refresh within 5 minutes unless forced');           // fetch dipanggil 1x untuk 2 pemanggilan tanpa force
it('keeps persisted usdRate when rate fetch fails');           // usdRate 16800 tersimpan, fetchUsdRate gagal → tetap 16800
it('topUpMarketInvestment merges units and deducts wallet');   // 2 @500 + 2 @700 → 4 @600; dompet −(2×700×16500)
it('undo after delete restores symbol, units and avgPriceUsd');
```

- [ ] **Step 2: Jalankan, pastikan gagal** — `npx vitest run src/store` → FAIL.

- [ ] **Step 3: Implementasikan perubahan store dan pemanggilan di `AnalyticsPage`**

- [ ] **Step 4: Jalankan semua tes** — `npx vitest run` → PASS, termasuk Task 1–3.

- [ ] **Step 5: Commit**

```bash
git add src/store src/components/Analytics/AnalyticsPage.jsx
git commit -m "feat: perbarui nilai investasi dari harga pasar dengan kurs cadangan"
```

### Task 5: Form tambah, edit, ubah, dan top up investasi pasar

**Files:**
- Modify: `src/components/Modal/AddInvestmentModal.jsx`
- Modify: `src/components/Modal/TopUpInvestmentModal.jsx`
- Modify: `src/components/Analytics/AnalyticsPage.jsx` (edit inline dan aksi "Atur harga otomatis")

**Interfaces:**
- Consumes: Task 1 (`parseDecimalInput`, `marketValueIdr`), Task 4 (`addInvestment`, `updateInvestmentPosition`, `topUpMarketInvestment`), `GET /api/price?symbols=<KODE>` untuk memeriksa kode.

- [ ] **Step 1: Form tambah** — untuk tipe `ETF` atau `Saham`, sakelar "Harga otomatis (bursa AS)". Saat aktif tampil kolom kode, jumlah unit, harga beli rata-rata (USD). Kode diperiksa saat kolom ditinggalkan; kode tidak dikenal menampilkan "Kode tidak ditemukan" dan tombol simpan nonaktif. Pratinjau "≈ Rp …" memakai harga terkini. Semua angka melalui `parseDecimalInput`.
- [ ] **Step 2: Edit dan ubah di Analitik** — investasi dengan `symbol`: tombol edit membuka kolom unit dan harga rata-rata, bukan rupiah. Investasi manual tipe ETF/Saham mendapat aksi "Atur harga otomatis" dengan kolom yang sama.
- [ ] **Step 3: Top up** — untuk investasi dengan `symbol`, modal meminta unit tambahan dan harga per unit (USD), lalu memanggil `topUpMarketInvestment`.
- [ ] **Step 4: Verifikasi build** — `npm run build` → selesai tanpa error; `npx vitest run` → PASS.
- [ ] **Step 5: Commit**

```bash
git add src/components
git commit -m "feat: form investasi pasar AS dengan pemeriksaan kode"
```

### Task 6: Tampilan nilai, untung/rugi, dan waktu harga

**Files:**
- Create: `src/components/Common/MarketValueLine.jsx`
- Modify: `src/components/Dashboard/HeroCard.jsx` (baris aset)
- Modify: `src/components/Analytics/AnalyticsPage.jsx` (daftar investasi)

**Interfaces:**
- Consumes: Task 1 (`gainIdr`, `gainPct`), Task 4 (`lastPriceUsd`, `priceUpdatedAt`, `priceError`).
- Produces: `<MarketValueLine inv={Investment} usdRate={number} priceUpdatedAt={string|null} priceError={string|null} />` → baris `QQQ · 1,2500 unit`, untung/rugi `+Rp 3.200.000 (+22,0%)` atau `−Rp … (−…%)`, dan `harga per 14.32`, atau `harga terakhir 14.32` bila `priceError`.

- [ ] **Step 1: Buat `MarketValueLine`**, lalu pakai di `HeroCard` dan daftar investasi Analitik untuk investasi dengan `symbol`. Investasi manual tidak berubah.
- [ ] **Step 2: Verifikasi build** — `npm run build` dan `npx vitest run` → lulus.
- [ ] **Step 3: Verifikasi ujung-ke-ujung di deploy preview**

Prasyarat oleh pemilik: `TWELVE_DATA_API_KEY` sudah ditambahkan di Vercel untuk **Production dan Preview**, dan migrasi Task 3 sudah dijalankan di Supabase.
Run: `git push -u origin feat/harga-pasar-investasi`, lalu buka URL preview dari Vercel.
Expected:
1. `GET <preview>/api/price?symbols=QQQ,AAPL` → JSON berisi `prices.QQQ` dan `prices.AAPL`, tanpa kunci di jawaban.
2. Tambah investasi QQQ, 1,25 unit, rata-rata 500 → nilai rupiah dan untung/rugi muncul di Analitik dan beranda.
3. Ketik kode `ZZZZQ` → "Kode tidak ditemukan".
4. Buka `<preview>/api/price?symbols=QQQ;X` → 400.
- [ ] **Step 4: Commit**

```bash
git add src/components
git commit -m "feat: tampilkan nilai pasar, untung rugi, dan waktu harga"
```
