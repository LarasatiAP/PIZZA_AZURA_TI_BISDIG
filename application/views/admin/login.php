<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pizza Azura Admin Login</title>
    <link rel="stylesheet" href="<?= base_url('assets/css/admin.css') ?>">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>

<div class="login-container">
    <div class="login-box login-box--wide">
        <div class="brand">
            <img src="<?= base_url('assets/images/logo.svg') ?>" alt="Azura Logo" class="login-logo">
            <div class="brand-text">
                <span>Pizza</span>
                <strong>Azura Admin</strong>
            </div>
        </div>

        <h1>Masuk Admin</h1>
        <p>Gunakan akun admin untuk mengelola menu Pizza Azura.</p>

        <?php if(isset($error)): ?>
            <div class="alert-error"><?= $error ?></div>
        <?php endif; ?>

        <form method="POST" action="<?= site_url('admin/login-process') ?>" autocomplete="off">
            <div class="input-group">
                <input type="text" name="username" placeholder="Username" value="<?= set_value('username') ?>" required>
            </div>

            <div class="input-group">
                <input type="password" name="password" placeholder="Password" required>
            </div>

            <button type="submit">Login</button>
        </form>

        <p class="small-text">Kontrol menu, pesanan, dan transaksi dari sini.</p>
    </div>
</div>

</body>
</html>