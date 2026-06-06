/**
 * ============================================
 * PIZZA AZURA — Database Layer (MySQL)
 * ============================================
 */

const mysql = require('mysql2/promise');

let pool = null;

/**
 * Initialize and return the MySQL connection pool.
 */
async function getPool() {
    if (pool) return pool;

    pool = mysql.createPool({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '',
        database: 'pizza_azura',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        charset: 'utf8mb4'
    });

    // Test connection
    try {
        const conn = await pool.getConnection();
        console.log('✅ Connected to MySQL database: pizza_azura');
        conn.release();
    } catch (err) {
        console.error('❌ MySQL connection failed:', err.message);
        console.error('   Pastikan XAMPP MySQL sudah running!');
        process.exit(1);
    }

    return pool;
}

// ---- QUERY HELPERS ----

/**
 * Execute a SELECT query and return all rows.
 */
async function queryAll(sql, params = []) {
    const [rows] = await pool.execute(sql, params);
    return rows;
}

/**
 * Execute a SELECT query and return the first row (or null).
 */
async function queryOne(sql, params = []) {
    const [rows] = await pool.execute(sql, params);
    return rows.length > 0 ? rows[0] : null;
}

/**
 * Execute an INSERT/UPDATE/DELETE query.
 * Returns the result object (with insertId, affectedRows, etc.)
 */
async function runSql(sql, params = []) {
    const [result] = await pool.execute(sql, params);
    return result;
}

/**
 * Execute an INSERT and return the last inserted ID.
 */
async function getLastInsertId(result) {
    return result.insertId;
}

// ---- QUEUE NUMBER ----
async function getNextQueueNumber() {
    const today = new Date().toISOString().split('T')[0];
    const result = await queryOne(
        "SELECT MAX(queue_number) as max_q FROM orders WHERE DATE(created_at) = ?",
        [today]
    );
    return ((result && result.max_q) || 0) + 1;
}

module.exports = { getPool, queryAll, queryOne, runSql, getLastInsertId, getNextQueueNumber };
