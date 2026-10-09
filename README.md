# Visualisasi Dijkstra — Hijir Ismail

Web presentasi versi terbaru: Dijkstra sebagai fokus, Bellman–Ford dan A* sebagai pembanding. Berisi ringkasan, studi kasus kampus, simulasi interaktif, langkah program, kompleksitas, hasil runtime, pembanding, kesimpulan, serta 12 referensi.

## Jalankan lokal
Buka index.html di browser. Alternatif: jalankan `python -m http.server 8000` di folder ini, lalu buka http://localhost:8000.

## Deploy ke Vercel melalui GitHub
1. Ekstrak ZIP ini.
2. Buat repository GitHub dan unggah seluruh isi folder ini. Pastikan index.html, app.js, dan vercel.json berada pada root repository, bukan di dalam folder tambahan.
3. Di Vercel, pilih Add New → Project, lalu impor repository tersebut.
4. Pilih Framework Preset: Other; Root Directory: root repository; Build Command: kosong; Install Command: kosong; Output Directory: . (titik). vercel.json sudah menyediakan pengaturan ini.
5. Klik Deploy.

## Alternatif: Vercel CLI
Jika Node.js sudah terpasang, buka terminal pada folder ini lalu jalankan:
```sh
npx vercel --prod
```
Ikuti login dan pemilihan proyek. Jangan memasukkan file ZIP sebagai root proyek; ekstrak dahulu.

## Isi paket
- index.html: tampilan, materi presentasi, dan CSS.
- app.js: simulasi algoritma dan kontrol interaktif.
- dijkstra_kampus_singkat.py: program Python yang dapat diunduh dari web.
- vercel.json: konfigurasi proyek statis Vercel.
- README.md: panduan ini.

Web memakai HTML/CSS/JavaScript statis, tanpa kebutuhan backend atau environment variable. Program Python di paket dijalankan terpisah pada komputer; simulasi web berjalan menggunakan JavaScript.

Dokumentasi: https://vercel.com/docs/builds/configure-a-build
