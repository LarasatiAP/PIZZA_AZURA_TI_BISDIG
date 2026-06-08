-- ============================================
-- PIZZA AZURA — MySQL Database Setup
-- Import file ini lewat phpMyAdmin
-- ============================================
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

CREATE DATABASE IF NOT EXISTS `pizza_azura`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE `pizza_azura`;

-- ============================================
-- TABLE: menu
-- ============================================
CREATE TABLE IF NOT EXISTS `menu` (
  `id` VARCHAR(100) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `image` VARCHAR(500),
  `category` VARCHAR(50),
  `price_s` INT DEFAULT 0,
  `price_m` INT DEFAULT 0,
  `price_l` INT DEFAULT 0,
  `is_bestseller` TINYINT(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- TABLE: toppings
-- ============================================
CREATE TABLE IF NOT EXISTS `toppings` (
  `id` VARCHAR(100) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `price` INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- TABLE: admins
-- ============================================
CREATE TABLE IF NOT EXISTS `admins` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(20) NOT NULL DEFAULT 'admin'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- TABLE: orders
-- ============================================
CREATE TABLE IF NOT EXISTS `orders` (
  `id` VARCHAR(100) NOT NULL PRIMARY KEY,
  `queue_number` INT NOT NULL,
  `customer_name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) DEFAULT '',
  `order_type` VARCHAR(50),
  `payment_method` VARCHAR(50),
  `notes` TEXT,
  `total` INT NOT NULL DEFAULT 0,
  `status` VARCHAR(50) DEFAULT 'pending',
  `created_at` VARCHAR(50) NOT NULL,
  `updated_at` VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- TABLE: order_items
-- ============================================
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `order_id` VARCHAR(100) NOT NULL,
  `menu_id` VARCHAR(100),
  `menu_name` VARCHAR(255),
  `menu_image` VARCHAR(500),
  `size` VARCHAR(10),
  `price` INT DEFAULT 0,
  `quantity` INT DEFAULT 1,
  `notes` TEXT,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- TABLE: order_item_toppings
-- ============================================
CREATE TABLE IF NOT EXISTS `order_item_toppings` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `order_item_id` INT NOT NULL,
  `topping_id` VARCHAR(100),
  `topping_name` VARCHAR(255),
  `topping_price` INT DEFAULT 0,
  FOREIGN KEY (`order_item_id`) REFERENCES `order_items`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- TABLE: settings
-- ============================================
CREATE TABLE IF NOT EXISTS `settings` (
  `key` VARCHAR(100) NOT NULL PRIMARY KEY,
  `value` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- SEED DATA: menu
-- ============================================
INSERT INTO `menu` (`id`, `name`, `description`, `image`, `category`, `price_s`, `price_m`, `price_l`, `is_bestseller`) VALUES
('corn_cheese', 'Pizza Corn Cheese', 'Perpaduan jagung manis dan keju leleh di atas adonan pizza renyah.', '/images/pizza_corn_cheese.png', 'classic', 25000, 40000, 0, 0),
('corn_sosis', 'Pizza Corn Sosis', 'Jagung manis dengan irisan sosis premium di atas pizza crispy.', '/images/pizza_sosis.png', 'classic', 25000, 40000, 0, 0),
('chicken_cheese', 'Pizza Chicken Cheese', 'Ayam berbumbu dengan lelehan keju mozzarella yang melimpah.', '/images/pizza_chicken.png', 'classic', 35000, 50000, 0, 0),
('chicken_blackpepper', 'Pizza Chicken Blackpepper', 'Ayam blackpepper dengan rempah pilihan dan keju gurih.', '/images/pizza_chicken.png', 'classic', 35000, 55000, 0, 0),
('mushroom_corn', 'Pizza Mushroom Corn', 'Jamur segar dan jagung manis dengan saus spesial.', '/images/pizza_mushroom.png', 'standard', 35000, 55000, 0, 0),
('chicken_corn_mayo', 'Pizza Chicken Corn Mayo', 'Ayam, jagung manis, dan saus mayo creamy yang lezat.', '/images/pizza_chicken.png', 'standard', 35000, 55000, 0, 0),
('tuna_corn_mayo', 'Pizza Tuna Corn Mayo', 'Tuna pilihan dengan jagung dan mayo — kombinasi segar!', '/images/pizza_tuna.png', 'standard', 35000, 55000, 0, 0),
('beef_pepperoni', 'Pizza Beef Pepperoni', 'Pepperoni beef premium dengan keju mozzarella berlapis.', '/images/pizza_pepperoni.png', 'premium', 45000, 65000, 0, 0),
('beef_petties', 'Pizza Beef Petties', 'Daging sapi giling berbumbu spesial di atas pizza renyah.', '/images/pizza_pepperoni.png', 'premium', 45000, 65000, 0, 0),
('super_supreme', 'Pizza Super Supreme', 'Semua topping premium dalam satu pizza — the ultimate choice!', '/images/pizza_supreme.png', 'premium', 55000, 75000, 0, 0);

-- ============================================
-- SEED DATA: toppings
-- ============================================
INSERT INTO `toppings` (`id`, `name`, `price`) VALUES
('upgrade_mozarela', 'Upgrade Mozarela', 10000);

-- ============================================
-- SEED DATA: admins (default: admin / admin123)
-- ============================================
INSERT INTO `admins` (`username`, `password`, `role`) VALUES
('admin', 'admin123', 'super_admin');

-- ============================================
-- SEED DATA: settings
-- ============================================
INSERT INTO `settings` (`key`, `value`) VALUES
('slogan', 'Pesan pizza favoritmu secara digital. Cepat, mudah, dan nikmat tanpa perlu antri panjang.'),
('wa_link', 'https://wa.me/6282174666003'),
('ig_link', 'https://www.instagram.com/pizzaazzura?igsh=MW9zcmtnNDAwdzlheQ=='),
('fb_link', '#'),
('tw_link', '#'),
('tt_link', 'https://vt.tiktok.com/ZS9v7FKmt/'),
('op_weekday', 'Senin - Jumat: 10.00 - 22.00'),
('op_weekend', 'Sabtu - Minggu: 11.00 - 23.00'),
('op_holiday', 'Libur Nasional: Buka'),
('contact_address', '📍 Jl. Sudirman No. 123, Jakarta'),
('contact_phone', '📞 +62 851-9804-2502'),
('contact_email', '✉️ hello@pizzaazura.com'),
('about_content', 'Pizza Azura hadir untuk memberi pengalaman pesan pizza tanpa ribet: langsung dari HP, tanpa antre, dan dengan rasa yang selalu konsisten. Kami memilih bahan terbaik — keju berkualitas, saus rahasia, dan topping premium — lalu memanggang setiap pesanan dengan perhatian ekstra sehingga setiap gigitan terasa lezat dan memuaskan.\n\nSelain menu klasik favorit keluarga, kami juga menawarkan variasi pizza kekinian dengan kombinasi topping unik yang pas untuk semua suasana. Inilah cara baru menikmati pizza: praktis, cepat, dan tetap terjaga kualitasnya.\n\nPizza Azura dibuat untuk siapa saja yang ingin makan enak tanpa perlu keluar rumah. Dari pesanan antar cepat hingga pickup langsung di lokasi, kami hadir untuk memanjakan selera Anda di setiap momen special.'),
('store_lat', '-6.2146'),
('store_lng', '106.8215'),
('store_name', 'Pizza Azura Jakarta'),
('store_address', 'Jl. Sudirman No. 123, Jakarta Selatan'),
('store_maps_link', 'https://maps.app.goo.gl/tVq8NLXusB9Wgr4g8');
