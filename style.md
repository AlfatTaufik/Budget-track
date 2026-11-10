# Nusa Track — Style Guide

Gaya visual Nusa Track: **poster brutalis editorial**. Tiga warna, huruf raksasa yang padat,
blok warna rata, garis tebal, dan tekstur kertas kasar. Referensinya poster arsitektur brutalis:
tipografi adalah gambarnya, bukan hiasan di atas gambar.

Semua token di bawah ini didefinisikan di `src/App.css` (`:root`). Pakai token, jangan menulis hex baru.

## 1. Prinsip

1. **Tiga warna saja.** Hitam, kertas, merah. Abu beton hanya sebagai nada antara. Tidak ada pastel, gradasi, atau warna keempat.
2. **Angka adalah poster.** Nominal uang tampil paling besar di layar, dengan huruf display yang padat.
3. **Blok, bukan kartu.** Permukaan adalah bidang warna rata bersudut siku. Tanpa bayangan, tanpa sudut membulat.
4. **Garis yang bekerja.** Garis tebal memisahkan bagian; garis pendek menandai label.
5. **Label kecil, huruf besar.** Teks pendukung selalu kapital, kecil, dan renggang, kontras dengan judul raksasa.
6. **Kasar dengan sengaja.** Butiran kertas, arsir diagonal, dan barcode memberi rasa cetakan.

## 2. Warna

| Token | Hex | Pakai untuk |
|---|---|---|
| `--ink` | `#0E0E0E` | Teks, garis, blok gelap, sidebar |
| `--paper` | `#E9E4D8` | Latar halaman |
| `--paper-light` | `#F4F1E8` | Permukaan kartu dan modal |
| `--paper-deep` | `#DDD7C9` | Permukaan sekunder, chip, latar ikon |
| `--concrete` | `#A8A39A` | Nada tengah, garis bantu, segmen grafik |
| `--concrete-dark` | `#52504C` | Teks sekunder |
| `--red` | `#E0271B` | Blok aksen, tombol utama aktif, bar pengeluaran |
| `--red-text` | `#B81C12` | Teks merah di atas kertas (kontras cukup untuk teks kecil) |

Makna warna:

- **Merah = uang keluar, bahaya, dan satu aksi utama per layar.** Jangan dipakai sebagai dekorasi acak.
- **Hitam = uang masuk, kondisi normal, dan struktur.**
- Status tidak boleh hanya dibedakan lewat warna: sertakan tanda `+` / `−`, ikon, atau label.
- Di atas blok merah, teks kecil memakai `--ink`; hanya angka besar yang boleh putih.

## 3. Tipografi

| Peran | Font | Aturan |
|---|---|---|
| Display | **Anton** (`--font-display`) | Kapital, `line-height` 0.9–1, untuk judul dan semua nominal |
| Isi & label | **Archivo** (`--font-body`) | 400–800; label = kapital, 700, `letter-spacing` 0.12em |
| Aksen | **Instrument Serif** (`--font-serif`) | Hanya di dalam lencana pil (`.poster-pill`) |

- Anton hanya punya satu ketebalan. `font-synthesis: none` aktif supaya browser tidak menebalkannya secara palsu.
- Skala display: nominal hero `clamp(2.75rem, 19cqi, 6rem)`, judul halaman 1.5–2.5rem, judul bagian 1–1.25rem.
- Label (`.kicker`, `.section-title`): 0.6875rem, kapital, renggang, sering diikuti garis pendek (`.rule`).
- Teks vertikal (`.vertical-text`) boleh dipakai sebagai aksen di tepi blok, maksimal satu per blok.

## 4. Bentuk

- **Sudut:** 0. Satu-satunya pengecualian adalah lencana pil (`.poster-pill`).
- **Garis:** 2px `--ink` untuk bingkai, 4–6px untuk garis penegas di atas bagian.
- **Bayangan:** tidak ada. Kedalaman dibuat dengan blok warna yang berdampingan.
- **Jarak:** kelipatan 4px; blok hero memakai padding 20–28px.

## 5. Tekstur

| Kelas | Efek |
|---|---|
| butiran (otomatis, `body::before`) | Noise halus di seluruh layar, tidak menangkap klik |
| `.hatch` | Arsir diagonal hitam |
| `.barcode` | Strip barcode dekoratif |
| `.rule` | Garis pendek penanda label |

Tekstur murni dekoratif: beri `aria-hidden` dan jangan menaruh informasi di dalamnya.

## 6. Komponen

- **Blok poster** (`.poster` + `.poster-ink` / `.poster-red` / `.poster-paper`): bidang warna penuh untuk bagian hero. Tiap blok dibuka dengan label bernomor (`01 — Dompet`).
- **Kartu** (`.glass-card`): `--paper-light`, bingkai 2px, garis atas 6px.
- **Tombol utama** (`.btn-primary`): hitam, teks kertas, kapital; hover menjadi merah.
- **Tombol sekunder** (`.btn-ghost`): bingkai 2px; hover terbalik menjadi hitam.
- **Tombol tambah** (`.fab`): blok merah. Ini satu-satunya aksi merah yang selalu terlihat.
- **Navigasi:** blok hitam; item aktif adalah blok merah. Di desktop menjadi sidebar dengan nama aplikasi raksasa.
- **Input:** bingkai 2px, fokus mengubah bingkai menjadi merah (tanpa glow).
- **Modal:** lembar kertas dengan garis atas merah 6px.
- **Lencana pil** (`.poster-pill`): nama aplikasi dalam serif, dengan baris kecil `KATA / KATA / KATA`.

## 7. Tata letak

- **Mobile (< 1024px):** satu kolom, header dan navigasi bawah menempel.
- **Desktop (≥ 1024px):** layar penuh tanpa bingkai; sidebar hitam 232px di kiri, konten kertas di kanan.
- Beranda adalah komposisi poster: blok hitam (dompet) di kiri, blok merah (total kekayaan) dan blok kertas (aset) di kanan.

## 8. Gerak

Singkat dan tegas: 100–140ms, tanpa pantulan. Hover berupa pembalikan warna, bukan pergeseran atau bayangan.
`prefers-reduced-motion` dihormati.

## 9. Jangan

- Jangan menambah warna di luar tabel.
- Jangan memakai `border-radius`, `box-shadow`, atau gradasi halus.
- Jangan menulis judul dengan huruf kecil atau nominal dengan font isi.
- Jangan memakai merah untuk lebih dari satu aksi utama dalam satu layar.
