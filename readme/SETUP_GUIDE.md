# Setup Pizza Azura - Panduan Integrasi

## Perubahan yang Telah Dilakukan

### 1. Logo Navbar
- ✅ Dibuat logo SVG baru di `assets/images/logo.svg` dengan desain Pizza Azura dari PDF
- ✅ Updated header.php untuk menggunakan logo SVG baru
- ✅ Enhanced styling navbar dengan color scheme hijau (#addb41) dan orange (#ff9800)

### 2. Styling Navbar
- ✅ Dibuat file `assets/css/navbar.css` dengan desain modern
- ✅ Navbar menggunakan backdrop blur dengan border orange
- ✅ Brand name berwarna hijau dengan text shadow
- ✅ Navigation menu dengan hover effect dan underline animation
- ✅ Responsive design untuk mobile

### 3. Styling Pizza Cards
- ✅ Dibuat file `assets/css/cards.css` dengan kartu produk yang menarik
- ✅ Pizza card dengan hover effect (transform & shadow)
- ✅ Size badge di corner kanan atas
- ✅ Price display dengan extra mozarela
- ✅ Cart button dengan gradient orange
- ✅ Responsive grid layout

### 4. Menu Items
- ✅ Dibuat migration file: `application/migrations/001_add_pizza_azura_menu.php`
- ✅ Contains all 20 menu items dari PDF (10 size 22, 10 size 26)
- ✅ Setiap item memiliki: nama, ukuran, harga, extra mozarela, deskripsi, gambar

### 5. Menu Page Update
- ✅ Updated `application/views/menu.php` untuk menampilkan menu grouped by size
- ✅ Tampilan list dengan detail harga dan extra mozarela
- ✅ Modern styling dengan responsive design

### 6. Home Page Update  
- ✅ Updated `application/views/home.php` untuk menampilkan 6 popular items
- ✅ Added "Lihat Semua Menu" button untuk link ke halaman menu lengkap
- ✅ Enhanced card display dengan size badge

---

## Langkah-Langkah Implementasi

### Step 1: Update Database Schema
Run migration untuk create table pizzas dan insert menu items:

```php
// Di dalam controller atau command line
$this->load->library('migration');
$this->migration->version(1); // Run migration 001
```

Atau via database client, jalankan SQL:

```sql
-- Create table pizzas (jika belum ada)
CREATE TABLE IF NOT EXISTS pizzas (
    id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nama_pizza VARCHAR(100) NOT NULL,
    ukuran VARCHAR(10) NOT NULL,
    harga INT(11) NOT NULL,
    extra_mozarela INT(11) NULL,
    deskripsi TEXT NULL,
    gambar VARCHAR(100) DEFAULT 'pizza-default.webp',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert menu items (dari file migration)
INSERT INTO pizzas VALUES
-- Size 22
(1, 'Pizza Corn Cheese', '22', 25000, 35000, 'Corn dan keju mozarela', 'pizza-default.webp', NOW(), NOW()),
(2, 'Pizza Corn Sosis', '22', 25000, 35000, 'Jagung dan sosis', 'pizza-default.webp', NOW(), NOW()),
... [dan seterusnya untuk semua 20 items]
```

### Step 2: Verify File Structure
Pastikan file-file berikut sudah ada:

```
assets/
  ├── css/
  │   ├── navbar.css (NEW)
  │   ├── cards.css (NEW)
  │   └── style.css (existing)
  ├── images/
  │   └── logo.svg (NEW)
  └── js/

application/
  ├── migrations/
  │   └── 001_add_pizza_azura_menu.php (NEW)
  ├── helpers/
  │   └── menu_data_helper.php (NEW)
  ├── views/
  │   ├── menu.php (UPDATED)
  │   ├── home.php (UPDATED)
  │   └── templates/
  │       └── header.php (UPDATED)
  └── models/
      └── Pizza_model.php (existing)
```

### Step 3: Test Display

1. Akses halaman Home: http://localhost/Pizza_Azura/
   - Cek navbar dengan logo baru
   - Cek 6 popular items dengan styling baru

2. Akses halaman Menu: http://localhost/Pizza_Azura/menu
   - Cek menu grouped by size 22 dan 26
   - Cek tampilan harga dan extra mozarela

### Step 4: Troubleshooting

**Problem: Logo tidak muncul**
- Pastikan file `assets/images/logo.svg` exists
- Check browser console untuk error
- Cek path di header.php correct

**Problem: CSS tidak loaded**
- Clear browser cache (Ctrl+Shift+Delete)
- Pastikan navbar.css dan cards.css di lokasi yang benar
- Check CSS file path di header.php

**Problem: Menu items tidak tampil**
- Jalankan migration untuk create/populate table
- Check database connection
- Verify pizzas table exists dan berisi data

---

## File References

### Navigation & Branding
- [Header Template](application/views/templates/header.php)
- [Navbar Styles](assets/css/navbar.css)

### Menu Display
- [Menu Page](application/views/menu.php)
- [Home Page](application/views/home.php)
- [Menu Model](application/models/Pizza_model.php)

### Styling
- [Cards Styles](assets/css/cards.css)
- [Main Styles](assets/css/style.css)

### Database
- [Migration File](application/migrations/001_add_pizza_azura_menu.php)
- [Menu Data Helper](application/helpers/menu_data_helper.php)

---

## Customization Options

### Ubah Warna Brand
Edit di `navbar.css`:
```css
.brand-name {
    color: #addb41; /* Ubah ke warna lain */
}
```

### Ubah Logo
Edit file `assets/images/logo.svg` atau ganti dengan image PNG/JPG

### Ubah Menu Items
Edit migration file atau langsung INSERT ke database

### Ubah Layout Menu
Edit `application/views/menu.php` structure

---

## Notes

- Logo SVG dapat di-customize lebih lanjut sesuai kebutuhan brand
- Semua styling responsive untuk mobile, tablet, dan desktop
- Database schema siap untuk expansion (tambah fields/items)
- Migration system siap untuk version control database

## Total Changes Summary
- 2 new CSS files (navbar.css, cards.css)
- 1 new SVG logo file
- 1 new migration file
- 1 new helper file (menu_data)
- 3 updated view files (header.php, menu.php, home.php)
- 0 changes to PHP logic/models
