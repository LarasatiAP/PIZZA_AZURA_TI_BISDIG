/**
 * ============================================
 * PIZZA AZURA — Customer Ordering Logic
 * ============================================
 */

// ---- STATE ----
let currentFilter = 'all';
let selectedSize = 'M';
let selectedToppings = [];
let selectedQty = 1;
let currentMenuItem = null;

// ---- INITIALIZE ----
document.addEventListener('DOMContentLoaded', () => {
    PizzaAzura.updateMenuAvailability();
    renderMenu();
    updateCartBadge();
});

// ---- RENDER MENU ----
function renderMenu() {
    const menu = PizzaAzura.getMenu();
    const grid = document.getElementById('menuGrid');

    const filtered = currentFilter === 'all' ? menu : menu.filter(m => m.category === currentFilter);

    grid.innerHTML = filtered.map(item => `
        <div class="menu-card ${!item.available ? 'unavailable' : ''}" onclick="${item.available ? `openDetail('${item.id}')` : ''}">
            <div class="card-image">
                <span>${item.image}</span>
                <span class="card-badge">${item.category === 'premium' ? '👑 Premium' : '⭐ Classic'}</span>
            </div>
            <div class="card-body">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <div class="card-footer">
                    <div class="card-price">
                        ${PizzaAzura.formatCurrency(item.prices.S)}
                        <small>mulai dari</small>
                    </div>
                    ${item.available ? `<button class="card-add-btn" onclick="event.stopPropagation(); openDetail('${item.id}')">+</button>` : ''}
                </div>
            </div>
            ${!item.available ? '<div style="position:absolute;top:16px;right:16px;background:var(--danger);color:#fff;padding:4px 12px;border-radius:8px;font-size:12px;font-weight:700;">HABIS</div>' : ''}
        </div>
    `).join('');
}

// ---- FILTER MENU ----
function filterMenu(category) {
    currentFilter = category;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderMenu();
}

// ---- OPEN DETAIL MODAL ----
function openDetail(menuId) {
    currentMenuItem = PizzaAzura.getMenuItem(menuId);
    if (!currentMenuItem) return;

    selectedSize = 'M';
    selectedToppings = [];
    selectedQty = 1;

    renderDetail();
    openModal('detailModal');
}

function renderDetail() {
    const item = currentMenuItem;
    const toppings = PizzaAzura.getToppings();

    const totalToppingPrice = selectedToppings.reduce((sum, tid) => {
        const t = PizzaAzura.getTopping(tid);
        return sum + (t ? t.price : 0);
    }, 0);
    const unitPrice = item.prices[selectedSize] + totalToppingPrice;
    const totalPrice = unitPrice * selectedQty;

    document.getElementById('detailContent').innerHTML = `
        <div class="detail-emoji">${item.image}</div>
        <div class="detail-name">${item.name}</div>
        <div class="detail-desc">${item.description}</div>

        <div class="option-group">
            <label>Pilih Ukuran</label>
            <div class="size-options">
                ${['S', 'M', 'L'].map(s => `
                    <button class="size-btn ${selectedSize === s ? 'active' : ''}" onclick="selectSize('${s}')">
                        <span class="size-label">${s === 'S' ? 'Small' : s === 'M' ? 'Medium' : 'Large'}</span>
                        <span class="size-price">${PizzaAzura.formatCurrency(item.prices[s])}</span>
                    </button>
                `).join('')}
            </div>
        </div>

        <div class="option-group">
            <label>Topping Tambahan</label>
            <div class="topping-list">
                ${toppings.map(t => `
                    <div class="topping-item ${selectedToppings.includes(t.id) ? 'selected' : ''}" onclick="toggleTopping('${t.id}')">
                        <span class="topping-name">${t.name}</span>
                        <span class="topping-price">+${PizzaAzura.formatCurrency(t.price)}</span>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="option-group">
            <label>Jumlah</label>
            <div class="qty-control">
                <button class="qty-btn" onclick="changeQty(-1)">−</button>
                <span class="qty-value">${selectedQty}</span>
                <button class="qty-btn" onclick="changeQty(1)">+</button>
            </div>
        </div>

        <div class="option-group">
            <label>Catatan (opsional)</label>
            <textarea class="notes-input" id="itemNotes" placeholder="Contoh: tidak pedas, extra saus..."></textarea>
        </div>

        <button class="add-to-cart-btn" onclick="addItemToCart()">
            🛒 Tambah ke Keranjang — ${PizzaAzura.formatCurrency(totalPrice)}
        </button>
    `;
}

function selectSize(size) {
    selectedSize = size;
    renderDetail();
}

function toggleTopping(toppingId) {
    const idx = selectedToppings.indexOf(toppingId);
    if (idx >= 0) {
        selectedToppings.splice(idx, 1);
    } else {
        selectedToppings.push(toppingId);
    }
    renderDetail();
}

function changeQty(delta) {
    selectedQty = Math.max(1, selectedQty + delta);
    renderDetail();
}

// ---- ADD TO CART ----
function addItemToCart() {
    const item = currentMenuItem;
    const toppingsData = selectedToppings.map(tid => {
        const t = PizzaAzura.getTopping(tid);
        return { id: t.id, name: t.name, price: t.price };
    });

    const notes = document.getElementById('itemNotes')?.value || '';

    PizzaAzura.addToCart({
        menuId: item.id,
        name: item.name,
        image: item.image,
        size: selectedSize,
        price: item.prices[selectedSize],
        toppings: toppingsData,
        quantity: selectedQty,
        notes: notes,
    });

    closeModal('detailModal');
    updateCartBadge();
    showToast('✅ Ditambahkan ke keranjang!');
}

// ---- CART ----
function openCart() {
    renderCart();
    openModal('cartModal');
}

function renderCart() {
    const cart = PizzaAzura.getCart();
    const container = document.getElementById('cartContent');

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="cart-empty">
                <span>🛒</span>
                <p>Keranjang masih kosong</p>
                <p style="font-size:13px; margin-top:8px">Yuk pilih pizza favoritmu!</p>
            </div>
        `;
        return;
    }

    const total = PizzaAzura.getCartTotal();

    container.innerHTML = `
        <div class="cart-items">
            ${cart.map(item => {
                const toppingText = item.toppings.length > 0
                    ? item.toppings.map(t => t.name).join(', ')
                    : '';
                const toppingTotal = item.toppings.reduce((s, t) => s + t.price, 0);
                const itemTotal = (item.price + toppingTotal) * item.quantity;

                return `
                <div class="cart-item">
                    <span class="cart-item-emoji">${item.image}</span>
                    <div class="cart-item-info">
                        <h4>${item.name} (${item.size}) × ${item.quantity}</h4>
                        <div class="cart-item-details">
                            ${toppingText ? '+ ' + toppingText : 'Tanpa topping tambahan'}
                            ${item.notes ? '<br>📝 ' + item.notes : ''}
                        </div>
                        <div class="cart-item-price">${PizzaAzura.formatCurrency(itemTotal)}</div>
                    </div>
                    <button class="cart-item-remove" onclick="removeCartItem('${item.cartId}')">🗑️</button>
                </div>
                `;
            }).join('')}
        </div>

        <div class="cart-summary">
            <div class="cart-summary-row">
                <span>Subtotal (${cart.length} item)</span>
                <span>${PizzaAzura.formatCurrency(total)}</span>
            </div>
            <div class="cart-summary-row total">
                <span>Total</span>
                <span>${PizzaAzura.formatCurrency(total)}</span>
            </div>
        </div>

        <button class="checkout-btn" onclick="goToCheckout()">
            Lanjut ke Checkout →
        </button>
    `;
}

function removeCartItem(cartId) {
    PizzaAzura.removeFromCart(cartId);
    updateCartBadge();
    renderCart();
    showToast('🗑️ Item dihapus');
}

// ---- CHECKOUT ----
function goToCheckout() {
    closeModal('cartModal');
    renderCheckout();
    setTimeout(() => openModal('checkoutModal'), 200);
}

function renderCheckout() {
    const total = PizzaAzura.getCartTotal();

    document.getElementById('checkoutContent').innerHTML = `
        <div class="form-group">
            <label>Nama Pemesan</label>
            <input type="text" class="form-input" id="custName" placeholder="Masukkan nama kamu">
        </div>

        <div class="form-group">
            <label>Tipe Pesanan</label>
            <div class="radio-group">
                <div class="radio-option">
                    <input type="radio" name="orderType" id="typeDinein" value="dinein" checked>
                    <label for="typeDinein">🍽️ Dine In</label>
                </div>
                <div class="radio-option">
                    <input type="radio" name="orderType" id="typeTakeaway" value="takeaway">
                    <label for="typeTakeaway">📦 Take Away</label>
                </div>
                <div class="radio-option">
                    <input type="radio" name="orderType" id="typePreorder" value="preorder">
                    <label for="typePreorder">📅 Pre-Order</label>
                </div>
            </div>
        </div>

        <div class="form-group">
            <label>Metode Pembayaran</label>
            <div class="radio-group">
                <div class="radio-option">
                    <input type="radio" name="payMethod" id="payCash" value="cash" checked>
                    <label for="payCash">💵 Tunai</label>
                </div>
                <div class="radio-option">
                    <input type="radio" name="payMethod" id="payQris" value="qris">
                    <label for="payQris">📱 QRIS</label>
                </div>
                <div class="radio-option">
                    <input type="radio" name="payMethod" id="payTransfer" value="transfer">
                    <label for="payTransfer">🏦 Transfer</label>
                </div>
            </div>
        </div>

        <div class="form-group">
            <label>Catatan Tambahan</label>
            <textarea class="notes-input" id="orderNotes" placeholder="Catatan untuk pesanan (opsional)"></textarea>
        </div>

        <div class="cart-summary">
            <div class="cart-summary-row total">
                <span>Total Pembayaran</span>
                <span>${PizzaAzura.formatCurrency(total)}</span>
            </div>
        </div>

        <button class="checkout-btn" onclick="submitOrder()" style="margin-top:8px">
            ✅ Konfirmasi Pesanan
        </button>
    `;
}

function submitOrder() {
    const name = document.getElementById('custName').value.trim();

    if (!name) {
        showToast('⚠️ Masukkan nama pemesan!');
        return;
    }

    const orderType = document.querySelector('input[name="orderType"]:checked').value;
    const payMethod = document.querySelector('input[name="payMethod"]:checked').value;
    const notes = document.getElementById('orderNotes')?.value || '';

    const result = PizzaAzura.createOrder({
        name,
        phone: '',
        orderType,
        paymentMethod: payMethod,
        notes,
    });

    if (!result) {
        showToast('⚠️ Keranjang kosong!');
        return;
    }

    if (result.error) {
        showToast('❌ ' + result.error);
        return;
    }

    closeModal('checkoutModal');
    updateCartBadge();
    renderMenu(); // Refresh availability

    // Show success
    showSuccessModal(result);
}

function showSuccessModal(order) {
    document.getElementById('successContent').innerHTML = `
        <div style="font-size:64px; margin-bottom:16px;">🎉</div>
        <h2 style="font-size:24px; font-weight:700; margin-bottom:8px;">Pesanan Berhasil!</h2>
        <p style="color:var(--text-secondary); margin-bottom:16px;">Pesanan kamu sudah masuk ke sistem</p>
        <div style="background:var(--bg-card); border:1px solid var(--border); border-radius:12px; padding:20px; margin-bottom:20px;">
            <div style="font-size:20px; font-weight:700; color:var(--accent); margin-bottom:8px;">${order.id}</div>
            <div style="font-size:14px; color:var(--text-secondary);">
                ${order.name} • ${PizzaAzura.ORDER_TYPE_LABELS[order.orderType]}<br>
                ${PizzaAzura.PAYMENT_LABELS[order.paymentMethod]} • ${PizzaAzura.formatCurrency(order.total)}
            </div>
        </div>
        <p style="font-size:13px; color:var(--text-muted); margin-bottom:20px;">
            Simpan nomor pesanan ini untuk melacak status pesananmu
        </p>
        <button class="checkout-btn" onclick="viewOrderStatus('${order.id}')" style="margin-bottom:10px;">
            📍 Lihat Status Pesanan
        </button>
        <button class="checkout-btn" onclick="closeModal('successModal')" style="background:var(--bg-card); border:1px solid var(--border);">
            Kembali ke Menu
        </button>
    `;
    openModal('successModal');
}

// ---- ORDER STATUS ----
function viewOrderStatus(orderId) {
    closeModal('successModal');

    const order = PizzaAzura.getOrderById(orderId);
    if (!order) {
        showToast('❌ Pesanan tidak ditemukan');
        return;
    }

    // Hide main content, show status
    document.querySelector('.header').style.display = 'none';
    document.querySelector('.hero').style.display = 'none';
    document.querySelector('.category-tabs').style.display = 'none';
    document.querySelector('.menu-section').style.display = 'none';
    document.getElementById('statusView').style.display = 'block';

    renderStatusView(order);
}

function renderStatusView(order) {
    const statuses = ['pending', 'processing', 'cooking', 'done'];
    const currentIdx = statuses.indexOf(order.status);

    const steps = [
        { key: 'pending', icon: '⏳', title: 'Pesanan Diterima', desc: 'Pesanan masuk ke sistem' },
        { key: 'processing', icon: '📋', title: 'Diproses', desc: 'Admin memproses pesanan' },
        { key: 'cooking', icon: '🔥', title: 'Sedang Dibuat', desc: 'Pizza sedang dimasak' },
        { key: 'done', icon: '✅', title: 'Selesai', desc: 'Pesanan siap diambil!' },
    ];

    document.getElementById('statusCard').innerHTML = `
        <div class="status-icon">${PizzaAzura.STATUS_LABELS[order.status].icon}</div>
        <div class="status-title">${PizzaAzura.STATUS_LABELS[order.status].text}</div>
        <div class="status-order-id">${order.id}</div>

        <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap; margin-bottom:24px;">
            <span style="background:var(--bg-secondary); padding:6px 14px; border-radius:8px; font-size:13px; color:var(--text-muted);">
                👤 ${order.name}
            </span>
            <span style="background:var(--bg-secondary); padding:6px 14px; border-radius:8px; font-size:13px; color:var(--text-muted);">
                ${PizzaAzura.ORDER_TYPE_LABELS[order.orderType]}
            </span>
            <span style="background:var(--bg-secondary); padding:6px 14px; border-radius:8px; font-size:13px; color:var(--text-muted);">
                ${PizzaAzura.PAYMENT_LABELS[order.paymentMethod]}
            </span>
        </div>

        <div class="status-steps">
            ${steps.map((step, i) => {
                let cls = '';
                if (i < currentIdx) cls = 'completed';
                else if (i === currentIdx) cls = 'active';
                return `
                <div class="status-step ${cls}">
                    <div class="status-dot">${step.icon}</div>
                    <div class="status-step-text">
                        <h4>${step.title}</h4>
                        <p>${step.desc}</p>
                    </div>
                </div>
                `;
            }).join('')}
        </div>

        <div class="status-items">
            <h4>Detail Pesanan</h4>
            ${order.items.map(item => `
                <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--border); font-size:14px;">
                    <span>${item.image} ${item.name} (${item.size}) × ${item.quantity}</span>
                    <span style="color:var(--accent); font-weight:600;">
                        ${PizzaAzura.formatCurrency((item.price + item.toppings.reduce((s,t) => s + t.price, 0)) * item.quantity)}
                    </span>
                </div>
            `).join('')}
            <div style="display:flex; justify-content:space-between; padding:12px 0; font-size:16px; font-weight:700;">
                <span>Total</span>
                <span style="color:var(--accent);">${PizzaAzura.formatCurrency(order.total)}</span>
            </div>
        </div>

        <button class="checkout-btn" onclick="refreshStatus('${order.id}')" style="margin-top:16px;">
            🔄 Refresh Status
        </button>
    `;
}

function refreshStatus(orderId) {
    const order = PizzaAzura.getOrderById(orderId);
    if (order) {
        renderStatusView(order);
        showToast('🔄 Status diperbarui');
    }
}

function hideStatusView() {
    document.querySelector('.header').style.display = '';
    document.querySelector('.hero').style.display = '';
    document.querySelector('.category-tabs').style.display = '';
    document.querySelector('.menu-section').style.display = '';
    document.getElementById('statusView').style.display = 'none';
}

// ---- MODAL HELPERS ----
function openModal(id) {
    document.getElementById(id).classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
    document.body.style.overflow = '';
}

// Close modal on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
});

// ---- CART BADGE ----
function updateCartBadge() {
    const cart = PizzaAzura.getCart();
    const badge = document.getElementById('cartBadge');
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
}

// ---- TOAST ----
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}
