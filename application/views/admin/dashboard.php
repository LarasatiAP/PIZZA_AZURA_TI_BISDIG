<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Pizza Azura</title>
    <link rel="stylesheet" href="<?= base_url('assets/css/admin.css') ?>">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
</head>
<body>

<div class="page-shell">
    <header class="page-header">
        <div class="brand-top">
            <div class="brand-icon">
                <img src="<?= base_url('assets/images/logo.svg') ?>" alt="Azura Logo">
            </div>
            <div class="brand-copy">
                <p class="brand-tag">Pizza Azzura Admin</p>
                <h1>Dashboard Admin</h1>
            </div>
        </div>
    </header>

    <section class="page-grid">
        <article class="status-card">
            <div class="status-card-top">
                <p class="eyebrow">Ringkasan</p>
                <h2>Selamat datang, Admin</h2>
                <p>Kelola menu, pesanan, dan transaksi Pizza Azzura dari satu halaman administratif.</p>
            </div>

            <div class="status-secondary">
                <div class="status-widget">
                    <div class="icon-circle">
                        <span class="material-icons">inventory_2</span>
                    </div>
                    <div>
                        <strong>Total Menu</strong>
                        <span><?= $total_pizza ?> item</span>
                    </div>
                </div>
                <div class="status-widget">
                    <div class="icon-circle">
                        <span class="material-icons">shopping_bag</span>
                    </div>
                    <div>
                        <strong>Total Pesanan</strong>
                        <span>0 pesanan</span>
                    </div>
                </div>
            </div>

            <div class="status-secondary" style="margin-top: 18px;">
                <div class="status-widget">
                    <div class="icon-circle">
                        <span class="material-icons">receipt_long</span>
                    </div>
                    <div>
                        <strong>Total Transaksi</strong>
                        <span>0 transaksi</span>
                    </div>
                </div>
                <div class="status-widget">
                    <div class="icon-circle">
                        <span class="material-icons">menu_book</span>
                    </div>
                    <div>
                        <strong>Menu Baru</strong>
                        <span>Tambah menu baru dengan mudah</span>
                    </div>
                </div>
            </div>
        </article>

        <aside class="assist-card">
            <div class="assist-top">
                <span class="material-icons">dashboard</span>
                <div>
                    <h3>Aksi Cepat</h3>
                    <p>Pilih fitur berikut untuk langsung ke pengelolaan.</p>
                </div>
            </div>
            <div class="quick-links">
                <a href="<?= site_url('admin/menu') ?>" class="call-button">Kelola Menu</a>
                <a href="<?= site_url('admin/orders') ?>" class="call-button">Lihat Pesanan</a>
                <a href="<?= site_url('admin/transaksi') ?>" class="call-button">Transaksi</a>
            </div>
        </aside>
    </section>

    <section class="live-queue-card">
        <div class="live-queue-header">
            <div>
                <h3>Menu Terbaru</h3>
                <p>3 item terakhir</p>
            </div>
        </div>

        <div class="queue-grid">
            <?php if(!empty($pizza)): ?>
                <?php foreach(array_slice($pizza, 0, 3) as $p): ?>
                    <div class="queue-box">
                        <div class="queue-left">
                            <span class="material-icons">local_pizza</span>
                            <div>
                                <strong><?= $p->nama_pizza ?></strong>
                                <p>Rp <?= number_format($p->harga,0,',','.') ?></p>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            <?php else: ?>
                <div class="queue-box">
                    <p>Tidak ada menu terbaru saat ini.</p>
                </div>
            <?php endif; ?>
        </div>
    </section>
</div>

</body>
</html>