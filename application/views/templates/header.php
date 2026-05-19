<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title><?= isset($title) ? $title.' | Pizza Azura' : 'Pizza Azura' ?></title>

    <link rel="stylesheet" href="<?= base_url('assets/css/style.css') ?>">
    <link rel="stylesheet" href="<?= base_url('assets/css/navbar.css') ?>">
    <link rel="stylesheet" href="<?= base_url('assets/css/cards.css') ?>">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>

<header class="site-header">
    <div class="header-inner">
        <a href="<?= base_url() ?>" class="brand-link">
            <img src="<?= base_url('assets/images/logo.svg') ?>" alt="Pizza Azura" class="site-logo">
            <div class="brand-copy">
                <span class="brand-name">Azura</span>
                <small class="brand-tag">Bakule Azura Pizza</small>
            </div>
        </a>

        <ul class="nav-menu">
            <li><a href="<?= base_url() ?>">Home</a></li>
            <li><a href="<?= site_url('menu') ?>">Menu</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#footer">Contact</a></li>
        </ul>

        <div class="nav-actions">
            <a href="<?= site_url('cart') ?>" class="cart-button" aria-label="View cart">
                <span class="cart-icon" aria-hidden="true">🛒</span>
                <span class="cart-count" id="cart-count">0</span>
            </a>
        </div>
    </div>
</header>