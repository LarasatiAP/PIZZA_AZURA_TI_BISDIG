<div class="customer-dashboard">
    <div class="dashboard-grid">
        <section class="dashboard-summary">
            <div class="dashboard-card order-info-card">
                <div class="card-header">
                    <div>
                        <small class="label-pill">Order #AZ-92837</small>
                        <h1>Cooking...</h1>
                    </div>
                    <div class="order-status-chip">In Progress</div>
                </div>

                <div class="order-detail-row">
                    <div>
                        <span class="detail-label">Estimated Delivery</span>
                        <strong>10 mins</strong>
                    </div>
                    <div>
                        <span class="detail-label">Queue Position</span>
                        <strong>3rd</strong>
                    </div>
                </div>

                <div class="order-copy">
                    <p>Pesanan Anda sedang disiapkan oleh tim dapur Azura. Silakan tunggu sementara pizza panas disiapkan dan dikirim segera.</p>
                </div>

                <div class="order-items-card">
                    <div class="order-items-header">
                        <div>
                            <h2>Your Order</h2>
                            <span>Chef masih menyiapkan pesanan</span>
                        </div>
                        <span class="order-items-count">3 Items</span>
                    </div>

                    <ul class="order-items-list">
                        <li>
                            <div>Chicken Cheese</div>
                            <span>Rp 98.000</span>
                        </li>
                        <li>
                            <div>Classic Pepperoni</div>
                            <span>Rp 72.000</span>
                        </li>
                        <li>
                            <div>Garlic Bread</div>
                            <span>Rp 25.000</span>
                        </li>
                    </ul>

                    <div class="order-total-row">
                        <span>Total</span>
                        <strong>Rp 195.000</strong>
                    </div>
                </div>
            </div>

            <div class="dashboard-card assistance-card">
                <div class="assistance-top">
                    <div>
                        <small class="label-pill">Need assistance?</small>
                        <h2>Butuh bantuan?</h2>
                    </div>
                    <button class="btn-secondary">Call Admin</button>
                </div>
                <p class="assistance-text">Tim customer service siap membantu jika Anda butuh perubahan pesanan, bantuan pembayaran, atau tracking.</p>
            </div>
        </section>

        <aside class="dashboard-sidebar">
            <div class="dashboard-card queue-card">
                <div class="queue-header">
                    <div>
                        <small class="label-pill">Live Queue</small>
                        <h2>Queue</h2>
                    </div>
                    <span class="queue-count">#03</span>
                </div>

                <div class="queue-list">
                    <div class="queue-item active"><span>92837</span></div>
                    <div class="queue-item"><span>92839</span></div>
                    <div class="queue-item"><span>92840</span></div>
                    <div class="queue-item"><span>92841</span></div>
                </div>
            </div>

            <div class="dashboard-card suggestions-card">
                <h2>While you wait...</h2>
                <div class="suggestion-items">
                    <div class="suggestion-item">
                        <div class="suggestion-icon">🍟</div>
                        <div>
                            <strong>Crispy Fries</strong>
                            <small>Rp 18.000</small>
                        </div>
                    </div>
                    <div class="suggestion-item">
                        <div class="suggestion-icon">🧋</div>
                        <div>
                            <strong>Lychee Tea</strong>
                            <small>Rp 16.000</small>
                        </div>
                    </div>
                    <div class="suggestion-item">
                        <div class="suggestion-icon">🧄</div>
                        <div>
                            <strong>Garlic Bread</strong>
                            <small>Rp 25.000</small>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    </div>
</div>

<style>
.customer-dashboard {
    padding: 40px 4%;
    background: #120a0d;
    color: #f3f0f1;
    min-height: calc(100vh - 120px);
}

.dashboard-grid {
    display: grid;
    grid-template-columns: 1.8fr 1fr;
    gap: 28px;
    max-width: 1320px;
    margin: 0 auto;
}

.dashboard-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 28px;
    padding: 28px;
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.25);
}

.card-header,
.assistance-top,
.queue-header,
.order-items-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    margin-bottom: 24px;
}

.label-pill {
    display: inline-flex;
    padding: 8px 14px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
    color: #f3f0f1;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.15em;
}

.order-status-chip {
    background: linear-gradient(135deg, #92d050, #f5c54c);
    color: #140d08;
    font-weight: 700;
    padding: 12px 18px;
    border-radius: 18px;
    white-space: nowrap;
}

.order-detail-row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 24px;
}

.detail-label {
    display: block;
    margin-bottom: 8px;
    color: #b8b0bb;
    font-size: 0.88rem;
}

.order-detail-row strong,
.order-total-row strong,
.queue-count {
    font-size: 1.5rem;
}

.order-copy p,
.assistance-text {
    color: #d3cbd3;
    line-height: 1.8;
    margin: 0;
}

.order-items-card,
.assistance-card,
.queue-card,
.suggestions-card {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.02);
}

.order-items-list {
    list-style: none;
    padding: 0;
    margin: 0 0 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.order-items-list li {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 16px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    color: #ece7eb;
}

.order-items-list li:last-child {
    border-bottom: none;
}

.order-total-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1rem;
    color: #fff;
    padding-top: 8px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.btn-secondary {
    background: linear-gradient(135deg, #4f3b67, #7d5bb2);
    color: #fff;
    border: none;
    padding: 12px 22px;
    border-radius: 16px;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.btn-secondary:hover {
    transform: translateY(-1px);
    box-shadow: 0 18px 30px rgba(129, 90, 199, 0.24);
}

.queue-list {
    display: grid;
    gap: 14px;
}

.queue-item {
    padding: 18px 20px;
    border-radius: 20px;
    background: rgba(255,255,255,0.04);
    color: #cfc8d4;
    font-weight: 600;
}

.queue-item.active {
    background: linear-gradient(135deg, rgba(173,219,65,0.16), rgba(255,255,255,0.08));
    color: #fff;
}

.queue-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 54px;
    min-height: 54px;
    border-radius: 16px;
    background: rgba(255,255,255,0.08);
}

.suggestion-items {
    display: grid;
    gap: 16px;
}

.suggestion-item {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 16px;
    align-items: center;
    padding: 16px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.05);
}

.suggestion-icon {
    width: 52px;
    height: 52px;
    border-radius: 18px;
    display: grid;
    place-items: center;
    background: rgba(173, 219, 65, 0.16);
    font-size: 1.4rem;
}

.suggestion-item strong {
    display: block;
    color: #fff;
    font-size: 1rem;
}

.suggestion-item small {
    color: #b8b0bb;
}

@media (max-width: 1080px) {
    .dashboard-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 760px) {
    .customer-dashboard {
        padding: 24px 16px 40px;
    }

    .card-header,
    .assistance-top,
    .queue-header,
    .order-items-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .order-detail-row {
        grid-template-columns: 1fr;
    }
}
</style>