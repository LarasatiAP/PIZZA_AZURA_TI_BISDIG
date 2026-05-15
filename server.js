/**
 * ============================================
 * PIZZA AZURA — Express Server
 * ============================================
 */

const express = require('express');
const path = require('path');
const crypto = require('crypto');
const { getDb, saveDb, queryAll, queryOne, runSql, getLastInsertId, getNextQueueNumber } = require('./db');

const app = express();
const PORT = 3000;

// In-memory token store
const activeTokens = new Map();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---- AUTH MIDDLEWARE ----
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    if (!activeTokens.has(token)) {
        return res.status(401).json({ error: 'Invalid token' });
    }
    req.admin = activeTokens.get(token);
    next();
}

// ============================================
// AUTH ROUTES
// ============================================

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const admin = queryOne('SELECT * FROM admins WHERE username = ? AND password = ?', [username, password]);
    if (!admin) {
        return res.status(401).json({ error: 'Username atau password salah' });
    }
    const token = crypto.randomBytes(32).toString('hex');
    activeTokens.set(token, { id: admin.id, username: admin.username });
    res.json({ token, username: admin.username });
});

app.get('/api/auth/check', authMiddleware, (req, res) => {
    res.json({ valid: true, username: req.admin.username });
});

app.post('/api/auth/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        activeTokens.delete(authHeader.split(' ')[1]);
    }
    res.json({ success: true });
});

// ============================================
// MENU ROUTES
// ============================================

app.get('/api/menu', (req, res) => {
    res.json(queryAll('SELECT * FROM menu'));
});

app.get('/api/toppings', (req, res) => {
    res.json(queryAll('SELECT * FROM toppings'));
});

// ============================================
// ORDER ROUTES
// ============================================

app.post('/api/orders', (req, res) => {
    const { customerName, phone, orderType, paymentMethod, notes, items } = req.body;

    if (!customerName || !items || items.length === 0) {
        return res.status(400).json({ error: 'Data tidak lengkap' });
    }

    const queueNumber = getNextQueueNumber();
    const now = new Date().toISOString();
    const orderId = 'AZR-' + Date.now().toString(36).toUpperCase();

    // Calculate total
    let total = 0;
    for (const item of items) {
        const toppingTotal = (item.toppings || []).reduce((s, t) => s + t.price, 0);
        total += (item.price + toppingTotal) * item.quantity;
    }

    runSql(
        "INSERT INTO orders (id, queue_number, customer_name, phone, order_type, payment_method, notes, total, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)",
        [orderId, queueNumber, customerName, phone || '', orderType, paymentMethod, notes || '', total, now, now]
    );

    for (const item of items) {
        runSql(
            "INSERT INTO order_items (order_id, menu_id, menu_name, menu_image, size, price, quantity, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [orderId, item.menuId, item.name, item.image, item.size, item.price, item.quantity, item.notes || '']
        );
        const itemId = getLastInsertId();

        for (const topping of (item.toppings || [])) {
            runSql(
                "INSERT INTO order_item_toppings (order_item_id, topping_id, topping_name, topping_price) VALUES (?, ?, ?, ?)",
                [itemId, topping.id, topping.name, topping.price]
            );
        }
    }

    saveDb();
    res.json({ id: orderId, queueNumber, total, status: 'pending', createdAt: now });
});

// Get all orders (admin)
app.get('/api/orders', authMiddleware, (req, res) => {
    const orders = queryAll('SELECT * FROM orders ORDER BY created_at DESC');

    const fullOrders = orders.map(order => {
        const items = queryAll('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
        const itemsWithToppings = items.map(item => ({
            ...item,
            toppings: queryAll('SELECT * FROM order_item_toppings WHERE order_item_id = ?', [item.id])
        }));
        return { ...order, items: itemsWithToppings };
    });

    res.json(fullOrders);
});

// Get single order (customer status check)
app.get('/api/orders/:id', (req, res) => {
    const order = queryOne('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!order) return res.status(404).json({ error: 'Pesanan tidak ditemukan' });

    const items = queryAll('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    order.items = items.map(item => ({
        ...item,
        toppings: queryAll('SELECT * FROM order_item_toppings WHERE order_item_id = ?', [item.id])
    }));

    res.json(order);
});

// Update order status (admin)
app.put('/api/orders/:id/status', authMiddleware, (req, res) => {
    const { status } = req.body;
    const now = new Date().toISOString();

    const existing = queryOne('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Pesanan tidak ditemukan' });

    runSql('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?', [status, now, req.params.id]);
    res.json({ ...existing, status, updated_at: now });
});

// Delete order (admin)
app.delete('/api/orders/:id', authMiddleware, (req, res) => {
    // Delete related data first (sql.js doesn't auto-cascade)
    const items = queryAll('SELECT id FROM order_items WHERE order_id = ?', [req.params.id]);
    for (const item of items) {
        runSql('DELETE FROM order_item_toppings WHERE order_item_id = ?', [item.id]);
    }
    runSql('DELETE FROM order_items WHERE order_id = ?', [req.params.id]);
    runSql('DELETE FROM orders WHERE id = ?', [req.params.id]);
    res.json({ success: true });
});

// ============================================
// STATS (admin)
// ============================================

app.get('/api/stats', authMiddleware, (req, res) => {
    const today = new Date().toISOString().split('T')[0];

    res.json({
        totalOrders: (queryOne('SELECT COUNT(*) as c FROM orders') || {}).c || 0,
        todayOrders: (queryOne("SELECT COUNT(*) as c FROM orders WHERE DATE(created_at) = ?", [today]) || {}).c || 0,
        totalRevenue: (queryOne("SELECT COALESCE(SUM(total), 0) as s FROM orders WHERE status = 'done'") || {}).s || 0,
        todayRevenue: (queryOne("SELECT COALESCE(SUM(total), 0) as s FROM orders WHERE status = 'done' AND DATE(created_at) = ?", [today]) || {}).s || 0,
        pendingOrders: (queryOne("SELECT COUNT(*) as c FROM orders WHERE status = 'pending'") || {}).c || 0,
        doneOrders: (queryOne("SELECT COUNT(*) as c FROM orders WHERE status = 'done'") || {}).c || 0,
    });
});

// ============================================
// RESET (admin)
// ============================================

app.post('/api/reset', authMiddleware, (req, res) => {
    runSql('DELETE FROM order_item_toppings');
    runSql('DELETE FROM order_items');
    runSql('DELETE FROM orders');
    res.json({ success: true });
});

// ============================================
// PAGE ROUTES
// ============================================

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ============================================
// START SERVER
// ============================================

async function start() {
    await getDb(); // Initialize database

    app.listen(PORT, '0.0.0.0', () => {
        console.log('');
        console.log('  🍕 Pizza Azura Server');
        console.log('  ─────────────────────────────');
        console.log(`  🌐 Customer:  http://localhost:${PORT}`);
        console.log(`  📱 Mobile:    http://192.168.1.146:${PORT}`);
        console.log(`  🔧 Admin:     http://localhost:${PORT}/admin`);
        console.log('  ─────────────────────────────');
        console.log('');
    });
}

start();
