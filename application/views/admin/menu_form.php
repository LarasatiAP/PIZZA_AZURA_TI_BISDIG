<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $action === 'edit' ? 'Edit Menu' : 'Tambah Menu' ?> - Pizza Azura</title>
    <link rel="stylesheet" href="<?= base_url('assets/css/admin.css') ?>">
</head>
<body>

<div class="admin-shell">
    <header class="admin-header admin-header--small">
        <div class="brand-header">
            <img src="<?= base_url('assets/images/logo.webp') ?>" alt="Azura Pizza Logo" class="brand-logo" onerror="this.style.display='none'">
            <div>
                <p class="brand-tag">Bakule Azura</p>
                <h1><?= $action === 'edit' ? 'Ubah Menu Pizza' : 'Tambah Menu Pizza' ?></h1>
                <p class="brand-note">Gunakan form ini untuk memperbarui data menu pizza.</p>
            </div>
        </div>
        <a href="<?= site_url('admin/menu') ?>" class="btn-secondary">Kembali ke Daftar Menu</a>
    </header>

    <div class="form-card">
        <form method="POST" action="<?= site_url($action === 'edit' ? 'admin/menu/update/'.$pizza->id : 'admin/menu/save') ?>" enctype="multipart/form-data">
            <div class="form-group">
                <label>Nama Pizza</label>
                <input type="text" name="nama_pizza" value="<?= isset($pizza) ? $pizza->nama_pizza : '' ?>" required>
            </div>

            <div class="form-group">
                <label>Deskripsi</label>
                <textarea name="deskripsi" rows="5" required><?= isset($pizza) ? $pizza->deskripsi : '' ?></textarea>
            </div>

            <div class="form-group">
                <label>Harga</label>
                <input type="number" name="harga" value="<?= isset($pizza) ? $pizza->harga : '' ?>" required>
            </div>

            <div class="form-group">
                <label>Stok Pizza</label>
                <input type="number" name="stok" min="0" value="<?= isset($pizza) ? (int) $pizza->stok : 0 ?>" required>
            </div>

            <div class="form-group">
                <label>Gambar Menu</label>
                <input type="file" name="gambar" accept="image/*">
                <?php if(isset($pizza) && $pizza->gambar): ?>
                    <div class="preview-image">
                        <img src="<?= base_url('assets/images/'.$pizza->gambar) ?>" alt="Preview">
                    </div>
                <?php endif; ?>
            </div>

            <div class="form-actions">
                <button type="submit" class="btn-primary"><?= $action === 'edit' ? 'Simpan Perubahan' : 'Tambah Menu' ?></button>
            </div>
        </form>
    </div>
</div>

</body>
</html>