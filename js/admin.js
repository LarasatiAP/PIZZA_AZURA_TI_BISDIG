/**
 * ============================================
 * PIZZA AZURA — Admin Dashboard Logic
 * ============================================
 */

let currentOrderFilter = 'all';
let autoRefreshInterval = null;

// ---- INITIALIZE ----
document.addEventListener('DOMContentLoaded', () => {
    renderAll();
    // Auto-refresh every 5 seconds
    autoRefreshInterval = setInterval(renderAll, 5000);
});

function renderAll() {
    renderStats();
    renderOrders();
    renderStock();
    renderWarnings();
}

// ---- PANEL SWITCHING ----
function switchPanel(panel, btn) {
    document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.admin-nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('panel-' + panel).classList.add('active');
    btn.classList.add('active');
}

// ---- STATS ----
function renderStats() {
    const orders = PizzaAzura.getOrders();
    const pending = orders.filter(o => o.status === 'pending').length;
    const processing = orders.filter(o => o.status === 'processing').length;
    const cooking = orders.filter(o => o.status === 'cooking').length;
    const done = orders.filter(o => o.status === 'done').length;
    const totalRevenue = orders.filter(o => o.status === 'done')
        .reduce((sum, o) => sum + o.total, 0);

    document.getElementById('orderStats').innerHTML = `
        <div class="stat-card">
            <div class="stat-icon yellow">⏳</div>
            <div class="stat-info">
                <h3>${pending}</h3>
                <p>Pending</p>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon blue">📋</div>
            <div class="stat-info">
                <h3>${processing + cooking}</h3>
                <p>Dalam Proses</p>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon green">✅</div>
            <div class="stat-info">
                <h3>${done}</h3>
                <p>Selesai</p>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon orange">💰</div>
            <div class="stat-info">
                <h3>${PizzaAzura.formatCurrency(totalRevenue)}</h3>
                <p>Pendapatan</p>
            </div>
        </div>
    `;
}

// ---- ORDERS ----
function filterOrders(status, btn) {
    currentOrderFilter = status;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderOrders();
}

function renderOrders() {
    let orders = PizzaAzura.getOrders();

    if (currentOrderFilter !== 'all') {
        orders = orders.filter(o => o.status === currentOrderFilter);
    }

    // Sort: pending first, then by creation time (newest first for done, oldest first for active)
    const statusPriority = { pending: 0, processing: 1, cooking: 2, done: 3 };
    orders.sort((a, b) => {
        const pa = statusPriority[a.status] ?? 4;
        const pb = statusPriority[b.status] ?? 4;
        if (pa !== pb) return pa - pb;
        return new Date(a.createdAt) - new Date(b.createdAt);
    });

    const container = document.getElementById('orderList');

    if (orders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span>📭</span>
                <p>Belum ada pesanan${currentOrderFilter !== 'all' ? ' dengan status ini' : ''}</p>
            </div>
        `;
        return;
    }

    container.innerHTML = orders.map(order => {
        const statusLabel = PizzaAzura.STATUS_LABELS[order.status];
        const badgeClass = 'badge-' + order.status;
        const createdAt = new Date(order.createdAt);
        const timeStr = createdAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

        let actionButtons = '';
        switch (order.status) {
            case 'pending':
                actionButtons = `
                    <button class="action-btn primary" onclick="updateStatus('${order.id}', 'processing')">📋 Proses</button>
                    <button class="action-btn danger" onclick="deleteOrder('${order.id}')">🗑️ Hapus</button>
                `;
                break;
            case 'processing':
                actionButtons = `
                    <button class="action-btn primary" onclick="updateStatus('${order.id}', 'cooking')">🔥 Mulai Masak</button>
                    <button class="action-btn" onclick="updateStatus('${order.id}', 'pending')">← Kembali</button>
                `;
                break;
            case 'cooking':
                actionButtons = `
                    <button class="action-btn success" onclick="updateStatus('${order.id}', 'done')">✅ Selesai</button>
                    <button class="action-btn" onclick="updateStatus('${order.id}', 'processing')">← Kembali</button>
                `;
                break;
            case 'done':
                actionButtons = `
                    <button class="action-btn danger" onclick="deleteOrder('${order.id}')">🗑️ Hapus</button>
                `;
                break;
        }

        return `
        <div class="order-card">
            <div class="order-card-header">
                <div style="display:flex; align-items:center; gap:12px;">
                    <span class="order-id">${order.id}</span>
                    <span class="order-status-badge ${badgeClass}">${statusLabel.icon} ${statusLabel.text}</span>
                </div>
                <div class="order-meta">
                    <span>🕐 ${timeStr}</span>
                    <span>${PizzaAzura.ORDER_TYPE_LABELS[order.orderType] || order.orderType}</span>
                    <span>${PizzaAzura.PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}</span>
                </div>
            </div>

            <div class="order-customer">
                <span class="customer-name">👤 ${order.name}</span>
                ${order.phone ? `<span class="customer-tag">📱 ${order.phone}</span>` : ''}
                ${order.notes ? `<span class="customer-tag">📝 ${order.notes}</span>` : ''}
            </div>

            <div class="order-items-list">
                ${order.items.map(item => {
                    const toppingText = item.toppings.length > 0
                        ? ' + ' + item.toppings.map(t => t.name).join(', ')
                        : '';
                    const toppingTotal = item.toppings.reduce((s, t) => s + t.price, 0);
                    const itemTotal = (item.price + toppingTotal) * item.quantity;
                    return `
                    <div class="order-item-row">
                        <span>${item.image} ${item.name} (${item.size}) × ${item.quantity}${toppingText}</span>
                        <span>${PizzaAzura.formatCurrency(itemTotal)}</span>
                    </div>
                    `;
                }).join('')}
            </div>

            <div class="order-total">Total: ${PizzaAzura.formatCurrency(order.total)}</div>

            <div class="order-actions">
                ${actionButtons}
            </div>
        </div>
        `;
    }).join('');
}

function updateStatus(orderId, status) {
    PizzaAzura.updateOrderStatus(orderId, status);
    renderAll();
    const label = PizzaAzura.STATUS_LABELS[status];
    showToast(`${label.icon} ${orderId} → ${label.text}`);
}

function deleteOrder(orderId) {
    if (confirm(`Hapus pesanan ${orderId}?`)) {
        PizzaAzura.deleteOrder(orderId);
        renderAll();
        showToast('🗑️ Pesanan dihapus');
    }
}

// ---- STOCK ----
function renderStock() {
    const ingredients = PizzaAzura.getIngredients();
    const container = document.getElementById('stockGrid');

    // Calculate max stock for bar width (based on initial defaults)
    const maxStock = 25;

    container.innerHTML = ingredients.map(ing => {
        const pct = Math.min(100, (ing.stock / maxStock) * 100);
        let barColor = 'green';
        let cardClass = '';
        let warningText = '';

        if (ing.stock <= 0) {
            barColor = 'red';
            cardClass = 'danger';
            warningText = `<span class="stock-danger-text">❌ Habis!</span>`;
        } else if (ing.stock <= ing.warningLevel) {
            barColor = 'yellow';
            cardClass = 'warning';
            warningText = `<span class="stock-warning-text">⚠️ Hampir habis</span>`;
        }

        return `
        <div class="stock-card ${cardClass}">
            <div class="stock-card-header">
                <span class="stock-name">${ing.name}</span>
                <span class="stock-unit">${ing.unit}</span>
            </div>
            <div class="stock-bar-container">
                <div class="stock-bar ${barColor}" style="width: ${pct}%"></div>
            </div>
            <div class="stock-info">
                <span class="stock-count">${ing.stock}</span>
                ${warningText}
            </div>
            <div class="stock-edit-row">
                <input type="number" class="stock-input" id="stock-${ing.id}" value="${ing.stock}" min="0">
                <button class="stock-save-btn" onclick="saveStock('${ing.id}')">Update</button>
            </div>
        </div>
        `;
    }).join('');
}

function saveStock(ingredientId) {
    const input = document.getElementById('stock-' + ingredientId);
    const val = parseInt(input.value);
    if (isNaN(val) || val < 0) {
        showToast('⚠️ Masukkan angka valid');
        return;
    }
    PizzaAzura.updateIngredientStock(ingredientId, val);
    renderAll();
    showToast('✅ Stok diperbarui');
}

// ---- WARNINGS ----
function renderWarnings() {
    const warnings = PizzaAzura.getStockWarnings();
    const bar = document.getElementById('warningsBar');
    const items = document.getElementById('warnItems');

    if (warnings.length === 0) {
        bar.classList.add('hidden');
        return;
    }

    bar.classList.remove('hidden');
    items.innerHTML = warnings.map(w =>
        `<span class="warn-chip">${w.name}: ${w.stock} ${w.unit}</span>`
    ).join('');
}

// ---- RESET ----
function resetData() {
    if (confirm('Reset semua data? (Menu, stok, pesanan akan kembali ke default)')) {
        PizzaAzura.resetAll();
        renderAll();
        showToast('🔄 Data telah direset');
    }
}

// ---- TOAST ----
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

// ---- MOBILE MENU ----
function toggleMobileMenu() {
    if (window.innerWidth <= 768) {
        const menu = document.getElementById('mobileMenu');
        if (menu) {
            menu.classList.toggle('open');
        }
    }
}
