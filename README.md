# ShadowTeacher - ASD Tracker Apps

Aplikasi pencatatan aktivitas dan perilaku harian untuk guru pendamping anak berkebutuhan khusus (Autism Spectrum Disorder / ASD) dengan antarmuka Glassmorphism yang modern. Aplikasi ini dirancang untuk memudahkan pemantauan, pelaporan, dan kolaborasi antara Shadow Teacher, Guru Kelas, Administrator, dan Orang Tua.

## 🌟 Fitur Utama

- **Pencatatan Aktivitas Harian**: Mencatat kegiatan anak secara mendetail, termasuk waktu, durasi, lokasi, dan jenis aktivitas.
- **Pemantauan Perilaku & Sensorik**: Memantau indikator penting seperti *tantrum*, *aggression*, *elopement*, *refusal*, serta tingkat beban sensorik (*sensory load*) dan kepatuhan (*compliance*).
- **Dashboard & Analitik**: Visualisasi data aktivitas dan perilaku melalui grafik interaktif (menggunakan Recharts).
- **Manajemen Pengguna (Multi-role)**: 
  - `Admin`: Mengelola pengguna, persetujuan pendaftaran anak, dan penugasan guru.
  - `Shadow Teacher`: Mencatat dan memantau aktivitas anak yang didampingi.
  - `Teacher`: Memantau perkembangan anak di kelasnya.
  - `Parent`: Melihat laporan harian dan metrik perkembangan anak.
- **Tampilan Berbasis Waktu**: Mendukung tampilan harian (Timeline), mingguan, dan tahunan (Calendar view).
- **Antarmuka Modern**: Desain UI berbasis *Glassmorphism* yang elegan, responsif, dan mudah digunakan (dibangun dengan Tailwind CSS).

## 🛠️ Teknologi yang Digunakan

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Ikon**: Lucide React
- **Grafik & Visualisasi**: Recharts
- **Database**: PostgreSQL (via Neon Serverless)
- **Autentikasi & Keamanan**: Custom JWT / Session & bcryptjs (untuk hashing password)

## 🚀 Persyaratan Sistem

Sebelum menjalankan aplikasi, pastikan Anda telah menginstal:
- [Node.js](https://nodejs.org/) (versi 18 atau lebih baru)
- npm atau yarn

## ⚙️ Instalasi dan Menjalankan Proyek

1. **Kloning repositori ini** (Jika Anda belum melakukannya):
   ```bash
   git clone https://github.com/username-anda/ShadowTeacher.git
   cd ShadowTeacher
   ```

2. **Instal dependensi**:
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variable**:
   Buat file `.env` di *root* direktori proyek dan tambahkan konfigurasi database Neon Anda:
   ```env
   # Contoh konfigurasi jika ada environment variable spesifik yang dibutuhkan
   # (Note: Saat ini koneksi DB diatur di services/db.ts, namun praktik terbaik adalah memindahkannya ke .env)
   ```
   *(Catatan: Pastikan string koneksi database Anda di `services/db.ts` atau `.env` sudah benar dan memiliki akses ke database Neon).*

4. **Jalankan aplikasi di lingkungan pengembangan (Development)**:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:3000`.

5. **Build untuk Produksi**:
   ```bash
   npm run build
   ```

## 🗄️ Skema Database Utama

Aplikasi ini menggunakan 3 tabel utama:
1. **`users`**: Menyimpan data akun dengan berbagai peran (*role*).
2. **`children`**: Menyimpan data profil anak, diagnosis, dan relasi ke guru/orang tua.
3. **`activities`**: Menyimpan log aktivitas harian, metrik perilaku, dan catatan spesifik.

Saat pertama kali dijalankan, fungsi `initDB()` di `services/db.ts` akan otomatis membuat tabel-tabel ini jika belum ada dan mengisi data pengguna *default* (admin, shadow, guru, ortu).

## 🤝 Kontribusi

Kontribusi selalu diterima! Jika Anda menemukan *bug* atau ingin menambahkan fitur baru:
1. *Fork* repositori ini.
2. Buat *branch* fitur Anda (`git checkout -b fitur-baru`).
3. *Commit* perubahan Anda (`git commit -m 'Menambahkan fitur baru'`).
4. *Push* ke *branch* tersebut (`git push origin fitur-baru`).
5. Buka *Pull Request*.

## 📄 Lisensi

[MIT License](LICENSE)
