# Harga Pasar Otomatis untuk Investasi — Rancangan

Tanggal: 23 November 2026 · Status: menunggu persetujuan

## Maksud

Nilai investasi di Nusa Track sekarang adalah angka rupiah yang diketik manual, sehingga cepat basi. Pemilik aplikasi memegang **QQQ (ETF) dan AAPL (saham) secara asli (bukan CFD) lewat XTB**, dan ingin nilainya mengikuti harga pasar terkini, termasuk untung/rugi terhadap modal. Hasilnya: total kekayaan di beranda mencerminkan nilai sebenarnya tanpa perlu menghitung sendiri.

## Sasaran

- Investasi bertipe pasar AS (ETF atau saham, misalnya QQQ dan AAPL) dicatat sebagai **kode + jumlah unit + harga beli rata-rata (USD)**; unit boleh pecahan.
- Nilainya dihitung otomatis: `unit × harga terkini (USD) × kurs USD→IDR`.
- Ditampilkan untung/rugi: nominal rupiah dan persen.
- Waktu pembaruan harga terakhir terlihat di layar.

## Bukan sasaran (versi ini)

- Tidak terhubung ke akun XTB. Unit dan modal dimasukkan/diubah pemilik sendiri.
- Tidak mendukung saham/ETF Bursa Efek Indonesia, kripto, atau emas otomatis. Jenis-jenis itu tetap manual seperti sekarang.
- Tidak ada grafik riwayat harga, dividen, atau pemisahan untung karena kurs.
- Tidak mencatat penjualan secara khusus; menjual = mengubah jumlah unit.

## Anti-sasaran (gagal walau "berfungsi")

- Total kekayaan tiba-tiba turun ke 0 atau melonjak karena harga/kurs gagal diambil.
- Kunci API ikut terkirim ke browser atau masuk repo (repo ini publik).
- Pembaruan harga mengubah saldo dompet. Harga hanya mengubah nilai investasi.

## Batasan yang sudah ada

- Aplikasi Vite statis yang di-deploy otomatis ke Vercel setiap push ke `main` (terverifikasi lewat deployment `a5b1314`), dengan data di Supabase. Belum ada fungsi server.
- Tabel `investments` hanya punya `name`, `type`, `amount` (rupiah). Semua total di aplikasi (beranda, analitik, kekayaan bersih) membaca `amount`.
- Kurs USD→IDR sudah diambil dari `open.er-api.com` saat aplikasi dibuka (`fetchUsdRate`); bila gagal memakai angka tetap 16.250 dan kurs tidak disimpan.
- Sumber harga yang diuji: Yahoo Finance menolak (HTTP 429, tanpa CORS); **Twelve Data** mengembalikan harga QQQ (paket gratis: 8 panggilan/menit, 800/hari, perlu kunci).

## Pendekatan yang dipertimbangkan

| | Cara | Kelebihan | Kekurangan |
|---|---|---|---|
| A | Browser memanggil Twelve Data langsung | Paling cepat dibuat | Kunci terlihat di kode browser & bisa dihabiskan orang lain |
| B | Fungsi Supabase sebagai perantara | Kunci aman, cache bersama | Perlu Supabase CLI & deploy manual |
| **C** | **Fungsi Vercel `api/price.js` sebagai perantara** | Kunci aman, ikut deploy otomatis saat push, tanpa alat baru | Tidak jalan di `npm run dev` biasa (jatuh ke nilai terakhir) |

**Dipilih: C.** Pemilik menyerahkan pilihan; C dipilih karena aplikasi sudah di-deploy ke Vercel lewat GitHub, sehingga kunci tetap rahasia tanpa langkah deploy tambahan.

## Rancangan

### 1. Data (Supabase)

Tambah kolom opsional ke `investments` (berkas migrasi SQL baru + `supabase_schema.sql` diperbarui):

| Kolom | Tipe | Arti |
|---|---|---|
| `symbol` | `TEXT NULL` | Kode bursa AS, huruf besar (mis. `QQQ`). Kosong = investasi manual seperti sekarang. |
| `units` | `NUMERIC(20,8) NULL` | Jumlah unit, boleh pecahan. |
| `avg_price_usd` | `NUMERIC(15,4) NULL` | Harga beli rata-rata per unit dalam USD (seperti "open price" di XTB). |

`amount` tetap ada dan artinya menjadi **nilai rupiah terakhir yang diketahui**. Untuk investasi pasar, kolom ini ditulis ulang setiap harga berhasil diperbarui. Dengan begitu semua total yang sudah ada tetap bekerja tanpa diubah, dan selalu ada nilai cadangan bila harga gagal diambil. Kebijakan RLS yang ada (per baris milik pengguna) sudah mencakup kolom baru.

### 2. Fungsi harga: `api/price.js` (Vercel)

- `GET /api/price?symbols=QQQ,AAPL` → `{ "prices": { "QQQ": 610.04, "AAPL": 230.1 }, "fetchedAt": "<ISO>" }`.
- Kunci dibaca dari variabel lingkungan Vercel `TWELVE_DATA_API_KEY`; tidak pernah dikembalikan ke browser.
- Validasi input: maksimal 10 kode, masing-masing cocok `^[A-Z][A-Z0-9.\-]{0,9}$`; selain itu 400.
- Memanggil `https://api.twelvedata.com/price?symbol=QQQ,AAPL`. Format jawaban berbeda untuk satu kode (`{"price":"..."}`) dan beberapa kode (`{"QQQ":{"price":"..."}}`), dan keduanya harus ditangani. Kode yang gagal (jawaban berisi `code`/`status: error`) dihilangkan dari hasil, bukan membuat seluruh permintaan gagal.
- Header `Cache-Control: s-maxage=300, stale-while-revalidate=600`, sehingga Vercel menyimpan jawaban 5 menit dan jatah gratis tidak habis.
- `vercel.json`: aturan rewrite ke `index.html` tidak boleh menelan `/api/*`.

### 3. Logika di aplikasi

- Fungsi hitung murni dalam modul terpisah, misalnya `src/utils/marketValue.js`:
  - `marketValueIdr(units, priceUsd, usdRate)`
  - `gainIdr(units, priceUsd, avgPriceUsd, usdRate)` dan `gainPct(priceUsd, avgPriceUsd)`
- Store (`useStore.js`):
  - `refreshMarketPrices()`: ambil semua `symbol` unik dari investasi, panggil `/api/price`, lalu untuk tiap investasi pasar perbarui `amount` (rupiah), `lastPriceUsd`, dan `priceUpdatedAt`; simpan `amount` ke Supabase hanya bila berubah.
  - Dipanggil saat data pengguna selesai dimuat dan saat halaman Analitik dibuka, bila pembaruan terakhir lebih dari 5 menit lalu.
  - Bila gagal: tidak mengubah apa pun; `priceError` diisi untuk ditampilkan.
  - **Kurs dicadangkan**: `usdRate` dan waktu ambilnya ikut disimpan di penyimpanan lokal, sehingga kegagalan ambil kurs memakai kurs terakhir yang diketahui, bukan angka tetap 16.250.
- `addInvestment` / undo hapus / `loadUserData` / `insertInvestment` membawa dan membaca tiga kolom baru (numerik diparse seperti `amount`).
- **Top up investasi pasar**: masukan berupa unit tambahan + harga per unit (USD). Unit dijumlahkan, harga rata-rata dihitung ulang secara tertimbang, dan bila "potong dari dompet" dipilih, dompet berkurang sebesar `unit tambahan × harga × kurs sekarang` lewat alur transfer ke investasi yang sudah ada.

### 4. Tampilan

- **Form tambah investasi**: untuk tipe ETF atau Saham ada pilihan "Harga otomatis (bursa AS)". Bila aktif, muncul kolom: kode, jumlah unit, harga beli rata-rata (USD). Kode diperiksa ke `/api/price` saat kolom ditinggalkan, dan harga terkini ditampilkan sebagai konfirmasi. Pratinjau nilai rupiah dihitung langsung. Mode manual tidak berubah.
- **Daftar investasi (Analitik) dan kartu aset (beranda)**: investasi pasar menampilkan `QQQ · 1,2500 unit`, nilai rupiah, serta untung/rugi (+ hitam / − merah, dengan tanda, sesuai `style.md`), plus "harga per 14.32". Bila harga gagal diambil, tampil "harga terakhir 14.32" dengan nilai terakhir yang diketahui.
- **Mengubah investasi yang sudah ada** (mis. entri manual "ETF" Rp 19,4 juta milik pemilik): ada aksi "Atur harga otomatis" yang mengubahnya menjadi investasi pasar dengan mengisi kode, unit, dan harga rata-rata.
- **Mengedit investasi pasar** (mis. setelah menjual sebagian): tombol edit yang sekarang mengubah angka rupiah, untuk investasi pasar, membuka kolom unit dan harga rata-rata (USD). Nilai rupiahnya tidak bisa diketik langsung karena dihitung dari harga.

### 5. Yang harus dilakukan pemilik (tidak bisa dilakukan pembangun)

1. Daftar akun gratis di Twelve Data dan ambil kunci API.
2. Tambahkan variabel lingkungan `TWELVE_DATA_API_KEY` di pengaturan proyek Vercel (Production), lalu deploy ulang.
3. Jalankan berkas migrasi SQL di SQL Editor Supabase.
4. Ubah entri ETF manual menjadi QQQ dan AAPL dengan unit dan harga rata-rata dari aplikasi XTB.

## Keputusan pembangun (bukan dari pemilik, dicatat agar bisa dikoreksi)

- Modal disimpan sebagai **harga rata-rata USD per unit**, bukan total rupiah yang dikeluarkan. Akibatnya untung/rugi tidak memisahkan efek perubahan kurs.
- Interval pembaruan 5 menit, dan hanya saat aplikasi dibuka; tidak ada pembaruan di latar belakang.
- Tipe yang mendapat opsi harga otomatis: ETF dan Saham.
- Saat pengembangan lokal (`npm run dev`), `/api/price` tidak tersedia, sehingga aplikasi memakai nilai terakhir. Untuk menguji ujung-ke-ujung dipakai `vercel dev` atau deploy preview.
- Fungsi hitung murni diberi tes unit; ini tes otomatis pertama di proyek, sehingga pembangun memilih kerangkanya (mis. Vitest, yang cocok dengan Vite).

## Diserahkan ke pembangun

Penamaan berkas dan komponen, letak persis elemen UI selama mengikuti `style.md`, dan penanganan edge case kecil (mis. unit 0, kode duplikat).
