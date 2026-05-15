/**
 * ============================================
 * PIZZA AZURA — Admin Dashboard Logic
 * ============================================
 */

const ORDER_TYPE_LABELS = { dinein: 'Dine In', takeaway: 'Take Away' };
const PAYMENT_LABELS = { cash: 'Tunai', qris: 'QRIS', transfer: 'Transfer Bank' };
const STATUS_LABELS = {
    pending: { text: 'Menunggu', icon: '⏳' },
    done: { text: 'Selesai', icon: '✅' },
};

let currentOrderFilter = 'all';
let autoRefreshInterval = null;

// ---- HELPERS ----
function getToken() { return localStorage.getItem('pizzaAzura_adminToken'); }
function setToken(token) { localStorage.setItem('pizzaAzura_adminToken', token); }
function clearToken() { localStorage.removeItem('pizzaAzura_adminToken'); }

function formatCurrency(amount) { return 'Rp ' + amount.toLocaleString('id-ID'); }

async function apiFetch(url, options = {}) {
    const token = getToken();
    if (token) {
        options.headers = { ...options.headers, 'Authorization': 'Bearer ' + token };
    }
    return fetch(url, options);
}

// ---- INITIALIZE ----
document.addEventListener('DOMContentLoaded', async () => {
    // Check if already logged in
    const token = getToken();
    if (token) {
        try {
            const res = await apiFetch('/api/auth/check');
            if (res.ok) {
                showDashboard();
                return;
            }
        } catch (e) { /* token invalid */ }
        clearToken();
    }
    showLogin();
});

// Enter key login
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && document.getElementById('loginScreen').style.display !== 'none') {
        doLogin();
    }
});

// ---- AUTH ----
function showLogin() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('dashboard').style.display = 'none';
    if (autoRefreshInterval) clearInterval(autoRefreshInterval);
}

function showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    loadDashboard();
    autoRefreshInterval = setInterval(loadDashboard, 5000);
}

async function doLogin() {
    const username = document.getElementById('loginUser').value.trim();
    const password = document.getElementById('loginPass').value;
    const errorEl = document.getElementById('loginError');
    const btn = document.getElementById('loginBtn');

    if (!username || !password) {
        errorEl.textContent = '⚠️ Masukkan username dan password';
        return;
    }

    btn.disabled = true;
    btn.textContent = '⏳ Memproses...';
    errorEl.textContent = '';

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const data = await res.json();

        if (!res.ok) {
            errorEl.textContent = '❌ ' + (data.error || 'Login gagal');
            btn.disabled = false;
            btn.textContent = '🔐 Login';
            return;
        }

        setToken(data.token);
        showDashboard();
        showToast('✅ Login berhasil!');

    } catch (err) {
        errorEl.textContent = '❌ Terjadi kesalahan';
    }

    btn.disabled = false;
    btn.textContent = '🔐 Login';
}

async function doLogout() {
    try { await apiFetch('/api/auth/logout', { method: 'POST' }); } catch (e) {}
    clearToken();
    showLogin();
    showToast('👋 Logout berhasil');
}

// ---- DASHBOARD ----
async function loadDashboard() {
    await Promise.all([loadStats(), loadOrders()]);
}

async function loadStats() {
    try {
        const res = await apiFetch('/api/stats');
        if (!res.ok) { if (res.status === 401) { clearToken(); showLogin(); } return; }
        const stats = await res.json();
        renderStats(stats);
    } catch (e) { console.error('Stats error:', e); }
}

function renderStats(stats) {
    document.getElementById('statsRow').innerHTML = `
        <div class="stat-card">
            <div class="stat-icon yellow">📦</div>
            <div class="stat-info"><h3>${stats.todayOrders}</h3><p>Pesanan Hari Ini</p></div>
        </div>
        <div class="stat-card">
            <div class="stat-icon green">💰</div>
            <div class="stat-info"><h3>${formatCurrency(stats.todayRevenue)}</h3><p>Pendapatan Hari Ini</p></div>
        </div>
        <div class="stat-card">
            <div class="stat-icon orange">⏳</div>
            <div class="stat-info"><h3>${stats.pendingOrders}</h3><p>Pending</p></div>
        </div>
        <div class="stat-card">
            <div class="stat-icon blue">✅</div>
            <div class="stat-info"><h3>${stats.doneOrders}</h3><p>Total Selesai</p></div>
        </div>
    `;
}

// ---- ORDERS ----
// loadOrders is defined at the bottom with allOrders storage

function filterOrders(status, btn) {
    currentOrderFilter = status;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadOrders();
}

function renderOrders(orders) {
    if (currentOrderFilter !== 'all') {
        orders = orders.filter(o => o.status === currentOrderFilter);
    }

    // Sort: pending first, then by time
    orders.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return new Date(b.created_at) - new Date(a.created_at);
    });

    const container = document.getElementById('orderList');

    if (orders.length === 0) {
        container.innerHTML = `<div class="empty-state"><span>📭</span><p>Belum ada pesanan${currentOrderFilter !== 'all' ? ' dengan status ini' : ''}</p></div>`;
        return;
    }

    container.innerHTML = orders.map(order => {
        const sl = STATUS_LABELS[order.status] || STATUS_LABELS.pending;
        const badgeClass = 'badge-' + order.status;
        const timeStr = new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        const qNum = String(order.queue_number).padStart(3, '0');

        let actionButtons = '';
        if (order.status === 'pending') {
            actionButtons = `
                <button class="action-btn success" onclick="event.stopPropagation(); updateStatus('${order.id}', 'done')">✅ Selesaikan</button>
                <button class="action-btn danger" onclick="event.stopPropagation(); deleteOrder('${order.id}')">🗑️ Hapus</button>
            `;
        }

        const itemSummary = order.items.map(i => `${i.menu_name} (Size ${i.size}) ×${i.quantity}`).join(', ');

        return `
        <div class="order-card" onclick="showOrderDetail('${order.id}')" style="cursor:pointer;">
            <div class="order-card-header">
                <div style="display:flex;align-items:center;gap:12px;">
                    <span class="order-queue-badge">#${qNum}</span>
                    <div>
                        <span class="order-status-badge ${badgeClass}">${sl.icon} ${sl.text}</span>
                    </div>
                </div>
                <div class="order-meta">
                    <span>🕐 ${timeStr}</span>
                    <span>${ORDER_TYPE_LABELS[order.order_type] || order.order_type}</span>
                    <span>${PAYMENT_LABELS[order.payment_method] || order.payment_method}</span>
                </div>
            </div>
            <div class="order-customer">
                <span class="customer-name">👤 ${order.customer_name}</span>
            </div>
            <div class="order-items-list">
                <div class="order-item-row"><span>🍕 ${itemSummary}</span><span style="font-weight:700;color:var(--accent)">${formatCurrency(order.total)}</span></div>
            </div>
            <div class="order-actions">${actionButtons}</div>
        </div>`;
    }).join('');
}

async function updateStatus(orderId, status) {
    try {
        const res = await apiFetch(`/api/orders/${orderId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        if (res.ok) {
            await loadDashboard();
            const sl = STATUS_LABELS[status];
            showToast(`${sl.icon} ${orderId} → ${sl.text}`);
        }
    } catch (e) { showToast('❌ Gagal update status'); }
}

async function deleteOrder(orderId) {
    if (!confirm(`Hapus pesanan ${orderId}?`)) return;
    try {
        const res = await apiFetch(`/api/orders/${orderId}`, { method: 'DELETE' });
        if (res.ok) {
            await loadDashboard();
            showToast('🗑️ Pesanan dihapus');
        }
    } catch (e) { showToast('❌ Gagal menghapus'); }
}

// ---- RESET ----
async function resetData() {
    if (!confirm('Reset semua data pesanan? Data akan dihapus permanen.')) return;
    try {
        const res = await apiFetch('/api/reset', { method: 'POST' });
        if (res.ok) {
            await loadDashboard();
            showToast('🔄 Data pesanan telah direset');
        }
    } catch (e) { showToast('❌ Gagal reset'); }
}

// ---- TOAST ----
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

// ---- ORDER DETAIL POPUP ----
let allOrders = [];
const _origLoadOrders = loadOrders;

async function loadOrders() {
    try {
        const res = await apiFetch('/api/orders');
        if (!res.ok) { if (res.status === 401) { clearToken(); showLogin(); } return; }
        allOrders = await res.json();
        renderOrders(allOrders);
    } catch (e) { console.error('Orders error:', e); }
}

function showOrderDetail(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;
    const sl = STATUS_LABELS[order.status] || STATUS_LABELS.pending;
    const qNum = String(order.queue_number).padStart(3, '0');
    const timeStr = new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    let actionHtml = '';
    if (order.status === 'pending') {
        actionHtml = `<button class="action-btn success" style="width:100%;padding:16px;font-size:18px;" onclick="updateStatus('${order.id}','done');closeOrderDetail()">✅ Selesaikan Pesanan</button>`;
    }

    document.getElementById('orderDetailContent').innerHTML = `
        <div style="text-align:center;margin-bottom:20px;">
            <div style="font-size:64px;font-weight:800;background:linear-gradient(135deg,var(--accent),var(--accent2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:4px;">#${qNum}</div>
            <span class="order-status-badge badge-${order.status}" style="font-size:16px;padding:8px 20px;">${sl.icon} ${sl.text}</span>
        </div>
        <div style="background:var(--bg-primary);border-radius:12px;padding:16px;margin-bottom:16px;">
            <div style="font-size:20px;font-weight:700;margin-bottom:6px;">👤 ${order.customer_name}</div>
            <div style="color:var(--text-secondary);font-size:14px;">
                🕐 ${timeStr} &nbsp;|&nbsp; ${ORDER_TYPE_LABELS[order.order_type] || order.order_type} &nbsp;|&nbsp; ${PAYMENT_LABELS[order.payment_method] || order.payment_method}
            </div>
            ${order.notes ? `<div style="margin-top:8px;color:var(--accent);font-size:14px;">📝 ${order.notes}</div>` : ''}
        </div>
        <div style="margin-bottom:16px;">
            <div style="font-size:13px;font-weight:600;color:var(--text-secondary);text-transform:uppercase;margin-bottom:10px;">Detail Pesanan</div>
            ${order.items.map(item => {
                const tpText = item.toppings.length > 0 ? '<br><span style="color:var(--text-muted);font-size:13px;">+ ' + item.toppings.map(t => t.topping_name).join(', ') + '</span>' : '';
                const tpTotal = item.toppings.reduce((s, t) => s + t.topping_price, 0);
                const itemTotal = (item.price + tpTotal) * item.quantity;
                return `<div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:var(--bg-primary);border-radius:10px;margin-bottom:8px;">
                    <div><span style="font-size:16px;font-weight:600;">🍕 ${item.menu_name}</span><br><span style="color:var(--text-muted);font-size:13px;">Size ${item.size} × ${item.quantity}</span>${tpText}</div>
                    <span style="font-size:16px;font-weight:700;color:var(--accent);">${formatCurrency(itemTotal)}</span>
                </div>`;
            }).join('')}
        </div>
        <div style="display:flex;justify-content:space-between;font-size:22px;font-weight:800;padding:16px 0;border-top:2px solid var(--border);">
            <span>TOTAL</span><span style="color:var(--accent);">${formatCurrency(order.total)}</span>
        </div>
        ${actionHtml}
    `;
    document.getElementById('orderDetailModal').classList.add('active');
}

function closeOrderDetail() {
    document.getElementById('orderDetailModal').classList.remove('active');
}

document.getElementById('orderDetailModal')?.addEventListener('click', e => {
    if (e.target.id === 'orderDetailModal') closeOrderDetail();
});
