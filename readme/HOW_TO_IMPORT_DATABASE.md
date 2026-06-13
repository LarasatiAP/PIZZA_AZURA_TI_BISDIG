# Panduan Import Database MySQL — Pizza Azura

Dokumen ini menjelaskan cara mengimpor file database `pizza_azura.sql` ke MySQL lokal Anda (seperti XAMPP, Laragon, atau MySQL Standalone).

---

## 📋 Prasyarat
1. Pastikan Anda sudah menginstal **XAMPP**, **Laragon**, atau server MySQL di komputer lokal Anda.
2. Pastikan service **MySQL** (dan Apache untuk phpMyAdmin) sudah dalam keadaan **Running** (Aktif).

---

## 🛠️ Cara 1: Menggunakan phpMyAdmin (Sangat Direkomendasikan & Mudah)

1. **Jalankan MySQL**:
   - Buka XAMPP Control Panel dan klik tombol **Start** pada modul **Apache** dan **MySQL**.
2. **Akses phpMyAdmin**:
   - Buka browser Anda (Chrome, Firefox, dll), lalu buka alamat:
     [http://localhost/phpmyadmin/](http://localhost/phpmyadmin/)
3. **Buat Database Baru**:
   - Klik menu **New** (Baru) di bagian kiri atas.
   - Masukkan nama database: `pizza_azura`.
   - Klik tombol **Create** (Buat).
4. **Import File SQL**:
   - Klik database `pizza_azura` yang baru dibuat agar terpilih.
   - Klik tab **Import** di bar menu bagian atas.
   - Klik tombol **Choose File** (Pilih File) dan pilih file `pizza_azura.sql` yang ada di folder project ini:
     `pizza_azura.sql`
   - Gulir ke bawah halaman dan klik tombol **Import** (atau **Go** / **Kirim**).
   - Tunggu hingga proses selesai dengan notifikasi sukses berwarna hijau.

---

## 💻 Cara 2: Menggunakan Command Line (Terminal / CMD)

Jika Anda lebih menyukai baris perintah:

1. Buka **Terminal** (di Linux/macOS) atau **Command Prompt** (di Windows).
2. Jalankan perintah berikut untuk mengimpor (ganti path file `.sql` sesuai lokasi folder Anda jika diperlukan):
   ```bash
   mysql -u root -p < pizza_azura.sql
   ```
   *Catatan:*
   - Perintah di atas akan secara otomatis membuat database `pizza_azura` (karena di dalam file `.sql` sudah ada perintah `CREATE DATABASE IF NOT EXISTS`) dan langsung mengimpor seluruh tabel beserta data bawaan (*seed data*).
   - Jika MySQL Anda default tanpa password, Anda bisa menghapus opsi `-p` atau langsung menekan **Enter** saat diminta memasukkan password.

---

## 🔑 Konfigurasi Kredensial Database di Project

Secara default, project ini menggunakan konfigurasi MySQL standar XAMPP (tanpa password):
- **Host**: `localhost`
- **User**: `root`
- **Password**: *(kosong)*
- **Database**: `pizza_azura`

Jika kredensial MySQL lokal Anda berbeda (misalnya Anda memiliki password root), Anda harus mengubah pengaturannya di dua tempat berikut:

### 1. Backend Node.js (Express Server)
Buka file `db.js` pada baris ke-18 dan sesuaikan nilainya:
```javascript
// db.js (Line 18)
pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',      // Sesuaikan user Anda
    password: '',      // Sesuaikan password Anda
    database: 'pizza_azura',
    ...
});
```

### 2. Backend PHP (CodeIgniter 3)
Buka file `application/config/database.php` pada baris ke-78 dan sesuaikan nilainya:
```php
// application/config/database.php (Line 78)
$db['default'] = array(
	'dsn'	=> '',
	'hostname' => 'localhost',
	'username' => 'root',   // Sesuaikan user Anda
	'password' => '',       // Sesuaikan password Anda
	'database' => 'pizza_azura',
	'dbdriver' => 'mysqli',
    ...
);
```
