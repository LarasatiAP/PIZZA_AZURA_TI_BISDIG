<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Orders - Pizza Azura</title>
    <link rel="stylesheet" href="<?= base_url('assets/css/admin.css') ?>">
</head>
<body>

<div class="admin-shell">
    <header class="admin-header admin-header--small">
        <div class="brand-header">
            <img src="<?= base_url('assets/images/logo.webp') ?>" alt="Azura Pizza Logo" class="brand-logo" onerror="this.style.display='none'">
            <div>
                <p class="brand-tag">Bakule Azura</p>
                <h1>Data Pesanan</h1>
                <p class="brand-note">Halaman ini disiapkan untuk memantau pesanan pelanggan.</p>
            </div>
        </div>
        <a href="<?= site_url('admin/dashboard') ?>" class="btn-secondary">Kembali ke Dashboard</a>
    </header>

    <div class="info-card">
        <h2>Saat ini tidak ada pesanan aktif.</h2>
        <p>Fitur ini akan mengumpulkan pesanan masuk saat sistem order online sudah terintegrasi.</p>
    </div>
</div>

</body>
</html>