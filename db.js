/**
 * ============================================
 * PIZZA AZURA — Database Layer (sql.js)
 * ============================================
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'pizza_azura.db');
let db = null;

async function getDb() {
    if (db) return db;

    const SQL = await initSqlJs();

    // Load existing DB or create new one
    if (fs.existsSync(DB_PATH)) {
        const fileBuffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(fileBuffer);
    } else {
        db = new SQL.Database();
    }

    initSchema();
    seedIfEmpty();
    seedSettingsIfEmpty();
    saveDb();

    return db;
}

function saveDb() {
    if (!db) return;
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
}

// ---- SCHEMA ----
function initSchema() {
    db.run(`
        CREATE TABLE IF NOT EXISTS menu (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            image TEXT,
            category TEXT,
            price_s INTEGER,
            price_m INTEGER,
            price_l INTEGER
        )
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS toppings (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            price INTEGER NOT NULL
        )
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            queue_number INTEGER NOT NULL,
            customer_name TEXT NOT NULL,
            phone TEXT,
            order_type TEXT,
            payment_method TEXT,
            notes TEXT,
            total INTEGER NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id TEXT NOT NULL,
            menu_id TEXT,
            menu_name TEXT,
            menu_image TEXT,
            size TEXT,
            price INTEGER,
            quantity INTEGER,
            notes TEXT,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
        )
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS order_item_toppings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_item_id INTEGER NOT NULL,
            topping_id TEXT,
            topping_name TEXT,
            topping_price INTEGER,
            FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE
        )
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        )
    `);
    
    // Dynamically alter menu table to add is_bestseller if it doesn't exist
    try {
        db.run("ALTER TABLE menu ADD COLUMN is_bestseller INTEGER DEFAULT 0");
        console.log('✅ Column is_bestseller added to menu table');
    } catch (e) {
        // Already exists
    }
}

// ---- SEED DATA ----
function seedIfEmpty() {
    const result = db.exec("SELECT COUNT(*) as c FROM menu");
    const count = result[0].values[0][0];
    if (count > 0) return;

    // price_s = Size 22, price_m = Size 26, price_l = not used
    const menuData = [
        ['corn_cheese', 'Pizza Corn Cheese', 'Perpaduan jagung manis dan keju leleh di atas adonan pizza renyah.', '/images/pizza_corn_cheese.png', 'classic', 25000, 40000, 0],
        ['corn_sosis', 'Pizza Corn Sosis', 'Jagung manis dengan irisan sosis premium di atas pizza crispy.', '/images/pizza_sosis.png', 'classic', 25000, 40000, 0],
        ['chicken_cheese', 'Pizza Chicken Cheese', 'Ayam berbumbu dengan lelehan keju mozzarella yang melimpah.', '/images/pizza_chicken.png', 'classic', 35000, 50000, 0],
        ['chicken_blackpepper', 'Pizza Chicken Blackpepper', 'Ayam blackpepper dengan rempah pilihan dan keju gurih.', '/images/pizza_chicken.png', 'classic', 35000, 55000, 0],
        ['mushroom_corn', 'Pizza Mushroom Corn', 'Jamur segar dan jagung manis dengan saus spesial.', '/images/pizza_mushroom.png', 'standard', 35000, 55000, 0],
        ['chicken_corn_mayo', 'Pizza Chicken Corn Mayo', 'Ayam, jagung manis, dan saus mayo creamy yang lezat.', '/images/pizza_chicken.png', 'standard', 35000, 55000, 0],
        ['tuna_corn_mayo', 'Pizza Tuna Corn Mayo', 'Tuna pilihan dengan jagung dan mayo — kombinasi segar!', '/images/pizza_tuna.png', 'standard', 35000, 55000, 0],
        ['beef_pepperoni', 'Pizza Beef Pepperoni', 'Pepperoni beef premium dengan keju mozzarella berlapis.', '/images/pizza_pepperoni.png', 'premium', 45000, 65000, 0],
        ['beef_petties', 'Pizza Beef Petties', 'Daging sapi giling berbumbu spesial di atas pizza renyah.', '/images/pizza_pepperoni.png', 'premium', 45000, 65000, 0],
        ['super_supreme', 'Pizza Super Supreme', 'Semua topping premium dalam satu pizza — the ultimate choice!', '/images/pizza_supreme.png', 'premium', 55000, 75000, 0],
    ];

    for (const m of menuData) {
        db.run("INSERT INTO menu (id, name, description, image, category, price_s, price_m, price_l) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", m);
    }

    const toppingData = [
        ['upgrade_mozarela', 'Upgrade Mozarela', 10000],
    ];

    for (const t of toppingData) {
        db.run("INSERT INTO toppings (id, name, price) VALUES (?, ?, ?)", t);
    }

    // Admin default
    const adminCheck = db.exec("SELECT COUNT(*) FROM admins");
    if (adminCheck[0].values[0][0] === 0) {
        db.run("INSERT INTO admins (username, password) VALUES (?, ?)", ['admin', 'admin123']);
    }

    console.log('✅ Database seeded successfully');
}

function seedSettingsIfEmpty() {
    const settingsCheck = db.exec("SELECT COUNT(*) FROM settings");
    const defaultSettings = [
        ['slogan', 'Pesan pizza favoritmu secara digital. Cepat, mudah, dan nikmat tanpa perlu antri panjang.'],
        ['wa_link', 'https://wa.me/6282174666003'],
        ['ig_link', 'https://www.instagram.com/pizzaazzura?igsh=MW9zcmtnNDAwdzlheQ=='],
        ['fb_link', '#'],
        ['tw_link', '#'],
        ['tt_link', 'https://vt.tiktok.com/ZS9v7FKmt/'],
        ['op_weekday', 'Senin - Jumat: 10.00 - 22.00'],
        ['op_weekend', 'Sabtu - Minggu: 11.00 - 23.00'],
        ['op_holiday', 'Libur Nasional: Buka'],
        ['contact_address', '📍 Jl. Sudirman No. 123, Jakarta'],
        ['contact_phone', '📞 +62 851-9804-2502'],
        ['contact_email', '✉️ hello@pizzaazura.com'],
        ['about_content', 'Pizza Azura hadir untuk memberi pengalaman pesan pizza tanpa ribet: langsung dari HP, tanpa antre, dan dengan rasa yang selalu konsisten. Kami memilih bahan terbaik — keju berkualitas, saus rahasia, dan topping premium — lalu memanggang setiap pesanan dengan perhatian ekstra sehingga setiap gigitan terasa lezat dan memuaskan.\n\nSelain menu klasik favorit keluarga, kami juga menawarkan variasi pizza kekinian dengan kombinasi topping unik yang pas untuk semua suasana. Inilah cara baru menikmati pizza: praktis, cepat, dan tetap terjaga kualitasnya.\n\nPizza Azura dibuat untuk siapa saja yang ingin makan enak tanpa perlu keluar rumah. Dari pesanan antar cepat hingga pickup langsung di lokasi, kami hadir untuk memanjakan selera Anda di setiap momen special.'],
        ['store_lat', '-6.2146'],
        ['store_lng', '106.8215'],
        ['store_name', 'Pizza Azura Jakarta'],
        ['store_address', 'Jl. Sudirman No. 123, Jakarta Selatan'],
        ['store_maps_link', 'https://maps.app.goo.gl/tVq8NLXusB9Wgr4g8']
    ];
    
    if (settingsCheck.length === 0 || settingsCheck[0].values[0][0] === 0) {
        // First time: insert all defaults
        for (const s of defaultSettings) {
            db.run("INSERT INTO settings (key, value) VALUES (?, ?)", s);
        }
        console.log('✅ Settings seeded');
    } else {
        // Existing database: check and insert missing keys
        for (const [key, value] of defaultSettings) {
            const exists = db.exec("SELECT 1 FROM settings WHERE key = ?", [key]);
            if (exists.length === 0 || exists[0].values.length === 0) {
                db.run("INSERT INTO settings (key, value) VALUES (?, ?)", [key, value]);
                console.log(`✅ Added missing setting: ${key}`);
            }
        }
    }
}

// ---- QUERY HELPERS ----
function queryAll(sql, params = []) {
    const stmt = db.prepare(sql);
    if (params.length) stmt.bind(params);
    const rows = [];
    while (stmt.step()) {
        rows.push(stmt.getAsObject());
    }
    stmt.free();
    return rows;
}

function queryOne(sql, params = []) {
    const rows = queryAll(sql, params);
    return rows.length > 0 ? rows[0] : null;
}

function runSql(sql, params = []) {
    db.run(sql, params);
    saveDb();
}

function getLastInsertId() {
    const result = db.exec("SELECT last_insert_rowid()");
    return result[0].values[0][0];
}

// ---- QUEUE NUMBER ----
function getNextQueueNumber() {
    const today = new Date().toISOString().split('T')[0];
    const result = queryOne("SELECT MAX(queue_number) as max_q FROM orders WHERE DATE(created_at) = ?", [today]);
    return ((result && result.max_q) || 0) + 1;
}

module.exports = { getDb, saveDb, queryAll, queryOne, runSql, getLastInsertId, getNextQueueNumber };
