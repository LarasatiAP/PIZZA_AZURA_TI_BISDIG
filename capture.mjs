import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CAPTURE_DIR = path.join(__dirname, 'captures');
const BASE_URL = 'http://localhost:3000';
const CHROME_PATH = '/usr/bin/google-chrome';

// Helper to ensure target directory exists
if (!fs.existsSync(CAPTURE_DIR)) {
  fs.mkdirSync(CAPTURE_DIR, { recursive: true });
}

// Sleep helper
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log('🚀 Launching Google Chrome...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  console.log('✅ Browser launched successfully.\n');

  const mockCartData = [
    {
      cartId: 'mock_1',
      menuId: 'beef_pepperoni',
      name: 'Pizza Beef Pepperoni',
      image: '/images/pizza_pepperoni.webp',
      size: '26',
      price: 65000,
      toppings: [
        { id: 1, name: 'Extra Mozzarella', price: 8000 }
      ],
      notes: 'Extra pedas ya!',
      quantity: 2
    },
    {
      cartId: 'mock_2',
      menuId: 'super_supreme',
      name: 'Pizza Super Supreme',
      image: '/images/pizza_supreme.webp',
      size: '22',
      price: 55000,
      toppings: [],
      notes: '',
      quantity: 1
    }
  ];

  // Helper to take a screenshot
  async function takeScreenshot(url, filename, width, height, setupFn = null) {
    console.log(`📸 Capturing: ${filename} (${width}x${height})`);
    await page.setViewport({ width, height, deviceScaleFactor: 2 }); // Scale factor 2 for crisp High-DPI mockups
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    // Give Leaflet maps, images, and canvases time to render
    await sleep(2500);

    if (setupFn) {
      await page.evaluate(setupFn, mockCartData);
      await sleep(1000); // Wait for setup function effects (like modal opening or reload)
    }

    const outputPath = path.join(CAPTURE_DIR, filename);
    await page.screenshot({ path: outputPath });
    console.log(`   Saved to: ${outputPath}\n`);
  }

  try {
    // ----------------------------------------------------
    // DESKTOP CAPTURES (1280x800)
    // ----------------------------------------------------
    const dWidth = 1280;
    const dHeight = 800;

    // 1. Desktop Hero Above the Fold
    await takeScreenshot(BASE_URL, 'desktop_01_hero.png', dWidth, dHeight);

    // 2. Desktop Bestsellers Section
    await takeScreenshot(BASE_URL, 'desktop_02_bestsellers.png', dWidth, dHeight, () => {
      const el = document.getElementById('bestsellerGrid');
      if (el) el.scrollIntoView({ block: 'center' });
    });

    // 3. Desktop Menu Section
    await takeScreenshot(BASE_URL, 'desktop_03_menu.png', dWidth, dHeight, () => {
      const el = document.getElementById('menuGrid');
      if (el) el.scrollIntoView({ block: 'center' });
    });

    // 4. Desktop Map & About Section
    await takeScreenshot(BASE_URL, 'desktop_04_about_map.png', dWidth, dHeight, () => {
      const el = document.getElementById('map');
      if (el) el.scrollIntoView({ block: 'center' });
    });

    // 5. Desktop Admin Login Page
    await takeScreenshot(`${BASE_URL}/admin-login.html`, 'desktop_05_admin_login.png', dWidth, dHeight);

    // 6. Desktop Cart Open Modal
    await takeScreenshot(BASE_URL, 'desktop_06_cart_open.png', dWidth, dHeight, (cartItems) => {
      localStorage.setItem('pizzaAzura_cart', JSON.stringify(cartItems));
      // Trigger app function to update badge and show cart
      if (typeof updateCartBadge === 'function') updateCartBadge();
      if (typeof openCart === 'function') openCart();
    });

    // 7. Desktop Interactive Mockup Studio
    await takeScreenshot(`${BASE_URL}/mockup-demo.html`, 'desktop_07_mockup_demo.png', dWidth, dHeight);

    // ----------------------------------------------------
    // MOBILE CAPTURES (375x812)
    // ----------------------------------------------------
    const mWidth = 375;
    const mHeight = 812;

    // 8. Mobile Hero Above the Fold
    await takeScreenshot(BASE_URL, 'mobile_01_hero.png', mWidth, mHeight);

    // 9. Mobile Menu Section
    await takeScreenshot(BASE_URL, 'mobile_02_menu.png', mWidth, mHeight, () => {
      const el = document.getElementById('menuGrid');
      if (el) el.scrollIntoView({ block: 'center' });
    });

    // 10. Mobile About & Map Section
    await takeScreenshot(BASE_URL, 'mobile_03_about_map.png', mWidth, mHeight, () => {
      const el = document.getElementById('map');
      if (el) el.scrollIntoView({ block: 'center' });
    });

    // 11. Mobile Cart Open Modal
    await takeScreenshot(BASE_URL, 'mobile_04_cart_open.png', mWidth, mHeight, (cartItems) => {
      localStorage.setItem('pizzaAzura_cart', JSON.stringify(cartItems));
      if (typeof updateCartBadge === 'function') updateCartBadge();
      if (typeof openCart === 'function') openCart();
    });

    // 12. Mobile Admin Login Page
    await takeScreenshot(`${BASE_URL}/admin-login.html`, 'mobile_05_admin_login.png', mWidth, mHeight);

    // 13. Mobile Interactive Mockup Studio
    await takeScreenshot(`${BASE_URL}/mockup-demo.html`, 'mobile_06_mockup_demo.png', mWidth, mHeight);

    console.log('🎉 All 13 screenshots successfully captured!');
    console.log(`Files can be found in: ${CAPTURE_DIR}`);

  } catch (err) {
    console.error('❌ Error during capture process:', err);
  } finally {
    await browser.close();
  }
}

run();
