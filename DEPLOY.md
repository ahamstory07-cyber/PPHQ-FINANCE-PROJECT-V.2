# Tutorial Deployment VPS PPHQ Finance (GitHub Workflow)

Tutorial ini dirancang khusus untuk **Ubuntu 24.04** dengan target **Port 4000**.

## Ringkasan Alur Kerja
1. **Lokal**: Push kode dari AI Studio ke repositori GitHub Anda.
2. **VPS**: Tarik (Pull) kode dari GitHub ke VPS.
3. **VPS**: Konfigurasi file `.env`.
4. **VPS**: Build dan jalankan aplikasi.

---

## Langkah 1: Persiapan Awal di VPS

Masuk ke VPS Anda via SSH, lalu jalankan perintah berikut untuk menginstal Node.js dan Nginx:

```bash
# Update sistem
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 (versi stabil terbaru)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git nginx

# Cek versi untuk memastikan sukses
node -v
npm -v
```

---

## Langkah 2: Hubungkan VPS ke GitHub

Jika repo GitHub Anda bersifat **Private**, Anda perlu menambahkan SSH Key VPS ke GitHub:

1. Buat SSH Key di VPS: `ssh-keygen -t ed25519 -C "vps@anda.com"` (Tekan enter terus).
2. Lihat kodenya: `cat ~/.ssh/id_ed25519.pub`.
3. Copy kodenya dan masukkan ke **GitHub Settings > SSH and GPG keys > New SSH key**.

---

## Langkah 3: Ambil Kode dari GitHub

Masuk ke folder `/var/www` dan klon project Anda:

```bash
cd /var/www
# Ganti dengan URL SSH atau HTTPS repo Anda
git clone https://github.com/username/pphq-finance.git
cd pphq-finance
```

---

## Langkah 4: Konfigurasi File `.env` (PENTING)

Aplikasi ini menggunakan Vite, jadi file `.env` **sangat dibutuhkan** saat proses build agar URL API bisa masuk ke dalam kode.

1. Copy dari contoh:
   ```bash
   cp .env.example .env
   ```
2. Edit file `.env`:
   ```bash
   nano .env
   ```
3. Masukkan URL Google Apps Script Anda pada bagian `VITE_APP_SCRIPT_URL`. Simpan dengan `Ctrl+O` lalu `Enter`, keluar dengan `Ctrl+X`.

---

## Langkah 5: Install Dependensi & Build

```bash
npm install
npm run build
```
Hasil build akan muncul di folder `dist/`.

---

## Langkah 6: Running Aplikasi di Port 4000

Anda ingin menggunakan port 4000. Ada dua cara:

### Cara A: Menggunakan `npm run preview` (Simple)
Gunakan PM2 agar aplikasi tetap berjalan meskipun terminal ditutup.

```bash
sudo npm install -g pm2
# Jalankan di port 4000 (sudah disetting di package.json)
pm2 start "npm run preview" --name pphq-finance
```

### Cara B: Menggunakan Nginx (Sangat Direkomendasikan)
Nginx jauh lebih stabil untuk produksi dan bisa melayani banyak user sekaligus.

1. Buat file konfigurasi:
   ```bash
   sudo nano /etc/nginx/sites-available/pphq-finance
   ```
2. Tempel kode ini (Ganti `IP_VPS_ANDA` jika belum ada domain):
   ```nginx
   server {
       listen 4000;
       server_name IP_VPS_ANDA;

       location / {
           root /var/www/pphq-finance/dist;
           index index.html;
           try_files $uri $uri/ /index.html;
       }
   }
   ```
3. Aktifkan dan restart Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/pphq-finance /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

**Jangan lupa buka firewall port 4000:**
```bash
sudo ufw allow 4000
```

---

## Cara Update Aplikasi di Masa Depan

Setiap kali Anda push perubahan terbaru ke GitHub, jalankan ini di VPS:

```bash
cd /var/www/pphq-finance
git pull
npm install
npm run build
# Jika pakai PM2 (Cara A):
pm2 restart pphq-finance
# Jika pakai Nginx (Cara B), tidak perlu restart Nginx kecuali Anda mengubah konfigurasinya.
```

---

## FAQ

**Q: Apakah butuh file .env?**
**A:** Ya, sangat butuh. Vite membutuhkan variabel lingkungan (seperti URL Apps Script) saat proses `npm run build`. File ini tidak boleh di-push ke GitHub demi keamanan, jadi Anda harus membuatnya manual di VPS.

**Q: Port 4000 sudah saya pakai di VPS?**
**A:** Pastikan tidak ada aplikasi lain yang memakai port 4000. Jika ada bentrok, Anda bisa mengubah angka `4000` di `vite.config.ts` dan konfigurasi Nginx menjadi port lain.
