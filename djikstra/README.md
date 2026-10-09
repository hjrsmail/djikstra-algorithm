# Dijkstra Jupyter — Hijir Ismail
1. Ekstrak ZIP. Buka terminal di folder hasil ekstraksi.
2. Instal: `python -m pip install -r requirements.txt`
3. Jalankan: `python -m jupyterlab`
4. Buka Dijkstra_Visualisasi_Runtime.ipynb dan pilih Run → Run All Cells.

VSCode: buka folder ini, buka notebook, pilih kernel Python yang sudah dipasangi dependensi, lalu Run All.

algoritma.py memuat inti Dijkstra sederhana, Bellman–Ford, dan pembentuk graf sintetis dari laporan. benchmark_kampus.py memuat inti pembanding A* serta benchmark kampus yang mengikuti laporan. Tidak ada library shortest-path.

Notebook memuat rumus dan arti simbol, tabel langkah, visualisasi graf (ubah variabel tahap untuk melihat langkah 0–6), runtime kampus ketiga algoritma, runtime SSSP dua algoritma, dan data laporan sebagai acuan terpisah. Counter pada tabel kampus adalah angka acuan laporan, bukan counter yang diukur ulang. Angka runtime baru akan berbeda menurut komputer.

Hasil Run All disimpan sebagai PNG dan CSV dalam hasil_jupyter. Data acuan laporan tidak diubah. Semua file .py dan JSON harus tetap bersama notebook agar import berjalan.
