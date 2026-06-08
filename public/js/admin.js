/**
 * ============================================
 * PIZZA AZURA — Admin Dashboard Logic
 * ============================================
 */

const ORDER_TYPE_LABELS = { dinein: 'Dine In', takeaway: 'Take Away' };
const PAYMENT_LABELS = { cash: 'Tunai', qris: 'QRIS', transfer: 'Transfer Bank', whatsapp: 'WhatsApp' };
const STATUS_LABELS = {
    pending: { text: 'Menunggu', icon: '⏳' },
    done: { text: 'Selesai', icon: '✅' },
};

let currentOrderFilter = 'all';
let autoRefreshInterval = null;
let currentAdminRole = 'admin'; // will be set on login

// ---- HELPERS ----
function getToken() { return sessionStorage.getItem('adminToken'); }
function setToken(token) { sessionStorage.setItem('adminToken', token); }
function clearToken() { sessionStorage.removeItem('adminToken'); sessionStorage.removeItem('adminUsername'); sessionStorage.removeItem('adminRole'); }
function getAdminRole() { return sessionStorage.getItem('adminRole') || 'admin'; }

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
    const token = getToken();
    if (token) {
        try {
            const res = await apiFetch('/api/auth/check');
            if (res.ok) {
                const data = await res.json();
                const username = data.username || sessionStorage.getItem('adminUsername') || 'Admin';
                const role = data.role || sessionStorage.getItem('adminRole') || 'admin';
                
                // Store role
                sessionStorage.setItem('adminRole', role);
                currentAdminRole = role;
                
                const usernameEl = document.getElementById('adminUsername');
                const avatarEl = document.getElementById('userAvatar');
                if (usernameEl) usernameEl.textContent = username;
                if (avatarEl) avatarEl.textContent = username.charAt(0).toUpperCase();
                
                // Show role badge
                updateRoleBadge(role);
                
                // Show/hide super admin features
                setupRoleUI(role);
                
                showDashboard();
                return;
            }
        } catch (e) { /* token invalid */ }
        clearToken();
    }
    // Redirect to dedicated login page
    window.location.href = '/admin-login';
});

// ---- ROLE-BASED UI ----
function updateRoleBadge(role) {
    const badge = document.getElementById('adminRoleBadge');
    if (!badge) return;
    if (role === 'super_admin') {
        badge.textContent = '👑 Super Admin';
        badge.className = 'role-badge role-super-admin';
    } else {
        badge.textContent = 'Admin';
        badge.className = 'role-badge role-admin';
    }
}

function setupRoleUI(role) {
    const adminMgmtBtn = document.getElementById('tabAdminMgmtBtn');
    if (adminMgmtBtn) {
        adminMgmtBtn.style.display = (role === 'super_admin') ? 'flex' : 'none';
    }
}

// ---- AUTH ----
function showLogin() {
    window.location.href = '/admin-login';
}

function showDashboard() {
    const loading = document.getElementById('authLoading');
    if (loading) loading.style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    loadDashboard();
    autoRefreshInterval = setInterval(loadDashboard, 5000);
}

async function doLogout() {
    try { await apiFetch('/api/auth/logout', { method: 'POST' }); } catch (e) {}
    clearToken();
    window.location.href = '/admin-login';
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

// ---- EXPORT PDF & EXCEL ----
function exportExcel() {
    const token = getToken();
    if (!token) { showToast('❌ Sesi tidak valid'); return; }
    
    showToast('📊 Mengunduh file Excel...');
    
    fetch('/api/export/orders/excel', {
        headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(res => {
        if (!res.ok) throw new Error('Export gagal');
        return res.blob();
    })
    .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `PizzaAzura_Pesanan_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('✅ File Excel berhasil diunduh');
    })
    .catch(err => {
        console.error('Export Excel error:', err);
        showToast('❌ Gagal export Excel');
    });
}

function exportPDF() {
    const token = getToken();
    if (!token) { showToast('❌ Sesi tidak valid'); return; }
    
    showToast('📄 Mengunduh file PDF...');
    
    fetch('/api/export/orders/pdf', {
        headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(res => {
        if (!res.ok) throw new Error('Export gagal');
        return res.blob();
    })
    .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `PizzaAzura_Pesanan_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('✅ File PDF berhasil diunduh');
    })
    .catch(err => {
        console.error('Export PDF error:', err);
        showToast('❌ Gagal export PDF');
    });
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
        actionHtml = `<button class="action-btn success modal-action-btn" onclick="updateStatus('${order.id}','done');closeOrderDetail()">✅ Selesaikan Pesanan</button>`;
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

// ---- MOBILE MENU ----
function toggleMobileMenu() {
    if (window.innerWidth <= 768) {
        const menu = document.getElementById('mobileMenu');
        if (menu) {
            menu.classList.toggle('open');
        }
    }
}

// ---- TAB SWITCHER ----
let activeTab = 'orders';
function switchTab(tab) {
    activeTab = tab;
    const ordersTab = document.getElementById('ordersTab');
    const menuTab = document.getElementById('menuTab');
    const settingsTab = document.getElementById('settingsTab');
    const adminMgmtTab = document.getElementById('adminMgmtTab');
    
    const ordersBtn = document.getElementById('tabOrdersBtn');
    const menuBtn = document.getElementById('tabMenuBtn');
    const settingsBtn = document.getElementById('tabSettingsBtn');
    const adminMgmtBtn = document.getElementById('tabAdminMgmtBtn');
    
    const topBarTitle = document.getElementById('topBarTitle');
    
    // Hide mobile sidebar
    const sidebar = document.getElementById('adminSidebar');
    if (sidebar) sidebar.classList.remove('open');
    
    // Hide all tabs
    ordersTab.style.display = 'none';
    menuTab.style.display = 'none';
    settingsTab.style.display = 'none';
    if (adminMgmtTab) adminMgmtTab.style.display = 'none';
    
    // Deactivate all buttons
    ordersBtn.classList.remove('active');
    menuBtn.classList.remove('active');
    settingsBtn.classList.remove('active');
    if (adminMgmtBtn) adminMgmtBtn.classList.remove('active');
    
    if (tab === 'orders') {
        ordersTab.style.display = 'block';
        ordersBtn.classList.add('active');
        topBarTitle.innerHTML = '📦 Antrean Pesanan';
        
        loadDashboard();
        if (!autoRefreshInterval) {
            autoRefreshInterval = setInterval(loadDashboard, 5000);
        }
    } else if (tab === 'menu') {
        menuTab.style.display = 'block';
        menuBtn.classList.add('active');
        topBarTitle.innerHTML = '🍕 Kelola Menu Pizza';
        
        if (autoRefreshInterval) {
            clearInterval(autoRefreshInterval);
            autoRefreshInterval = null;
        }
        loadMenuItems();
    } else if (tab === 'settings') {
        settingsTab.style.display = 'block';
        settingsBtn.classList.add('active');
        topBarTitle.innerHTML = '⚙️ Pengaturan Toko';
        
        if (autoRefreshInterval) {
            clearInterval(autoRefreshInterval);
            autoRefreshInterval = null;
        }
        loadSettingsTab();
    } else if (tab === 'adminMgmt') {
        // Security: only allow super_admin
        if (getAdminRole() !== 'super_admin') {
            showToast('⛔ Akses ditolak — fitur ini hanya untuk Super Admin');
            switchTab('orders');
            return;
        }
        adminMgmtTab.style.display = 'block';
        adminMgmtBtn.classList.add('active');
        topBarTitle.innerHTML = '👑 Kelola Admin';
        
        if (autoRefreshInterval) {
            clearInterval(autoRefreshInterval);
            autoRefreshInterval = null;
        }
        loadAdminList();
    }
}

// ---- MOBILE SIDEBAR TOGGLE ----
function toggleSidebarMenu() {
    const sidebar = document.getElementById('adminSidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
    }
}

// Close sidebar on click outside
document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('adminSidebar');
    const toggleBtn = document.getElementById('sidebarToggleBtn');
    if (sidebar && sidebar.classList.contains('open')) {
        if (!sidebar.contains(e.target) && (!toggleBtn || !toggleBtn.contains(e.target))) {
            sidebar.classList.remove('open');
        }
    }
});

// ---- SETTINGS CRUD ----
async function loadSettingsTab() {
    const loading = document.getElementById('loadingSettings');
    const container = document.getElementById('settingsContainer');
    loading.style.display = 'block';
    container.style.display = 'none';
    
    try {
        const res = await apiFetch('/api/settings');
        if (!res.ok) throw new Error();
        const s = await res.json();
        
        document.getElementById('set_slogan').value = s.slogan || '';
        document.getElementById('set_wa_link').value = s.wa_link || '';
        document.getElementById('set_fb_link').value = s.fb_link || '';
        document.getElementById('set_ig_link').value = s.ig_link || 'https://www.instagram.com/pizzaazzura?igsh=MW9zcmtnNDAwdzlheQ==';
        document.getElementById('set_tt_link').value = s.tt_link || 'https://vt.tiktok.com/ZS9v7FKmt/';
        document.getElementById('set_op_weekday').value = s.op_weekday || '';
        document.getElementById('set_op_weekend').value = s.op_weekend || '';
        document.getElementById('set_op_holiday').value = s.op_holiday || '';
        document.getElementById('set_contact_address').value = s.contact_address || '';
        document.getElementById('set_contact_phone').value = s.contact_phone || '';
        document.getElementById('set_contact_email').value = s.contact_email || '';
        document.getElementById('set_about_content').value = s.about_content || '';
        document.getElementById('set_store_lat').value = s.store_lat || '-6.2146';
        document.getElementById('set_store_lng').value = s.store_lng || '106.8215';
        document.getElementById('set_store_name').value = s.store_name || 'Pizza Azura Jakarta';
        document.getElementById('set_store_address').value = s.store_address || 'Jl. Sudirman No. 123, Jakarta Selatan';
        document.getElementById('set_store_maps_link').value = s.store_maps_link || 'https://maps.app.goo.gl/tVq8NLXusB9Wgr4g8';

        loading.style.display = 'none';
        container.style.display = 'grid';
    } catch(e) {
        console.error('Error loading settings:', e);
        loading.innerHTML = '<span style="color:var(--danger)">Gagal memuat pengaturan toko.</span>';
    }
}

async function saveAllSettings() {
    const payload = {
        slogan: document.getElementById('set_slogan').value,
        wa_link: document.getElementById('set_wa_link').value,
        fb_link: document.getElementById('set_fb_link').value,
        ig_link: document.getElementById('set_ig_link').value,
        tt_link: document.getElementById('set_tt_link').value,
        op_weekday: document.getElementById('set_op_weekday').value,
        op_weekend: document.getElementById('set_op_weekend').value,
        op_holiday: document.getElementById('set_op_holiday').value,
        contact_address: document.getElementById('set_contact_address').value,
        contact_phone: document.getElementById('set_contact_phone').value,
        contact_email: document.getElementById('set_contact_email').value,
        about_content: document.getElementById('set_about_content').value,
        store_lat: document.getElementById('set_store_lat').value.trim(),
        store_lng: document.getElementById('set_store_lng').value.trim(),
        store_name: document.getElementById('set_store_name').value.trim(),
        store_address: document.getElementById('set_store_address').value.trim(),
        store_maps_link: document.getElementById('set_store_maps_link').value.trim()
    };

    // Simple URL validation
    const isValidUrl = (u) => !u || /^https?:\/\//i.test(u);
    if (!isValidUrl(payload.fb_link) || !isValidUrl(payload.ig_link) || !isValidUrl(payload.tt_link)) {
        showToast('❌ Salah satu URL sosial tidak valid. Gunakan http(s)://');
        return;
    }

    const saveBtn = document.getElementById('saveSettingsBtn');
    saveBtn.disabled = true;
    saveBtn.textContent = '⏳ Menyimpan...';

    try {
        const res = await apiFetch('/api/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (res.ok) {
            showToast('✅ Semua pengaturan disimpan');
            setTimeout(() => {
                switchTab('orders');
            }, 1000);
        } else {
            showToast('❌ Gagal menyimpan');
            saveBtn.disabled = false;
            saveBtn.textContent = '💾 Simpan Semua Pengaturan';
        }
    } catch(e) {
        showToast('❌ Kesalahan server');
        saveBtn.disabled = false;
        saveBtn.textContent = '💾 Simpan Semua Pengaturan';
    }
}

// ---- MENU CRUD ----
let menuItems = [];
let editingMenuId = null;

async function loadMenuItems() {
    try {
        const res = await apiFetch('/api/menu');
        if (res.ok) {
            menuItems = await res.json();
            renderMenuItems(menuItems);
        }
    } catch(e) {
        showToast('❌ Gagal memuat daftar menu');
    }
}

function renderMenuItems(items) {
    const list = document.getElementById('adminMenuList');
    if (items.length === 0) {
        list.innerHTML = `<div class="empty-state"><span>🍕</span><p>Belum ada menu. Tambahkan menu baru!</p></div>`;
        return;
    }
    
    list.innerHTML = items.map(item => `
        <div class="order-card" style="display:flex; justify-content:space-between; align-items:center; gap:20px; flex-wrap:wrap; padding: 16px 20px;">
            <div style="display:flex; gap:16px; align-items:center; flex-wrap:wrap;">
                <img src="${item.image}" alt="${item.name}" style="width:64px; height:64px; border-radius:12px; object-fit:cover; border:1px solid var(--border);">
                <div>
                    <h3 style="font-size:16px; font-weight:700; display:flex; align-items:center; gap:8px;">
                        ${item.name} 
                        <span class="order-status-badge badge-pending" style="font-size:11px; padding: 2px 8px;">${item.category.toUpperCase()}</span>
                    </h3>
                    <p style="font-size:13px; color:var(--text-secondary); margin-top:4px; max-width: 450px; line-height: 1.4;">${item.description}</p>
                    <p style="font-size:13px; color:var(--accent); font-weight:700; margin-top:6px;">
                        Size 22: ${formatCurrency(item.price_s)} &nbsp;|&nbsp; Size 26: ${formatCurrency(item.price_m)}
                    </p>
                </div>
            </div>
            <div style="display:flex; gap:8px;">
                <button class="action-btn" onclick="openMenuFormModal('${item.id}')" style="padding: 8px 14px; font-size:13px;">✏️ Edit</button>
                <button class="action-btn danger" onclick="deleteMenuItem('${item.id}')" style="padding: 8px 14px; font-size:13px;">🗑️ Hapus</button>
            </div>
        </div>
    `).join('');
}

function openMenuFormModal(menuId = null) {
    editingMenuId = menuId;
    const modal = document.getElementById('menuFormModal');
    const form = document.getElementById('menuForm');
    const title = document.getElementById('menuFormTitle');
    const idInput = document.getElementById('menu_id');
    
    form.reset();
    
    // Clear custom image inputs
    const fileInput = document.getElementById('menu_image_file');
    if (fileInput) fileInput.value = '';
    document.getElementById('menu_image_base64').value = '';
    document.getElementById('imagePreviewContainer').style.display = 'none';
    document.getElementById('menu_image_preview').src = '';
    document.getElementById('menu_is_bestseller').checked = false;
    
    if (menuId) {
        title.innerHTML = 'Edit Menu Pizza';
        idInput.disabled = true;
        
        const item = menuItems.find(m => m.id === menuId);
        if (item) {
            document.getElementById('menu_id').value = item.id;
            document.getElementById('menu_name').value = item.name;
            document.getElementById('menu_description').value = item.description || '';
            document.getElementById('menu_category').value = item.category || 'classic';
            document.getElementById('menu_price_s').value = item.price_s;
            document.getElementById('menu_price_m').value = item.price_m;
            document.getElementById('menu_is_bestseller').checked = item.is_bestseller === 1;
            
            const presetSelect = document.getElementById('menu_image_preset');
            const base64Input = document.getElementById('menu_image_base64');
            const previewContainer = document.getElementById('imagePreviewContainer');
            const previewImg = document.getElementById('menu_image_preview');
            
            const presets = [
                '/images/pizza_supreme.png', 'images/pizza_supreme.png',
                '/images/pizza_pepperoni.png', 'images/pizza_pepperoni.png',
                '/images/pizza_corn_cheese.png', 'images/pizza_corn_cheese.png',
                '/images/pizza_sosis.png', 'images/pizza_sosis.png',
                '/images/pizza_chicken.png', 'images/pizza_chicken.png',
                '/images/pizza_mushroom.png', 'images/pizza_mushroom.png',
                '/images/pizza_tuna.png', 'images/pizza_tuna.png'
            ];
            
            const isCustom = item.image && (item.image.startsWith('data:') || !presets.includes(item.image));
            
            if (isCustom) {
                base64Input.value = item.image;
                previewImg.src = item.image;
                previewContainer.style.display = 'flex';
                // Set preset dropdown selection blank or default to Supreme
                presetSelect.value = '/images/pizza_supreme.png';
            } else {
                presetSelect.value = item.image || '/images/pizza_supreme.png';
                previewContainer.style.display = 'none';
            }
        }
    } else {
        title.innerHTML = 'Tambah Pizza Baru';
        idInput.disabled = false;
        document.getElementById('menu_image_preset').value = '/images/pizza_supreme.png';
    }
    
    modal.classList.add('active');
}

function closeMenuFormModal() {
    document.getElementById('menuFormModal').classList.remove('active');
}

// Close form modal when clicking outside
document.getElementById('menuFormModal')?.addEventListener('click', e => {
    if (e.target.id === 'menuFormModal') closeMenuFormModal();
});

async function saveMenuItem(e) {
    e.preventDefault();
    
    const id = document.getElementById('menu_id').value.trim();
    const name = document.getElementById('menu_name').value.trim();
    const description = document.getElementById('menu_description').value.trim();
    const category = document.getElementById('menu_category').value;
    const price_s = parseInt(document.getElementById('menu_price_s').value);
    const price_m = parseInt(document.getElementById('menu_price_m').value);
    
    const customImageVal = document.getElementById('menu_image_base64').value;
    const presetSelectVal = document.getElementById('menu_image_preset').value;
    const image = customImageVal || presetSelectVal;
    
    const is_bestseller = document.getElementById('menu_is_bestseller').checked ? 1 : 0;
    
    if (!id || !name || isNaN(price_s) || isNaN(price_m)) {
        showToast('⚠️ Data tidak lengkap');
        return;
    }
    
    const payload = { id, name, description, category, price_s, price_m, image, is_bestseller };
    const method = editingMenuId ? 'PUT' : 'POST';
    const url = editingMenuId ? `/api/menu/${editingMenuId}` : '/api/menu';
    
    const submitBtn = document.getElementById('menuSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Menyimpan...';
    
    try {
        const res = await apiFetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const result = await res.json();
        if (res.ok) {
            showToast('✅ Menu berhasil disimpan');
            closeMenuFormModal();
            loadMenuItems();
        } else {
            showToast('❌ ' + (result.error || 'Gagal menyimpan menu'));
        }
    } catch(err) {
        showToast('❌ Kesalahan koneksi server');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '💾 Simpan Pizza';
    }
}

async function deleteMenuItem(menuId) {
    if (!confirm('Apakah Anda yakin ingin menghapus pizza ini dari menu?')) return;
    
    try {
        const res = await apiFetch(`/api/menu/${menuId}`, { method: 'DELETE' });
        if (res.ok) {
            showToast('🗑️ Menu berhasil dihapus');
            loadMenuItems();
        } else {
            const err = await res.json();
            showToast('❌ ' + (err.error || 'Gagal menghapus menu'));
        }
    } catch(e) {
        showToast('❌ Kesalahan koneksi server');
    }
}

// ---- CUSTOM IMAGE UPLOADS ----
function previewCustomImage(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const base64String = e.target.result;
        document.getElementById('menu_image_base64').value = base64String;
        
        const previewImg = document.getElementById('menu_image_preview');
        previewImg.src = base64String;
        document.getElementById('imagePreviewContainer').style.display = 'flex';
    };
    reader.readAsDataURL(file);
}

function clearCustomImage() {
    const fileInput = document.getElementById('menu_image_file');
    if (fileInput) fileInput.value = '';
    document.getElementById('menu_image_base64').value = '';
    document.getElementById('imagePreviewContainer').style.display = 'none';
    document.getElementById('menu_image_preview').src = '';
}

// ============================================
// ADMIN MANAGEMENT (Super Admin Only)
// ============================================

let adminList = [];
let editingAdminId = null;

async function loadAdminList() {
    try {
        const res = await apiFetch('/api/admins');
        if (res.ok) {
            adminList = await res.json();
            renderAdminTable(adminList);
        } else if (res.status === 403) {
            showToast('⛔ Akses ditolak — hanya untuk Super Admin');
            switchTab('orders');
        }
    } catch (e) {
        console.error('Load admin error:', e);
        showToast('❌ Gagal memuat daftar admin');
    }
}

function renderAdminTable(admins) {
    const tbody = document.getElementById('adminTableBody');
    if (!admins.length) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:40px;">Tidak ada data admin</td></tr>';
        return;
    }

    const myUsername = sessionStorage.getItem('adminUsername') || '';

    tbody.innerHTML = admins.map((admin, idx) => {
        const roleBadge = admin.role === 'super_admin'
            ? '<span class="role-badge role-super-admin">👑 Super Admin</span>'
            : '<span class="role-badge role-admin">🔧 Admin</span>';
        
        const isSelf = admin.username === myUsername;
        const isSuperAdmin = admin.role === 'super_admin';
        const selfTag = isSelf ? ' <span style="font-size:11px; color:var(--accent); font-weight:700;">(Anda)</span>' : '';
        
        // Super admin: hanya bisa edit diri sendiri, tidak bisa dihapus siapapun
        // Admin biasa: bisa di-edit dan dihapus oleh super admin
        let actionButtons = '';
        if (isSuperAdmin) {
            // Super admin hanya bisa di-edit oleh dirinya sendiri
            if (isSelf) {
                actionButtons = `<button class="action-btn" onclick="openAdminFormModal(${admin.id})" style="padding:6px 12px; font-size:12px;">✏️ Edit</button>`;
            } else {
                actionButtons = '<span style="font-size:12px; color:var(--text-muted);">—</span>';
            }
        } else {
            // Admin biasa: bisa edit & hapus
            actionButtons = `
                <button class="action-btn" onclick="openAdminFormModal(${admin.id})" style="padding:6px 12px; font-size:12px;">✏️ Edit</button>
                <button class="action-btn danger" onclick="deleteAdmin(${admin.id})" style="padding:6px 12px; font-size:12px;">🗑️ Hapus</button>
            `;
        }
        
        return `
            <tr>
                <td>${idx + 1}</td>
                <td><strong>${admin.username}</strong>${selfTag}</td>
                <td>${roleBadge}</td>
                <td>
                    <div style="display:flex; gap:6px; justify-content:center; flex-wrap:wrap;">
                        ${actionButtons}
                    </div>
                </td>
            </tr>`;
    }).join('');
}

function openAdminFormModal(adminId = null) {
    editingAdminId = adminId;
    const modal = document.getElementById('adminFormModal');
    const form = document.getElementById('adminForm');
    const title = document.getElementById('adminFormTitle');
    const passwordInput = document.getElementById('admin_password');
    const passwordHint = document.getElementById('admin_password_hint');
    
    form.reset();
    
    if (adminId) {
        const admin = adminList.find(a => a.id === adminId);
        const isSuperAdmin = admin && admin.role === 'super_admin';
        title.textContent = isSuperAdmin ? '👑 Edit Akun Super Admin' : '✏️ Edit Admin';
        if (admin) {
            document.getElementById('admin_username').value = admin.username;
        }
        passwordInput.required = false;
        passwordInput.placeholder = 'Kosongkan jika tidak diubah';
        passwordHint.style.display = 'block';
    } else {
        title.textContent = '➕ Tambah Admin Baru';
        passwordInput.required = true;
        passwordInput.placeholder = 'Masukkan password';
        passwordHint.style.display = 'none';
    }
    
    modal.classList.add('active');
}

function closeAdminFormModal() {
    document.getElementById('adminFormModal').classList.remove('active');
}

document.getElementById('adminFormModal')?.addEventListener('click', e => {
    if (e.target.id === 'adminFormModal') closeAdminFormModal();
});

async function saveAdmin(e) {
    e.preventDefault();
    
    const username = document.getElementById('admin_username').value.trim();
    const password = document.getElementById('admin_password').value;
    
    if (!username) {
        showToast('⚠️ Username wajib diisi');
        return;
    }
    
    if (!editingAdminId && !password) {
        showToast('⚠️ Password wajib diisi untuk admin baru');
        return;
    }
    
    const payload = { username };
    if (password) payload.password = password;
    
    const method = editingAdminId ? 'PUT' : 'POST';
    const url = editingAdminId ? `/api/admins/${editingAdminId}` : '/api/admins';
    
    const submitBtn = document.getElementById('adminSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Menyimpan...';
    
    try {
        const res = await apiFetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const result = await res.json();
        if (res.ok) {
            showToast('✅ Admin berhasil disimpan');
            closeAdminFormModal();
            loadAdminList();
        } else {
            showToast('❌ ' + (result.error || 'Gagal menyimpan admin'));
        }
    } catch (err) {
        showToast('❌ Kesalahan koneksi server');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '💾 Simpan Admin';
    }
}

async function deleteAdmin(adminId) {
    if (!confirm('Yakin ingin menghapus admin ini? Akses login akan dicabut.')) return;
    
    try {
        const res = await apiFetch(`/api/admins/${adminId}`, { method: 'DELETE' });
        const result = await res.json();
        if (res.ok) {
            showToast('🗑️ Admin berhasil dihapus');
            loadAdminList();
        } else {
            showToast('❌ ' + (result.error || 'Gagal menghapus admin'));
        }
    } catch (e) {
        showToast('❌ Kesalahan koneksi server');
    }
}
