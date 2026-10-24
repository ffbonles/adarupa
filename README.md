# ADARUPA — Jelajah Budaya Nusantara
> **"Cerita yang Hidup, Budaya yang Terhubung."**

ADARUPA adalah platform kebudayaan digital Indonesia untuk menemukan dan merawat warisan cerita rakyat lisan, sandiwara audio, ensiklopedia permainan tradisional, serta agenda festival budaya nusantara.

---

## 1. Empat Kategori Resmi

ADARUPA dibangun secara ketat berdasarkan empat ranah kebudayaan:

1. **LALAKON (Film & Tutur Visual)**
   - Media: Video
   - Subkategori: *Cerita Rakyat, Legenda Nusantara, Animasi Nusantara, Film Pendek, Dokumenter Budaya, Seni Pertunjukan*.
   - Contoh: Legenda Sangkuriang & Tangkuban Parahu, Asal Mula Danau Toba, Dokumenter Tenun Ikat Sumba Timur, Seni Tari Saman Gayo.

2. **GEMA SWARA (Tutur Audio & Sandiwara Radio)**
   - Media: Audio (dengan pemutar persisten yang tetap aktif saat berpindah laman)
   - Subkategori: *Dongeng Audio, Sandiwara Radio, Podcast Nusantara, Kisah Sejarah, Musik dan Suara Tradisi*.
   - Fitur: Mendukung struktur episode berseri (seperti *Sandiwara Radio Tutur Tinular* dan *Podcast Jejak Rempah Banda*), scrubber progress, navigasi antar babak, pengatur kecepatan putar (0.75x–1.5x), dan transkrip cerita.

3. **GELANGGANG (Permainan Tradisional)**
   - Media: Video tutorial & panduan terstruktur
   - Subkategori: *Permainan Papan, Permainan Kelompok, Permainan Ketangkasan, Permainan Strategi, Permainan Daerah*.
   - Fitur: Panduan lengkap jumlah pemain, alat & bahan, aturan main baku, langkah instruksi bertahap, dan catatan keselamatan fisik (misal: Congklak/Dhakon, Gobak Sodor/Galasin, Egrang Bambu).

4. **PAGELARAN (Agenda Festival & Upacara Adat)**
   - Media: Poster, peta lokasi, jadwal kalender
   - Subkategori: *Festival Budaya, Pertunjukan Seni, Pameran Budaya, Upacara Adat, Lokakarya dan Edukasi*.
   - Fitur: Filter provinsi, status waktu (*Mendatang, Berlangsung, Selesai*), verifikasi kurator resmi, simpan ke Google Calendar, unduh berkas kalender `.ics`, dan tautan registrasi tiket resmi.

---

## 2. Arsitektur & Teknologi

- **Frontend**: React 19, TypeScript, Tailwind CSS v4 ("Modern Nusantara Editorial": palet dominan Maroon `#800020`, Deep Maroon `#590018`, Forest Green `#1B3A2F`, Warm Gold `#D4A373`, Ivory Canvas `#F8F3E9`).
- **Backend API**: Google Apps Script (GAS) Web App modular (10 berkas di folder `gas-backend/`).
- **Database Metadata**: Google Sheets (9 lembar kerja terstruktur).
- **Penyimpanan Berkas Media**: Google Drive (video MP4, audio MP3, poster, thumbnail).
- **Autentikasi Administrator**: Kode OTP 6-digit via `MailApp.sendEmail` (kadaluwarsa 10 menit, batas 5 percobaan, jeda kirim ulang 60 detik).

---

## 3. Matriks Status Implementasi Fitur

| Fitur / Komponen | Status Implementasi | Keterangan |
| :--- | :---: | :--- |
| **Katalog Publik (4 Kategori)** | Selesai (100%) | Dapat diakses bebas tanpa login |
| **Pencarian Terpadu (Global Search)** | Selesai (100%) | Debounced search lintas judul, daerah, kategori & agenda |
| **Pemutar Video (Lalakon & Gelanggang)** | Selesai (100%) | Kontrol kustom + adapter pratinjau Google Drive |
| **Pemutar Audio Persisten (Gema Swara)** | Selesai (100%) | Audio melayang persisten dengan navigasi episode seri |
| **Ekspor Kalender Pagelaran** | Selesai (100%) | Tautan Google Calendar instan & generator berkas `.ics` |
| **Autentikasi Admin via Email OTP** | Selesai (100%) | Flow OTP lengkap dengan kotak surat simulasi evaluasi |
| **Dasbor CMS Kurator Budaya** | Selesai (100%) | CRUD Konten, Pagelaran, dan Tautan Media Drive |
| **Pustaka Media Google Drive** | Selesai (100%) | Manajemen ID berkas, tipe MIME, dan status akses |
| **Source Code Backend Google Apps Script** | Selesai (100%) | 10 berkas lengkap di direktori `gas-backend/` |
| **Penyambungan URL Live GAS Eksternal** | Siap Dikonfigurasi | Dapat diuji langsung di menu Pengaturan CMS |

---

## 4. Panduan Deployment Backend Google Apps Script

Source code backend terletak di folder `gas-backend/`:
- `Main.gs` — Endpoint `doGet` dan `doPost`, penanganan JSON & CORS.
- `Router.gs` — Pengarah aksi publik dan terautentikasi.
- `ContentService.gs` — CRUD konten, pagination, filter, dan metrik dasbor.
- `EventService.gs` — Manajemen agenda pagelaran dan validasi tanggal.
- `MediaService.gs` — Manajemen relasi aset berkas Google Drive.
- `AuthService.gs` — Hashing OTP, pengiriman surel, dan pembuatan token sesi.
- `CategoryService.gs` — Manajemen kategori & subkategori.
- `SettingsService.gs` — Pengaturan publik aplikasi.
- `Validation.gs` — Helper sanitasi string, slug, dan email.
- `Utilities.gs` — Inisialisasi otomatis lembar kerja database.

### Langkah Penerapan:
1. Buat Google Spreadsheet baru di Google Drive Anda, beri nama **ADARUPA_DATABASE**.
2. Salin ID Spreadsheet dari tautan browser Anda.
3. Buka menu **Ekstensi > Apps Script**.
4. Buat 10 berkas `.gs` sesuai nama di folder `gas-backend/` dan tempelkan isinya.
5. Buka **Project Settings (ikon roda gigi) > Script Properties**, tambahkan properti:
   - Nama properti: `SPREADSHEET_ID`
   - Nilai: *(ID Spreadsheet Anda)*
6. Buka berkas `Utilities.gs`, pilih fungsi `Utilities_gs.setupAdarupaSheets`, lalu klik **Run (Jalankan)**. Semua 9 sheet dan kategori awal akan terbuat seketika!
7. Klik **Deploy > New deployment**.
   - Pilih jenis: **Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
8. Salin URL Web App yang dihasilkan (contoh: `https://script.google.com/macros/s/.../exec`).
9. Masuk ke Dasbor Admin ADARUPA di web (`/admin/login`), buka tab **Pengaturan & Integrasi GAS**, tempel URL tersebut lalu klik **Uji Koneksi Backend**.

---

## 5. Skema Lembar Kerja Google Sheets

Struktur lembar kerja yang dihasilkan secara otomatis:
1. `SETTINGS`: `setting_key`, `setting_value`, `updated_at`
2. `CATEGORIES`: `category_id`, `slug`, `name`, `description`, `icon`, `display_order`, `is_active`
3. `SUBCATEGORIES`: `subcategory_id`, `category_id`, `slug`, `name`, `description`, `display_order`, `is_active`
4. `CONTENT`: `content_id`, `slug`, `title`, `description`, `category_id`, `subcategory_id`, `content_type`, `origin_province`, `origin_city`, `duration_seconds`, `cover_file_id`, `primary_media_asset_id`, `series_id`, `publication_status`, `is_featured`, `published_at`, `created_at`, `updated_at`, `credits_json`, `tutorial_json`
5. `MEDIA_ASSETS`: `media_asset_id`, `content_id`, `drive_file_id`, `file_name`, `mime_type`, `file_size`, `asset_role`, `access_classification`, `availability_status`, `created_at`, `updated_at`
6. `SERIES`: `series_id`, `title`, `slug`, `description`, `category_id`, `cover_file_id`, `publication_status`
7. `EPISODES`: `episode_id`, `series_id`, `content_id`, `episode_number`, `title`, `display_order`
8. `EVENTS`: `event_id`, `slug`, `title`, `description`, `category`, `province`, `city`, `venue`, `address`, `start_datetime`, `end_datetime`, `organizer`, `poster_file_id`, `official_source_url`, `registration_url`, `verification_status`, `publication_status`, `event_status`, `created_at`, `updated_at`
9. `ADMINS`: `admin_id`, `email`, `display_name`, `role`, `account_status`, `created_at`, `updated_at`
10. `AUDIT_LOG`: `log_id`, `admin_id`, `action`, `resource_type`, `resource_id`, `timestamp`, `result`, `details`
11. `SITE_CONTENT`: `config_key`, `config_value`, `content_type`, `updated_at`, `publication_status` (Menyimpan seluruh konfigurasi dinamis publik & draf)
12. `CONFIG_HISTORY`: `version_id`, `snapshot_json`, `published_by`, `published_at`, `summary_of_changes` (Menyimpan riwayat snapshot untuk fitur rollback instan)

---

## 5.1. Sistem Pengaturan Tampilan & Konten Website (Zero Hardcoded Branding)

Platform ADARUPA menerapkan prinsip **Zero Hardcoded Branding**. Seluruh identitas visual, teks redaksi, tajuk seksi, konfigurasi navigasi, narasi halaman statis, dan palet warna diatur langsung oleh administrator melalui menu **"Pengaturan Tampilan & Konten Website"** dengan 10 panel khusus:

1. **Identitas Merek**: Logo utama (Insignia SVG atau berkas gambar Drive), logo alternatif, favicon, nama platform, slogan deskriptor, narasi merek, kurator, dan surel kontak.
2. **Tema dan Warna**: Penyesuaian variabel warna CSS (Merah Marun `#800020`, Marun Pekat, Hijau Rimba, Emas Hangat, Latar Gading, Aksen Terakota), pilihan tipografi judul (Playfair, Cinzel, Baskerville, Lora), dan saklar pola corak batik.
3. **Beranda**: Hero kicker lencana, judul utama, subjudul, tombol CTA primer & sekunder beserta rute tujuan, serta judul & subjudul untuk setiap seksi beranda.
4. **Navigasi**: Pengaturan label tautan bilah navigasi atas, rute path, saklar visibilitas (tampil/sembunyi), dan urutan posisi menu.
5. **Kategori dan Subkategori**: Nama tampilan, lencana, deskripsi editorial, subteks, dan sampul gambar untuk 4 kategori resmi (`lalakon`, `gema-swara`, `gelanggang`, `pagelaran`) dengan perlindungan slug URL permanen.
6. **Halaman Statis**: Penyunting naskah redaksi lengkap untuk *Tentang Kami* (`/tentang`), *Pedoman Kurasi Konten* (`/pedoman-konten`), *Kebijakan Privasi* (`/kebijakan-privasi`), dan *Syarat Penggunaan* (`/syarat-ketentuan`).
7. **Teks Antarmuka**: Teks tombol pencarian, placeholder modal, label filter & sort, teks tombol putar, pesan penelusuran nihil (*empty-state*), dan notifikasi salin tautan.
8. **Footer dan Informasi Kontak**: Pernyataan misi kebudayaan, kutipan falsafah budaya, format hak cipta tahunan dinamis `{year}`, alamat lokasi fisik, telepon, dan tautan akun media sosial.
9. **Pratinjau dan Publikasi**: Simulator pratinjau multi-perangkat (Desktop & Ponsel 375px), pemantau selisih status draf vs publikasi, dan tombol rilis publik satu klik.
10. **Riwayat Perubahan & Rollback**: Arsip snapshot otomatis dari setiap aksi publikasi sebelumnya dengan kemampuan pemulihan (*instant rollback*) ke versi manapun.

---

## 6. Struktur Folder Media Google Drive

Sesuai rekomendasi tata kelola berkas, buat folder utama **ADARUPA_MEDIA** di Google Drive Anda:
```
ADARUPA_MEDIA/
├── 01_LALAKON/       (Video MP4 film pendek & dokumenter cerita rakyat)
├── 02_GEMA_SWARA/    (File audio MP3 sandiwara radio, podcast & musik)
├── 03_GELANGGANG/    (Video MP4 peragaan tutorial permainan tradisional)
├── 04_PAGELARAN/     (Poster grafis, foto resolusi tinggi agenda acara)
└── 05_BRANDING/      (Logo vector, aset tipografi, dan grafis panduan)
```

Pastikan izin tautan pada berkas publik diatur ke **"Siapa saja yang memiliki tautan dapat melihat"** agar dapat diputar oleh pemutar media peramban.

---

## 7. Daftar Uji Kelayakan (Testing Checklist)

- [x] Akses publik tanpa perlu login untuk seluruh katalog, pemutar video, pemutar audio, dan kalender acara.
- [x] Navigasi mobile responsif dengan bilah bawah jempol (*thumb navigation*) dan target sentuh $\ge 44\text{px}$.
- [x] Tampilan editorial bebas "AI slop" tanpa pill enclosure pada metadata teks biasa.
- [x] Pemutar audio tetap aktif saat pengguna menjelajahi halaman lain.
- [x] Autentikasi OTP membatasi percobaan salah maksimal 5 kali dan kadaluwarsa dalam 10 menit.
- [x] Ekspor kalender Pagelaran menghasilkan tautan Google Calendar dan unduhan berkas `.ics` yang valid.
- [x] Admin CMS membedakan status draf dan publikasi tanpa mengekspos rahasia server ke peramban.
- [x] Semua aksi administratif terekam ke dalam tabel `AUDIT_LOG`.
