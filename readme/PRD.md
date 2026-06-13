# Project Requirements Document (PRD)

## Pizza Azura — Digital Ordering System

---

## 1. Project Overview
**Pizza Azura** is a lightweight, responsive digital ordering system designed for a pizza restaurant. The system allows customers to browse menus, customize pizzas (size, toppings), add items to a shopping cart, submit orders, and track order status. It also provides an administrative dashboard for restaurant staff to manage order queues, track daily revenue/statistics, adjust shop settings, and monitor ingredient stock levels.

The project is structured to run in two distinct architectural modes:
1. **Frontend-Only Mode (Root-level)**: Runs entirely in the browser using client-side scripts and persists data locally using `localStorage`. Useful for offline demos, standalone client testing, or static deployment.
2. **Fullstack Mode (Server-side)**: Run via a Node.js Express server (`server.js`) with a MySQL database (`mysql2`) to provide secure admin authentication, persistent relational data storage, and unified server routing.

---

## 2. Target Audience & Roles
*   **Customers**: Guests accessing the system via mobile or desktop browsers at the restaurant (or remotely) to place self-service orders.
*   **Restaurant Administrators / Cashiers / Kitchen Staff**: Staff managing the order pipeline, updating pizza preparation status, monitoring raw ingredient stocks, and configuring shop details.

---

## 3. System Architecture & Project Structure

The codebase is split into two implementations:

### Folder Structure
*   **`/` (Root Directory)**: Front-end client-only version.
    *   `index.html` - Customer ordering client.
    *   `admin.html` - Admin dashboard client.
    *   `js/data.js` - Data Layer (uses `localStorage` persistence).
    *   `js/app.js` - Customer interaction logic.
    *   `js/admin.js` - Admin panel interaction logic.
    *   `css/` - Styling sheets.
*   **`/public`**: Fullstack Web root folder served by the backend.
    *   Contains the server-adapted version of the front-end pages, using fetch requests to the REST API instead of the local storage data layer.
*   **`/server.js`**: Node.js server using Express.
*   **`/db.js`**: Database connection and initialization using `mysql2` (MySQL).
*   **`/pizza_azura.sql`**: Relational database schema and seed data file.

### Architecture Comparison
| Feature | Frontend-Only Mode (Root) | Fullstack Mode (Server) |
| :--- | :--- | :--- |
| **Data Storage** | Browser `localStorage` | MySQL Database (`pizza_azura`) |
| **Authentication** | None (direct access to admin.html) | Secure session token-based authorization |
| **Server Routing** | Static files only | Express REST APIs + Static file server |
| **Multi-device Sync** | Local to single browser | Multi-device synchronization (Customer & Admin synced) |

---

## 4. Key Functional Features

### 4.1 Customer Face (Ordering Interface)
1.  **Menu Browsing**:
    *   View all available pizza items with pictures/emojis, names, description, and base prices.
    *   Filter menu items by categories: "Semua" (All), "Classic", or "Premium".
    *   Dynamic item availability indicator (e.g., marks pizza as "HABIS" (Out of Stock) if raw ingredients are insufficient).
2.  **Item Selection and Customization Modal**:
    *   Select pizza sizes: **Small (S)**, **Medium (M)**, or **Large (L)**.
    *   Choose optional paid toppings (e.g., Upgrade Mozzarella, Extra Toppings).
    *   Adjust quantity (minimum 1).
    *   Enter specific instructions/notes (e.g., "no onions", "extra sauce").
3.  **Shopping Cart**:
    *   Review added items, configurations, and notes.
    *   Dynamically calculate subtotals and overall grand totals.
    *   Remove items from the cart.
4.  **Checkout Flow**:
    *   Require **Customer Name** (mandatory) and **WhatsApp Phone Number** (optional).
    *   Select **Order Type**: Dine In, Take Away, or Pre-Order.
    *   Select **Payment Method**: Cash (Tunai), QRIS, or Bank Transfer.
    *   Input optional order-wide notes.
    *   Deduct corresponding ingredient stock upon successful validation.
5.  **Order Tracking / Status Page**:
    *   Display a success modal with a unique Order ID (e.g., `AZR-1001` or `AZR-TJKLA`).
    *   Provide a timeline track of order status: `Pending` ➡️ `Processing` (Diproses) ➡️ `Cooking` (Sedang Dibuat) ➡️ `Done` (Selesai).
    *   Refresh status button to fetch updated pipeline state.

### 4.2 Administrator Dashboard
1.  **Admin Authentication (Fullstack Mode)**:
    *   Admin Login page (`/admin-login`).
    *   Requires username and password (default: `admin` / `admin123`).
    *   Protected admin routes using Bearer token verification.
2.  **Real-Time Queue Board**:
    *   View all active and historic orders.
    *   Sort and organize queue by status filters (All, Pending, Processing, Cooking, Done).
    *   Preparation Pipeline actions:
        *   Accept Order (`Pending` ➡️ `Processing`)
        *   Cook Pizza (`Processing` ➡️ `Cooking`)
        *   Mark as Ready (`Cooking` ➡️ `Done`)
        *   Delete/Cancel Order.
    *   Auto-refresh order updates (polls every 5 seconds).
3.  **Revenue & Stats Overview**:
    *   Display key metrics: Total Orders, Orders Today, Total Completed Revenue, Today's Revenue, Active/Pending Queue counts.
4.  **Ingredient Stock Monitoring**:
    *   Visual stock level tracking (dynamic color-coded bar chart based on warning thresholds).
    *   Highlight low-stock warnings at the top of the dashboard.
    *   Quick-edit inputs to restock or manually adjust raw material quantities (e.g., Keju, Sosis, Adonan, Pepperoni).
5.  **Store Settings Control (Fullstack Mode)**:
    *   Update restaurant operational details: Slogan text, WhatsApp connection links, Social media tags (IG, FB, TikTok), Operating Hours (Weekday/Weekend), Address location, Store Contact Email/Phone, and Fonnte WhatsApp Gateway parameters (API Token & Admin Phone).
6.  **Database Reset**:
    *   Option to wipe order history and restore initial database conditions for clean shifts.

---

## 5. Database Schema & Data Models

The system defines the following relational structures, implemented directly in MySQL and mirrored in the `localStorage` JSON structures:

### `menu`
Stores the pizza catalog.
*   `id` (TEXT, PK): Unique pizza identifier (e.g., `beef_pepperoni`).
*   `name` (TEXT): Name of the pizza.
*   `description` (TEXT): Description of ingredients and flavor profile.
*   `image` (TEXT): Path to image file or emoji representation.
*   `category` (TEXT): Category grouping (`classic`, `standard`, `premium`).
*   `price_s` / `price_m` / `price_l` (INTEGER): Specific sizes pricing values in IDR.

### `toppings`
Stores available customization options.
*   `id` (TEXT, PK): Topping identifier (e.g., `upgrade_mozarela`).
*   `name` (TEXT): Display name.
*   `price` (INTEGER): Addition charge price.

### `admins`
Stores credentials for authorized staff.
*   `id` (INTEGER, PK, AUTOINCREMENT)
*   `username` (TEXT, UNIQUE)
*   `password` (TEXT)

### `orders`
Stores customer transaction headers.
*   `id` (TEXT, PK): Unique Order ID format (e.g. `AZR-[timestamp]`).
*   `queue_number` (INTEGER): Daily incremental order number.
*   `customer_name` (TEXT): Customer's name.
*   `phone` (TEXT): Contact number.
*   `order_type` (TEXT): `dinein`, `takeaway`, `preorder`.
*   `payment_method` (TEXT): `cash`, `qris`, `transfer`.
*   `notes` (TEXT): Chef or delivery notes.
*   `total` (INTEGER): Grand total amount paid.
*   `status` (TEXT): Order pipeline state (`pending`, `processing`, `cooking`, `done`).
*   `created_at` (TEXT): ISO timestamp.
*   `updated_at` (TEXT): ISO timestamp.

### `order_items`
Stores order detail rows.
*   `id` (INTEGER, PK, AUTOINCREMENT)
*   `order_id` (TEXT, FK): References `orders(id)`.
*   `menu_id` (TEXT): ID of the ordered pizza.
*   `menu_name` (TEXT): Logged name (snapshot).
*   `menu_image` (TEXT): Logged image.
*   `size` (TEXT): Selected size (`S`, `M`, or `L`).
*   `price` (INTEGER): Unit price snapshot.
*   `quantity` (INTEGER): Quantity ordered.
*   `notes` (TEXT): Customizations for this pizza.

### `order_item_toppings`
Stores toppings linked to specific ordered item rows.
*   `id` (INTEGER, PK, AUTOINCREMENT)
*   `order_item_id` (INTEGER, FK): References `order_items(id)`.
*   `topping_id` (TEXT)
*   `topping_name` (TEXT)
*   `topping_price` (INTEGER)

### `settings`
Stores shop operational configurations in key-value format.
*   `key` (TEXT, PK): Config parameter name.
*   `value` (TEXT): Parameter value.

---

## 6. API Endpoints (Fullstack Mode)

All backend endpoints are prefixed with `/api` and expect JSON payloads for request bodies.

### Authentication
*   `POST /api/auth/login`: Authenticate admin user. Returns session token.
*   `GET /api/auth/check`: Validate current Bearer session token.
*   `POST /api/auth/logout`: Invalidate session token.

### Catalog & Settings
*   `GET /api/menu`: Fetch entire pizza menu database.
*   `GET /api/toppings`: Fetch available extra toppings list.
*   `GET /api/settings`: Retrieve all custom shop configurations.
*   `PUT /api/settings`: Update configurations (requires Bearer token).

### Orders Management
*   `POST /api/orders`: Submit new order (Customer). Deducts stock.
*   `GET /api/orders/:id`: Query specific order details and status (Customer status check).
*   `GET /api/orders`: Fetch list of all orders including items & toppings (requires Bearer token).
*   `PUT /api/orders/:id/status`: Update status pipeline (requires Bearer token).
*   `DELETE /api/orders/:id`: Permanently delete/cancel an order (requires Bearer token).

### Maintenance & Statistics
*   `GET /api/stats`: Fetch dashboard statistics metrics (requires Bearer token).
*   `POST /api/reset`: Wipes all order records to reset shifts (requires Bearer token).

---

## 7. Non-Functional Requirements & Design
*   **Performance**: Extremely quick client-side load time. Image assets are lightweight (using emojis in Client-only mode, and optimized png/svg files in Fullstack mode).
*   **Design & UI/UX**:
    *   Vibrant, theme-appropriate design incorporating food-centered color schemes (deep tomato reds, cheese yellow/gold accents, charcoal black dark modes).
    *   Responsive layouts optimized for both handheld mobile browsers (for customers scanning table codes) and tablets/desktops (for kitchen administration).
    *   Smooth transitions and micro-animations for cart additions, state switches, and warning banners.
*   **Usability**: Direct, simplified ordering process requires minimal taps from landing to checkout receipt.

---

## 8. Recent Architectural Modifications & Hotfixes (June 2026)
1. **WhatsApp Administration Routing**:
   * Migrated default restaurant admin WhatsApp notifications (both auto-Fonnte notifications and client-compiled links) from `6282171938725` to the new official contact line: **`+62 851-9804-2502`** (stored as `6285198042502` for API compatibility).
2. **Settings Tab Standardization**:
   * Standardized settings form layouts across dashboard views. Enabled WhatsApp Gateway configuration (Fonnte API Token and Admin WhatsApp Number) directly inside the admin control panel.
3. **Database Integrity Optimization**:
   * Configured MySQL foreign key constraints (`ON DELETE CASCADE`) to ensure cascading delete integrity for related order rows and toppings.
