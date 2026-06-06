/**
 * ============================================
 * PIZZA AZURA — Express Server (MySQL)
 * ============================================
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { getPool, queryAll, queryOne, runSql, getLastInsertId, getNextQueueNumber } = require('./db');

const app = express();
const PORT = 3000;

// In-memory token store
const activeTokens = new Map();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
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

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await queryOne('SELECT * FROM admins WHERE username = ? AND password = ?', [username, password]);
        if (!admin) {
            return res.status(401).json({ error: 'Username atau password salah' });
        }
        const token = crypto.randomBytes(32).toString('hex');
        activeTokens.set(token, { id: admin.id, username: admin.username });
        res.json({ token, username: admin.username });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
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

app.get('/api/menu', async (req, res) => {
    try {
        const menu = await queryAll('SELECT * FROM menu');
        res.json(menu);
    } catch (err) {
        console.error('Get menu error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Helper to save Base64 image to filesystem
function saveBase64Image(base64Str, menuId) {
    if (!base64Str || !base64Str.startsWith('data:image/')) {
        return base64Str;
    }
    
    try {
        const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            return base64Str;
        }
        
        const contentType = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');
        
        let ext = 'png';
        if (contentType.includes('jpeg') || contentType.includes('jpg')) {
            ext = 'jpg';
        } else if (contentType.includes('gif')) {
            ext = 'gif';
        } else if (contentType.includes('webp')) {
            ext = 'webp';
        }
        
        const uploadDir = path.join(__dirname, 'public', 'images', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        const fileName = `menu_${menuId}_${Date.now()}.${ext}`;
        const filePath = path.join(uploadDir, fileName);
        fs.writeFileSync(filePath, buffer);
        
        return `/images/uploads/${fileName}`;
    } catch (err) {
        console.error('Error saving base64 image:', err);
        return base64Str;
    }
}

// Add a new menu item (admin only)
app.post('/api/menu', authMiddleware, async (req, res) => {
    try {
        let { id, name, description, image, category, price_s, price_m, is_bestseller } = req.body;
        if (!id || !name || price_s === undefined || price_m === undefined) {
            return res.status(400).json({ error: 'Data menu tidak lengkap' });
        }
        
        const existing = await queryOne('SELECT * FROM menu WHERE id = ?', [id]);
        if (existing) {
            return res.status(400).json({ error: 'ID Menu sudah digunakan' });
        }
        
        if (image && image.startsWith('data:image/')) {
            image = saveBase64Image(image, id);
        }
        
        await runSql(
            'INSERT INTO menu (id, name, description, image, category, price_s, price_m, price_l, is_bestseller) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)',
            [id, name, description || '', image || '/images/pizza_supreme.png', category || 'classic', price_s, price_m, is_bestseller ? 1 : 0]
        );
        res.json({ success: true });
    } catch (err) {
        console.error('Add menu error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update a menu item (admin only)
app.put('/api/menu/:id', authMiddleware, async (req, res) => {
    try {
        let { name, description, image, category, price_s, price_m, is_bestseller } = req.body;
        const { id } = req.params;
        
        const existing = await queryOne('SELECT * FROM menu WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({ error: 'Menu tidak ditemukan' });
        }
        
        if (!name || price_s === undefined || price_m === undefined) {
            return res.status(400).json({ error: 'Data menu tidak lengkap' });
        }
        
        if (image && image.startsWith('data:image/')) {
            image = saveBase64Image(image, id);
        }
        
        await runSql(
            'UPDATE menu SET name = ?, description = ?, image = ?, category = ?, price_s = ?, price_m = ?, is_bestseller = ? WHERE id = ?',
            [name, description || '', image || '/images/pizza_supreme.png', category || 'classic', price_s, price_m, is_bestseller ? 1 : 0, id]
        );
        res.json({ success: true });
    } catch (err) {
        console.error('Update menu error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete a menu item (admin only)
app.delete('/api/menu/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await queryOne('SELECT * FROM menu WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({ error: 'Menu tidak ditemukan' });
        }
        
        await runSql('DELETE FROM menu WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Delete menu error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/toppings', async (req, res) => {
    try {
        const toppings = await queryAll('SELECT * FROM toppings');
        res.json(toppings);
    } catch (err) {
        console.error('Get toppings error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ============================================
// SETTINGS ROUTES
// ============================================

app.get('/api/settings', async (req, res) => {
    try {
        const settings = await queryAll('SELECT * FROM settings');
        const result = {};
        for (const s of settings) {
            result[s.key] = s.value;
        }
        res.json(result);
    } catch (err) {
        console.error('Get settings error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/api/settings', authMiddleware, async (req, res) => {
    try {
        const settings = req.body;
        for (const key in settings) {
            const existing = await queryOne('SELECT * FROM settings WHERE `key` = ?', [key]);
            if (existing) {
                await runSql('UPDATE settings SET value = ? WHERE `key` = ?', [settings[key], key]);
            } else {
                await runSql('INSERT INTO settings (`key`, value) VALUES (?, ?)', [key, settings[key]]);
            }
        }
        res.json({ success: true });
    } catch (err) {
        console.error('Update settings error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ============================================
// ORDER ROUTES
// ============================================

app.post('/api/orders', async (req, res) => {
    try {
        const { customerName, phone, orderType, paymentMethod, notes, items } = req.body;

        if (!customerName || !items || items.length === 0) {
            return res.status(400).json({ error: 'Data tidak lengkap' });
        }

        const queueNumber = await getNextQueueNumber();
        const now = new Date().toISOString();
        const orderId = 'AZR-' + Date.now().toString(36).toUpperCase();

        // Calculate total
        let total = 0;
        for (const item of items) {
            const toppingTotal = (item.toppings || []).reduce((s, t) => s + t.price, 0);
            total += (item.price + toppingTotal) * item.quantity;
        }

        await runSql(
            "INSERT INTO orders (id, queue_number, customer_name, phone, order_type, payment_method, notes, total, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)",
            [orderId, queueNumber, customerName, phone || '', orderType, paymentMethod, notes || '', total, now, now]
        );

        for (const item of items) {
            const result = await runSql(
                "INSERT INTO order_items (order_id, menu_id, menu_name, menu_image, size, price, quantity, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                [orderId, item.menuId, item.name, item.image, item.size, item.price, item.quantity, item.notes || '']
            );
            const itemId = result.insertId;

            for (const topping of (item.toppings || [])) {
                await runSql(
                    "INSERT INTO order_item_toppings (order_item_id, topping_id, topping_name, topping_price) VALUES (?, ?, ?, ?)",
                    [itemId, topping.id, topping.name, topping.price]
                );
            }
        }

        res.json({ id: orderId, queueNumber, total, status: 'pending', createdAt: now });
    } catch (err) {
        console.error('Create order error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all orders (admin)
app.get('/api/orders', authMiddleware, async (req, res) => {
    try {
        const orders = await queryAll('SELECT * FROM orders ORDER BY created_at DESC');

        const fullOrders = [];
        for (const order of orders) {
            const items = await queryAll('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
            const itemsWithToppings = [];
            for (const item of items) {
                const toppings = await queryAll('SELECT * FROM order_item_toppings WHERE order_item_id = ?', [item.id]);
                itemsWithToppings.push({ ...item, toppings });
            }
            fullOrders.push({ ...order, items: itemsWithToppings });
        }

        res.json(fullOrders);
    } catch (err) {
        console.error('Get orders error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get single order (customer status check)
app.get('/api/orders/:id', async (req, res) => {
    try {
        const order = await queryOne('SELECT * FROM orders WHERE id = ?', [req.params.id]);
        if (!order) return res.status(404).json({ error: 'Pesanan tidak ditemukan' });

        const items = await queryAll('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
        const itemsWithToppings = [];
        for (const item of items) {
            const toppings = await queryAll('SELECT * FROM order_item_toppings WHERE order_item_id = ?', [item.id]);
            itemsWithToppings.push({ ...item, toppings });
        }
        order.items = itemsWithToppings;

        res.json(order);
    } catch (err) {
        console.error('Get order error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update order status (admin)
app.put('/api/orders/:id/status', authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const now = new Date().toISOString();

        const existing = await queryOne('SELECT * FROM orders WHERE id = ?', [req.params.id]);
        if (!existing) return res.status(404).json({ error: 'Pesanan tidak ditemukan' });

        await runSql('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?', [status, now, req.params.id]);
        res.json({ ...existing, status, updated_at: now });
    } catch (err) {
        console.error('Update order status error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete order (admin)
app.delete('/api/orders/:id', authMiddleware, async (req, res) => {
    try {
        // Foreign keys with ON DELETE CASCADE handle cleanup automatically
        await runSql('DELETE FROM orders WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Delete order error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ============================================
// STATS (admin)
// ============================================

app.get('/api/stats', authMiddleware, async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        const [totalOrders, todayOrders, totalRevenue, todayRevenue, pendingOrders, doneOrders] = await Promise.all([
            queryOne('SELECT COUNT(*) as c FROM orders'),
            queryOne("SELECT COUNT(*) as c FROM orders WHERE DATE(created_at) = ?", [today]),
            queryOne("SELECT COALESCE(SUM(total), 0) as s FROM orders WHERE status = 'done'"),
            queryOne("SELECT COALESCE(SUM(total), 0) as s FROM orders WHERE status = 'done' AND DATE(created_at) = ?", [today]),
            queryOne("SELECT COUNT(*) as c FROM orders WHERE status = 'pending'"),
            queryOne("SELECT COUNT(*) as c FROM orders WHERE status = 'done'"),
        ]);

        res.json({
            totalOrders: totalOrders.c || 0,
            todayOrders: todayOrders.c || 0,
            totalRevenue: totalRevenue.s || 0,
            todayRevenue: todayRevenue.s || 0,
            pendingOrders: pendingOrders.c || 0,
            doneOrders: doneOrders.c || 0,
        });
    } catch (err) {
        console.error('Get stats error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ============================================
// RESET (admin)
// ============================================

app.post('/api/reset', authMiddleware, async (req, res) => {
    try {
        await runSql('DELETE FROM order_item_toppings');
        await runSql('DELETE FROM order_items');
        await runSql('DELETE FROM orders');
        res.json({ success: true });
    } catch (err) {
        console.error('Reset error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ============================================
// PAGE ROUTES
// ============================================

// Admin login page — always accessible
app.get('/admin-login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-login.html'));
});

// Admin dashboard — redirect to login if no valid token
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Admin settings form page
app.get('/admin-settings', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-settings.html'));
});

// ============================================
// START SERVER
// ============================================

async function start() {
    await getPool(); // Initialize MySQL connection pool

    app.listen(PORT, '0.0.0.0', () => {
        console.log('');
        console.log('  🍕 Pizza Azura Server (MySQL)');
        console.log('  ─────────────────────────────');
        console.log(`  🌐 Customer:  http://localhost:${PORT}`);
        console.log(`  🔧 Admin:     http://localhost:${PORT}/admin`);
        console.log(`  💾 Database:  MySQL → pizza_azura`);
        console.log('  ─────────────────────────────');
        console.log('');
    });
}

start();
