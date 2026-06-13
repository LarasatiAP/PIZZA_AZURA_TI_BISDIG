<section class="menu-page">
    <div class="section-title">
        <h2>Menu Pizza Azura</h2>
        <p>Pilih pizza favoritmu dari koleksi menu kami yang fresh dan lezat.</p>
    </div>

    <?php 
    // Group pizza by size
    $pizzas_by_size = [];
    foreach($pizza as $p) {
        if (!isset($pizzas_by_size[$p->ukuran])) {
            $pizzas_by_size[$p->ukuran] = [];
        }
        $pizzas_by_size[$p->ukuran][] = $p;
    }
    
    // Sort by size
    ksort($pizzas_by_size);
    ?>

    <?php foreach($pizzas_by_size as $size => $pizzas): ?>
    <div class="menu-size-section">
        <h3 class="size-title">Size <?= $size ?></h3>
        
        <div class="pizza-list">
            <?php foreach($pizzas as $p): ?>
            <div class="pizza-menu-item">
                <div class="pizza-info">
                    <h4><?= $p->nama_pizza ?></h4>
                    <p class="pizza-description"><?= $p->deskripsi ?></p>
                    <p class="pizza-stock">Sisa stok: <?= (int) $p->stok > 0 ? (int) $p->stok : 'Habis' ?></p>
                </div>
                <div class="pizza-pricing">
                    <div class="price-row">
                        <span class="price-label">Harga</span>
                        <span class="price-value">Rp <?= number_format($p->harga, 0, ',', '.') ?></span>
                    </div>
                    <?php if($p->extra_mozarela): ?>
                    <div class="price-row extra">
                        <span class="price-label">+ Mozarela</span>
                        <span class="price-value">Rp <?= number_format($p->extra_mozarela, 0, ',', '.') ?></span>
                    </div>
                    <?php endif; ?>
                </div>
                <button class="btn-order-item" type="button" data-id="<?= $p->id ?>" data-name="<?= htmlspecialchars($p->nama_pizza, ENT_QUOTES) ?>" data-price="<?= $p->harga ?>">Pesan</button>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
    <?php endforeach; ?>
</section>

<style>
.menu-page {
    max-width: 1200px;
    margin: 40px auto;
    padding: 0 5%;
}

.menu-size-section {
    margin-bottom: 50px;
}

.size-title {
    font-size: 1.8rem;
    font-weight: 700;
    color: #addb41;
    margin-bottom: 25px;
    padding-bottom: 12px;
    border-bottom: 2px solid rgba(173, 219, 65, 0.3);
}

.pizza-list {
    display: grid;
    gap: 15px;
}

.pizza-menu-item {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 20px;
    align-items: center;
    padding: 16px 20px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 152, 0, 0.2);
    border-radius: 12px;
    transition: all 0.3s ease;
}

.pizza-menu-item:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(173, 219, 65, 0.5);
    box-shadow: 0 4px 12px rgba(255, 152, 0, 0.1);
}

.pizza-info h4 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 6px;
}

.pizza-description {
    font-size: 0.9rem;
    color: #999;
    margin: 0;
}

.pizza-stock {
    margin-top: 8px;
    font-size: 0.88rem;
    color: #c8e563;
    font-weight: 600;
}

.pizza-pricing {
    text-align: right;
}

.price-row {
    display: flex;
    gap: 15px;
    align-items: center;
    margin-bottom: 8px;
    font-size: 0.95rem;
}

.price-row:last-child {
    margin-bottom: 0;
}

.price-label {
    color: #888;
    min-width: 90px;
    text-align: right;
}

.price-value {
    color: #addb41;
    font-weight: 700;
    min-width: 150px;
    text-align: right;
}

.price-row.extra .price-label {
    color: #666;
    font-size: 0.85rem;
}

.price-row.extra .price-value {
    color: #ffa500;
    font-size: 0.9rem;
}

.btn-order-item {
    padding: 10px 24px;
    background: linear-gradient(135deg, #addb41, #c8e563);
    color: #050505;
    border: none;
    border-radius: 8px;
    font-weight: 700;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
}

.btn-order-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(173, 219, 65, 0.4);
}

.btn-order-item:active {
    transform: translateY(0);
}

@media (max-width: 768px) {
    .pizza-menu-item {
        grid-template-columns: 1fr;
        gap: 12px;
    }

    .pizza-pricing,
    .price-row {
        text-align: left;
    }

    .price-label,
    .price-value {
        min-width: auto;
        text-align: left;
    }

    .size-title {
        font-size: 1.4rem;
    }
}
</style>