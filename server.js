/**
 * ============================================
 * PIZZA AZURA — Express Server (MySQL)
 * ============================================
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
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
// Checks that the request has a valid admin/super_admin token
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

// Checks that the admin is specifically a super_admin
function superAdminMiddleware(req, res, next) {
    if (!req.admin || req.admin.role !== 'super_admin') {
        return res.status(403).json({ error: 'Forbidden — Hanya Super Admin yang dapat mengakses fitur ini' });
    }
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
        activeTokens.set(token, { id: admin.id, username: admin.username, role: admin.role || 'admin' });
        res.json({ token, username: admin.username, role: admin.role || 'admin' });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/auth/check', authMiddleware, (req, res) => {
    res.json({ valid: true, username: req.admin.username, role: req.admin.role });
});

app.post('/api/auth/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        activeTokens.delete(authHeader.split(' ')[1]);
    }
    res.json({ success: true });
});

// ============================================
// ADMIN MANAGEMENT ROUTES (Super Admin Only)
// ============================================

// List all admins
app.get('/api/admins', authMiddleware, superAdminMiddleware, async (req, res) => {
    try {
        const admins = await queryAll('SELECT id, username, role FROM admins ORDER BY id ASC');
        res.json(admins);
    } catch (err) {
        console.error('Get admins error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create new admin (always role 'admin' — super_admin dibuat hanya via database)
app.post('/api/admins', authMiddleware, superAdminMiddleware, async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username dan password wajib diisi' });
        }

        // Check if username already exists
        const existing = await queryOne('SELECT id FROM admins WHERE username = ?', [username]);
        if (existing) {
            return res.status(400).json({ error: 'Username sudah digunakan' });
        }

        // New admins are always role 'admin'
        await runSql(
            'INSERT INTO admins (username, password, role) VALUES (?, ?, ?)',
            [username, password, 'admin']
        );
        res.json({ success: true });
    } catch (err) {
        console.error('Create admin error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update admin
app.put('/api/admins/:id', authMiddleware, superAdminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { username, password } = req.body;

        const existing = await queryOne('SELECT * FROM admins WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({ error: 'Admin tidak ditemukan' });
        }

        // Super admin hanya bisa edit dirinya sendiri, bukan super admin lain
        if (existing.role === 'super_admin' && req.admin.id !== parseInt(id)) {
            return res.status(403).json({ error: 'Tidak bisa mengedit akun Super Admin lain' });
        }

        if (!username) {
            return res.status(400).json({ error: 'Username wajib diisi' });
        }

        // Check uniqueness if username changed
        if (username !== existing.username) {
            const dup = await queryOne('SELECT id FROM admins WHERE username = ? AND id != ?', [username, id]);
            if (dup) {
                return res.status(400).json({ error: 'Username sudah digunakan oleh admin lain' });
            }
        }

        // Role tidak pernah berubah — tetap sesuai yang ada di database
        if (password && password.trim() !== '') {
            await runSql('UPDATE admins SET username = ?, password = ? WHERE id = ?', [username, password, id]);
        } else {
            await runSql('UPDATE admins SET username = ? WHERE id = ?', [username, id]);
        }

        // Update token in memory if the admin being edited is currently logged in
        for (const [token, data] of activeTokens.entries()) {
            if (data.id === parseInt(id)) {
                data.username = username;
            }
        }

        res.json({ success: true });
    } catch (err) {
        console.error('Update admin error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete admin
app.delete('/api/admins/:id', authMiddleware, superAdminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const existing = await queryOne('SELECT * FROM admins WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({ error: 'Admin tidak ditemukan' });
        }

        // Super admin TIDAK BISA dihapus oleh siapapun
        if (existing.role === 'super_admin') {
            return res.status(400).json({ error: 'Akun Super Admin tidak bisa dihapus' });
        }

        // Prevent deleting self
        if (req.admin.id === parseInt(id)) {
            return res.status(400).json({ error: 'Tidak bisa menghapus akun sendiri' });
        }

        // Revoke active tokens for deleted admin
        for (const [token, data] of activeTokens.entries()) {
            if (data.id === parseInt(id)) {
                activeTokens.delete(token);
            }
        }

        await runSql('DELETE FROM admins WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Delete admin error:', err);
        res.status(500).json({ error: 'Server error' });
    }
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
            [id, name, description || '', image || '/images/pizza_supreme.webp', category || 'classic', price_s, price_m, is_bestseller ? 1 : 0]
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
            [name, description || '', image || '/images/pizza_supreme.webp', category || 'classic', price_s, price_m, is_bestseller ? 1 : 0, id]
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

// Helper function to send WhatsApp via Fonnte API
async function sendWhatsAppNotification(orderId, queueNumber, customerName, phone, orderType, notes, total, items) {
    try {
        const tokenSetting = queryOne("SELECT value FROM settings WHERE key = 'fonnte_token'");
        const adminWaSetting = queryOne("SELECT value FROM settings WHERE key = 'admin_wa'");
        
        const fonnteToken = tokenSetting ? tokenSetting.value : '';
        const adminWa = adminWaSetting ? adminWaSetting.value : '6285198042502';
        
        if (!fonnteToken) {
            console.log('⚠️ Fonnte API Token is not configured. Skipping auto-WhatsApp notification.');
            return;
        }

        const q = String(queueNumber).padStart(3, '0');
        const itemList = items.map(i => {
            let detail = `- ${i.name} (Size ${i.size}) x${i.quantity}`;
            if (i.toppings && i.toppings.length > 0) {
                const toppingsStr = i.toppings.map(t => t.name).join(', ');
                detail += `\n  + Topping: ${toppingsStr}`;
            }
            if (i.notes) {
                detail += `\n  * Catatan item: ${i.notes}`;
            }
            return detail;
        }).join('\n');

        const message = `🍕 *PESANAN BARU - PIZZA AZURA* 🍕\n\n` +
            `ID Pesanan : *${orderId}*\n` +
            `No Antrian : *#${q}*\n` +
            `Pelanggan  : *${customerName}*\n` +
            `No WA      : ${phone || '-'}\n` +
            `Tipe       : *${orderType === 'dinein' ? '🍽️ Dine In' : '📦 Take Away'}*\n` +
            `Catatan    : ${notes || '-'}\n\n` +
            `*Detail Pesanan:*\n${itemList}\n\n` +
            `*Total Bayar:* *Rp ${total.toLocaleString('id-ID')}*\n\n` +
            `Silakan konfirmasi pesanan ini melalui dashboard admin Anda.`;

        const response = await fetch('https://api.fonnte.com/send', {
            method: 'POST',
            headers: {
                'Authorization': fonnteToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                target: adminWa,
                message: message
            })
        });

        const resData = await response.json();
        if (response.ok && resData.status) {
            console.log('✅ WhatsApp notification sent successfully to admin:', adminWa);
        } else {
            console.error('❌ Failed to send WhatsApp notification via Fonnte:', resData);
        }
    } catch (err) {
        console.error('❌ Error sending WhatsApp notification:', err);
    }
}

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

        // Send WhatsApp notification in the background
        sendWhatsAppNotification(orderId, queueNumber, customerName, phone, orderType, notes, total, items);

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
// EXPORT ROUTES (admin)
// ============================================

// Export orders to Excel
app.get('/api/export/orders/excel', authMiddleware, async (req, res) => {
    try {
        const orders = await queryAll('SELECT * FROM orders ORDER BY created_at DESC');

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Pizza Azura';
        workbook.created = new Date();

        // ---- Sheet 1: Daftar Pesanan ----
        const sheet = workbook.addWorksheet('Daftar Pesanan');

        // Header styling
        const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF6B35' } };
        const headerFont = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
        const borderStyle = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

        sheet.columns = [
            { header: 'No', key: 'no', width: 6 },
            { header: 'ID Pesanan', key: 'id', width: 20 },
            { header: 'Antrian', key: 'queue', width: 10 },
            { header: 'Nama Pelanggan', key: 'name', width: 25 },
            { header: 'No. Telepon', key: 'phone', width: 18 },
            { header: 'Tipe', key: 'type', width: 12 },
            { header: 'Pembayaran', key: 'payment', width: 14 },
            { header: 'Total (Rp)', key: 'total', width: 18 },
            { header: 'Status', key: 'status', width: 12 },
            { header: 'Tanggal', key: 'date', width: 22 },
            { header: 'Catatan', key: 'notes', width: 30 },
        ];

        // Style header row
        sheet.getRow(1).eachCell(cell => {
            cell.fill = headerFill;
            cell.font = headerFont;
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = borderStyle;
        });
        sheet.getRow(1).height = 28;

        const typeLabels = { dinein: 'Dine In', takeaway: 'Take Away' };
        const payLabels = { cash: 'Tunai', qris: 'QRIS', transfer: 'Transfer Bank', whatsapp: 'WhatsApp' };
        const statusLabels = { pending: 'Menunggu', done: 'Selesai' };

        orders.forEach((order, idx) => {
            const row = sheet.addRow({
                no: idx + 1,
                id: order.id,
                queue: '#' + String(order.queue_number).padStart(3, '0'),
                name: order.customer_name,
                phone: order.phone || '-',
                type: typeLabels[order.order_type] || order.order_type,
                payment: payLabels[order.payment_method] || order.payment_method,
                total: order.total,
                status: statusLabels[order.status] || order.status,
                date: new Date(order.created_at).toLocaleString('id-ID'),
                notes: order.notes || '-',
            });
            row.eachCell(cell => {
                cell.border = borderStyle;
                cell.alignment = { vertical: 'middle', wrapText: true };
            });
            // Alternate row color
            if (idx % 2 === 1) {
                row.eachCell(cell => {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
                });
            }
        });

        // Total row
        const totalRow = sheet.addRow({});
        totalRow.getCell('payment').value = 'TOTAL';
        totalRow.getCell('payment').font = { bold: true, size: 12 };
        totalRow.getCell('total').value = orders.reduce((s, o) => s + o.total, 0);
        totalRow.getCell('total').font = { bold: true, size: 12, color: { argb: 'FFFF6B35' } };
        totalRow.getCell('total').numFmt = '#,##0';

        // ---- Sheet 2: Ringkasan ----
        const summarySheet = workbook.addWorksheet('Ringkasan');
        summarySheet.columns = [
            { header: 'Metrik', key: 'metric', width: 30 },
            { header: 'Nilai', key: 'value', width: 25 },
        ];
        summarySheet.getRow(1).eachCell(cell => {
            cell.fill = headerFill;
            cell.font = headerFont;
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = borderStyle;
        });

        const totalDone = orders.filter(o => o.status === 'done');
        summarySheet.addRow({ metric: 'Total Pesanan', value: orders.length });
        summarySheet.addRow({ metric: 'Pesanan Selesai', value: totalDone.length });
        summarySheet.addRow({ metric: 'Pesanan Pending', value: orders.filter(o => o.status === 'pending').length });
        summarySheet.addRow({ metric: 'Total Pendapatan (Selesai)', value: 'Rp ' + totalDone.reduce((s, o) => s + o.total, 0).toLocaleString('id-ID') });
        summarySheet.addRow({ metric: 'Tanggal Export', value: new Date().toLocaleString('id-ID') });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=PizzaAzura_Pesanan_${new Date().toISOString().split('T')[0]}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error('Export Excel error:', err);
        res.status(500).json({ error: 'Gagal export Excel' });
    }
});

// Export orders to PDF
app.get('/api/export/orders/pdf', authMiddleware, async (req, res) => {
    try {
        const orders = await queryAll('SELECT * FROM orders ORDER BY created_at DESC');

        const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=PizzaAzura_Pesanan_${new Date().toISOString().split('T')[0]}.pdf`);
        doc.pipe(res);

        // Title
        doc.fontSize(20).font('Helvetica-Bold').fillColor('#ff6b35').text('Pizza Azura — Laporan Pesanan', { align: 'center' });
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica').fillColor('#666666').text(`Diekspor pada: ${new Date().toLocaleString('id-ID')}`, { align: 'center' });
        doc.moveDown(1);

        // Summary boxes
        const totalDone = orders.filter(o => o.status === 'done');
        const totalPending = orders.filter(o => o.status === 'pending');
        const totalRevenue = totalDone.reduce((s, o) => s + o.total, 0);

        doc.fontSize(10).font('Helvetica-Bold').fillColor('#333333');
        doc.text(`Total Pesanan: ${orders.length}    |    Selesai: ${totalDone.length}    |    Pending: ${totalPending.length}    |    Pendapatan: Rp ${totalRevenue.toLocaleString('id-ID')}`, { align: 'center' });
        doc.moveDown(1);

        // Table Header
        const typeLabels = { dinein: 'Dine In', takeaway: 'Take Away' };
        const payLabels = { cash: 'Tunai', qris: 'QRIS', transfer: 'Transfer Bank', whatsapp: 'WhatsApp' };
        const statusLabels = { pending: 'Menunggu', done: 'Selesai' };

        const tableTop = doc.y;
        const colWidths = [30, 90, 50, 120, 80, 60, 80, 80, 60, 100];
        const headers = ['No', 'ID Pesanan', 'Antrian', 'Nama', 'Telepon', 'Tipe', 'Bayar', 'Total', 'Status', 'Tanggal'];
        const startX = doc.page.margins.left;

        // Draw header background
        doc.rect(startX, tableTop, colWidths.reduce((a, b) => a + b, 0), 22).fill('#ff6b35');
        let xPos = startX;
        headers.forEach((h, i) => {
            doc.fontSize(8).font('Helvetica-Bold').fillColor('#ffffff').text(h, xPos + 4, tableTop + 6, { width: colWidths[i] - 8, align: 'left' });
            xPos += colWidths[i];
        });

        let yPos = tableTop + 22;

        orders.forEach((order, idx) => {
            // Page break check
            if (yPos > doc.page.height - 60) {
                doc.addPage({ margin: 40, size: 'A4', layout: 'landscape' });
                yPos = doc.page.margins.top;
            }

            // Alternate row color
            if (idx % 2 === 0) {
                doc.rect(startX, yPos, colWidths.reduce((a, b) => a + b, 0), 20).fill('#f9f9f9');
            }

            const rowData = [
                String(idx + 1),
                order.id,
                '#' + String(order.queue_number).padStart(3, '0'),
                order.customer_name,
                order.phone || '-',
                typeLabels[order.order_type] || order.order_type,
                payLabels[order.payment_method] || order.payment_method,
                'Rp ' + order.total.toLocaleString('id-ID'),
                statusLabels[order.status] || order.status,
                new Date(order.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }),
            ];

            xPos = startX;
            rowData.forEach((val, i) => {
                doc.fontSize(7).font('Helvetica').fillColor('#333333').text(val, xPos + 4, yPos + 5, { width: colWidths[i] - 8, align: 'left' });
                xPos += colWidths[i];
            });

            yPos += 20;
        });

        // Footer
        doc.moveDown(2);
        doc.fontSize(8).font('Helvetica').fillColor('#999999').text('© Pizza Azura — Laporan ini dibuat secara otomatis oleh sistem', startX, yPos + 10);

        doc.end();
    } catch (err) {
        console.error('Export PDF error:', err);
        res.status(500).json({ error: 'Gagal export PDF' });
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

    // Auto-migrate: ensure role column exists in admins table
    try {
        await runSql("ALTER TABLE admins ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'admin'");
        console.log('✅ Kolom role ditambahkan ke tabel admins');
    } catch (err) {
        // Column already exists — this is fine
        if (err.code !== 'ER_DUP_FIELDNAME') {
            console.log('ℹ️  Kolom role sudah ada di tabel admins');
        }
    }

    // Ensure at least one super_admin exists
    try {
        const superCount = await queryOne("SELECT COUNT(*) as c FROM admins WHERE role = 'super_admin'");
        if (superCount.c === 0) {
            // Promote the first admin to super_admin
            const firstAdmin = await queryOne("SELECT id FROM admins ORDER BY id ASC LIMIT 1");
            if (firstAdmin) {
                await runSql("UPDATE admins SET role = 'super_admin' WHERE id = ?", [firstAdmin.id]);
                console.log('✅ Admin pertama dipromosikan ke super_admin');
            }
        }
    } catch (err) {
        console.error('Auto-migrate check error:', err);
    }

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
