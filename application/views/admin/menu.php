<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Menu - Pizza Azura</title>
    <link rel="stylesheet" href="<?= base_url('assets/css/admin.css') ?>">
</head>
<body>

<div class="admin-shell">
    <header class="admin-header">
        <div class="brand-header">
            <img src="<?= base_url('assets/images/logo.webp') ?>" alt="Azura Pizza Logo" class="brand-logo" onerror="this.style.display='none'">
            <div>
                <p class="brand-tag">Bakule Azura</p>
                <h1>Kelola Menu Pizza</h1>
                <p class="brand-note">Tambahkan, sunting, atau hapus menu pizza langsung dari dashboard admin.</p>
            </div>
        </div>
        <a href="<?= site_url('admin/menu/add') ?>" class="btn-primary">+ Tambah Menu Baru</a>
    </header>

    <section class="admin-nav-cards">
        <a href="<?= site_url('admin/dashboard') ?>" class="nav-pill">Dashboard</a>
        <a href="<?= site_url('admin/menu') ?>" class="nav-pill active">Menu</a>
        <a href="<?= site_url('admin/orders') ?>" class="nav-pill">Orders</a>
        <a href="<?= site_url('admin/transaksi') ?>" class="nav-pill">Transaksi</a>
    </section>

    <div class="table-card">
        <div class="table-card-header">
            <h2>Daftar Pizza</h2>
            <span><?= count($pizza) ?> menu tersedia</span>
        </div>

        <div class="table-responsive">
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Gambar</th>
                        <th>Nama Pizza</th>
                        <th>Deskripsi</th>
                        <th>Harga</th>
                        <th>Stok</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <?php $no = 1; foreach($pizza as $p): ?>
                    <tr>
                        <td><?= $no++ ?></td>
                        <td><img src="<?= base_url('assets/images/'.$p->gambar) ?>" alt="<?= $p->nama_pizza ?>" class="table-image"></td>
                        <td><?= $p->nama_pizza ?></td>
                        <td><?= character_limiter($p->deskripsi, 80) ?></td>
                        <td>Rp <?= number_format($p->harga,0,',','.') ?></td>
                        <td><?= (int) $p->stok ?></td>
                        <td class="action-cell">
                            <a href="<?= site_url('admin/menu/edit/'.$p->id) ?>" class="btn-secondary small">Edit</a>
                            <a href="<?= site_url('admin/menu/delete/'.$p->id) ?>" class="btn-danger small" onclick="return confirm('Hapus menu <?= addslashes($p->nama_pizza) ?>?');">Hapus</a>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

</body>
</html>