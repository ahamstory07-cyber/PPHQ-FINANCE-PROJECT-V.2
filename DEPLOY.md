# Panduan Deployment di VPS Ubuntu 24.04

Dokumen ini menjelaskan cara melakukan deploy PPHQ Finance ke VPS Anda menggunakan Node.js dan Nginx.

## Prasyarat
1. VPS Ubuntu 24.04
2. Domain atau Alamat IP VPS yang bisa diakses
3. Node.js (Versi 18 ke atas) & npm

## Langkah 1: Persiapan Server

Update sistem dan install Node.js:
```bash
sudo apt update
sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git nginx
```

## Langkah 2: Kloning Repositori

Masuk ke direktori `/var/www` dan klon project Anda:
```bash
cd /var/www
# Ganti dengan URL repo GitHub Anda
sudo git clone https://github.com/username/pphq-finance.git
sudo chown -R $USER:$USER pphq-finance
cd pphq-finance
```

## Langkah 3: Konfigurasi Environment

Copy file `.env.example` ke `.env` dan isi valuenya:
```bash
cp .env.example .env
nano .env
```
Isi dengan data Google Client ID dan URL Apps Script Anda.

## Langkah 4: Install dan Build

```bash
npm install
npm run build
```

## Langkah 5: Menjalankan Aplikasi

Anda punya dua opsi:

### Opsi A: Menggunakan `npm run preview` (Cepat untuk testing)
```bash
# Gunakan PM2 supaya tetap jalan di background
sudo npm install -g pm2
pm2 start "npm run preview" --name pphq-finance
```

### Opsi B: Menggunakan Nginx (Terbaik untuk Produksi)
Ini akan membuat aplikasi lebih cepat dan aman (mendukung HTTPS).

1. Edit konfigurasi Nginx:
```bash
sudo nano /etc/nginx/sites-available/pphq-finance
```

2. Masukkan konfigurasi berikut (ganti `domain_anda.com`):
```nginx
server {
    listen 80;
    server_name domain_anda.com; # atau IP VPS

    location / {
        root /var/www/pphq-finance/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

3. Aktifkan konfigurasi:
```bash
sudo ln -s /etc/nginx/sites-available/pphq-finance /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Troubleshooting
- **Port 4000**: Jika Anda ingin menjalankan via `npm run preview` di port 4000, pastikan Anda sudah membuka port tersebut di firewall:
  ```bash
  sudo ufw allow 4000
  ```
- **Updates**: Untuk update aplikasi, cukup jalankan:
  ```bash
  git pull
  npm install
  npm run build
  pm2 restart pphq-finance # Jika pakai PM2
  ```
