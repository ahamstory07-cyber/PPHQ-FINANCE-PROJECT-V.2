# Tutorial Deployment VPS PPHQ Finance (Database Lokal di VPS)

Tutorial ini menggunakan **Express + SQLite**, sehingga database tersimpan langsung sebagai file di folder VPS Anda. Tidak perlu Google Apps Script atau database online lainnya.

## Langkah 1: Persiapan Server VPS

Pastikan Anda menggunakan **Ubuntu 24.04**. Hubungkan ke VPS via SSH, lalu install Node.js:

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git nginx
```

---

## Langkah 2: Ambil Kode dari GitHub

```bash
cd /var/www
git clone https://github.com/ahamstory07-cyber/PPHQ-FINANCE-PROJECT-V.2.git pphq-finance
cd pphq-finance
```

---

## Langkah 3: Install & Build

```bash
npm install
npm run build
```
Proses build ini akan menyatukan Frontend ke dalam folder `dist/` yang nanti akan dilayani oleh Server Express.

---

## Langkah 4: Running Aplikasi (Port 4000)

Kita akan menggunakan **PM2** agar aplikasi terus berjalan di background:

```bash
sudo npm install -g pm2
# Jalankan server.ts menggunakan pm2
pm2 start node server.ts --name pphq-finance --env NODE_ENV=production
```

Sekarang aplikasi Anda sudah berjalan di `http://IP_VPS_ANDA:4000`.

---

## Langkah 5: Login Pertama Kali

Aplikasi sudah saya buatkan **user default** agar Anda bisa masuk pertama kali:
- **Email:** `admin@pphq.org`
- Tidak butuh password (cukup masukkan email tersebut di halaman login).

Setelah masuk, Anda bisa menambahkan user lain melalui menu Users.

---

## Cara Update Aplikasi

Setiap ada perubahan, Anda cukup melakukan ini di terminal VPS:
```bash
cd /var/www/pphq-finance
git pull
npm install
npm run build
pm2 restart pphq-finance
```

**Database Anda aman:** File `database.sqlite` tidak akan terhapus saat Anda melakukan `git pull` karena file tersebut dibuat secara lokal di VPS.

