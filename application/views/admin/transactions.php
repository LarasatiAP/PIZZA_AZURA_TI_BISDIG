<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Transaksi - Pizza Azura</title>
    <link rel="stylesheet" href="<?= base_url('assets/css/admin.css') ?>">
</head>
<body>

<div class="admin-shell">
    <header class="admin-header admin-header--small">
        <div class="brand-header">
            <img src="<?= base_url('assets/images/logo.webp') ?>" alt="Azura Pizza Logo" class="brand-logo" onerror="this.style.display='none'">
            <div>
                <p class="brand-tag">Bakule Azura</p>
                <h1>Rekam Transaksi</h1>
                <p class="brand-note">Lihat ringkasan keuangan dan riwayat pembayaran.</p>
            </div>
        </div>
        <a href="<?= site_url('admin/dashboard') ?>" class="btn-secondary">Kembali ke Dashboard</a>
    </header>

    <div class="info-card">
        <h2>Belum ada data transaksi.</h2>
        <p>Transaksi akan muncul secara otomatis setelah pesanan online dan sistem pembayaran diaktifkan.</p>
    </div>
</div>

</body>
</html>