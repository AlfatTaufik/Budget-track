-- Nusa Track — harga pasar otomatis untuk investasi (23 Nov 2026)
-- Jalankan sekali di Supabase SQL Editor. Aman dijalankan ulang.
-- Investasi dengan symbol kosong tetap manual seperti sebelumnya.

ALTER TABLE investments ADD COLUMN IF NOT EXISTS symbol TEXT;
ALTER TABLE investments ADD COLUMN IF NOT EXISTS units NUMERIC(20, 8);
ALTER TABLE investments ADD COLUMN IF NOT EXISTS avg_price_usd NUMERIC(15, 4);
