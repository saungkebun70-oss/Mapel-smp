# MAPEL — Jadwal Pelajaran & Kegiatan Siswa SMPN 3 KARAWANG

Aplikasi perencana jadwal pelajaran **Senin–Minggu** (Jam Belajar Pagi & Jam Belajar Siang), catatan PR, checklist tas harian, dan pengingat jadwal kelas dengan autentikasi serta isolasi data pribadi berbasis **Firebase Authentication** & **Cloud Firestore**.

## Menjalankan Secara Lokal

```bash
npm install
npm run dev
```

Aplikasi berjalan di `http://localhost:3000`.

## Deploy Otomatis ke Vercel dari GitHub

Proyek ini sudah dilengkapi:
- **`vercel.json`**: Konfigurasi build **Vite** (`dist`), SPA fallback routing, dan header `Cross-Origin-Opener-Policy: same-origin-allow-popups` untuk mendukung login Google (`signInWithPopup`).
- **`.github/workflows/ci-vercel.yml`**: Workflow **GitHub Actions** yang otomatis menjalankan `npm run lint` + `npm run build` di setiap `push` ke branch `main`, dan dapat men-deploy ke Vercel secara otomatis.

### 1. Push Kode ke GitHub

```bash
git init
git add .
git commit -m "Setup MAPEL SMPN 3 KARAWANG siap deploy Vercel"
git branch -M main
git remote add origin https://github.com/<username>/<nama-repo>.git
git push -u origin main
```

### 2. Aktifkan Auto-Deploy di Vercel

1. Buka [vercel.com](https://vercel.com) → **Add New Project**.
2. Pilih repository GitHub Anda lalu klik **Import**.
3. Pengaturan berikut otomatis terbaca dari `vercel.json`:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Klik **Deploy**. Setelah selesai, salin link asli dari tombol **Visit** di dashboard Vercel Anda (contoh: `https://nama-project-anda.vercel.app`) — jangan gunakan nama domain yang belum dideploy agar tidak muncul `404 DEPLOYMENT_NOT_FOUND`.
5. Setiap kali Anda `git push` ke `main`, Vercel otomatis membangun dan mempublikasikan versi terbaru.
6. *(Opsional)* Jika ingin deploy lewat GitHub Actions CLI, tambahkan repository secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, dan `VERCEL_PROJECT_ID` di GitHub Settings → Secrets and variables → Actions.

### 3. Wajib: Daftarkan Domain Vercel di Firebase Auth

Agar login **Nama & PIN** berjalan di domain Vercel Anda:

1. Buka [Firebase Console](https://console.firebase.google.com/) dan pilih proyek `xenodochial-clover-g6tvw`.
2. Masuk ke **Authentication → Settings → Authorized domains**.
3. Klik **Add domain**, lalu masukkan domain `.vercel.app` asli milik project Vercel Anda.
4. Pastikan metode **Email/Password** sudah aktif di **Authentication → Sign-in method** (dipakai di balik layar untuk akun **Nama & PIN** siswa).

### Variabel Lingkungan (Opsional)

Secara default konfigurasi klien Firebase dibaca dari `firebase-applet-config.json`. Jika ingin menimpanya lewat **Vercel → Project Settings → Environment Variables**, Anda dapat menambahkan variabel `VITE_FIREBASE_*` sesuai contoh di `.env.example`.
