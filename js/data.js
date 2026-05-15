/**
 * ============================================
 * PIZZA AZURA — Shared Data Layer
 * Handles all data persistence via localStorage
 * ============================================
 */

const PizzaAzura = (() => {
    // ---- STORAGE KEYS ----
    const KEYS = {
        MENU: 'pizzaAzura_menu',
        INGREDIENTS: 'pizzaAzura_ingredients',
        ORDERS: 'pizzaAzura_orders',
        CART: 'pizzaAzura_cart',
        TOPPINGS: 'pizzaAzura_toppings',
        ORDER_COUNTER: 'pizzaAzura_orderCounter'
    };

    // ---- DEFAULT INGREDIENTS (Stok Awal) ----
    const DEFAULT_INGREDIENTS = [
        { id: 'keju', name: 'Keju', stock: 20, unit: 'porsi', warningLevel: 5 },
        { id: 'sosis', name: 'Sosis', stock: 15, unit: 'porsi', warningLevel: 5 },
        { id: 'pepperoni', name: 'Pepperoni', stock: 15, unit: 'porsi', warningLevel: 5 },
        { id: 'adonan_s', name: 'Adonan Small', stock: 20, unit: 'pcs', warningLevel: 5 },
        { id: 'adonan_m', name: 'Adonan Medium', stock: 15, unit: 'pcs', warningLevel: 5 },
        { id: 'adonan_l', name: 'Adonan Large', stock: 10, unit: 'pcs', warningLevel: 3 },
        { id: 'saus', name: 'Saus Tomat', stock: 25, unit: 'porsi', warningLevel: 5 },
        { id: 'jamur', name: 'Jamur', stock: 12, unit: 'porsi', warningLevel: 4 },
        { id: 'paprika', name: 'Paprika', stock: 12, unit: 'porsi', warningLevel: 4 },
        { id: 'zaitun', name: 'Zaitun', stock: 10, unit: 'porsi', warningLevel: 3 },
        { id: 'daging_ayam', name: 'Daging Ayam', stock: 12, unit: 'porsi', warningLevel: 4 },
        { id: 'udang', name: 'Udang', stock: 10, unit: 'porsi', warningLevel: 3 },
    ];

    // ---- DEFAULT TOPPINGS ----
    const DEFAULT_TOPPINGS = [
        { id: 'extra_keju', name: 'Extra Keju', price: 5000, ingredients: [{ id: 'keju', qty: 1 }] },
        { id: 'extra_sosis', name: 'Extra Sosis', price: 7000, ingredients: [{ id: 'sosis', qty: 1 }] },
        { id: 'extra_jamur', name: 'Jamur', price: 5000, ingredients: [{ id: 'jamur', qty: 1 }] },
        { id: 'extra_paprika', name: 'Paprika', price: 4000, ingredients: [{ id: 'paprika', qty: 1 }] },
        { id: 'extra_zaitun', name: 'Zaitun', price: 4000, ingredients: [{ id: 'zaitun', qty: 1 }] },
        { id: 'extra_pepperoni', name: 'Extra Pepperoni', price: 8000, ingredients: [{ id: 'pepperoni', qty: 1 }] },
    ];

    // ---- DEFAULT MENU ----
    const DEFAULT_MENU = [
        {
            id: 'pizza_keju',
            name: 'Pizza Keju',
            description: 'Pizza klasik dengan lelehan keju mozzarella yang melimpah di atas saus tomat spesial.',
            image: '🧀',
            category: 'classic',
            prices: { S: 25000, M: 35000, L: 50000 },
            ingredients: {
                S: [{ id: 'keju', qty: 2 }, { id: 'adonan_s', qty: 1 }, { id: 'saus', qty: 1 }],
                M: [{ id: 'keju', qty: 3 }, { id: 'adonan_m', qty: 1 }, { id: 'saus', qty: 1 }],
                L: [{ id: 'keju', qty: 4 }, { id: 'adonan_l', qty: 1 }, { id: 'saus', qty: 2 }],
            },
            available: true
        },
        {
            id: 'pizza_sosis',
            name: 'Pizza Sosis',
            description: 'Paduan sosis premium dengan keju mozzarella dan saus tomat homemade.',
            image: '🌭',
            category: 'classic',
            prices: { S: 28000, M: 38000, L: 55000 },
            ingredients: {
                S: [{ id: 'keju', qty: 1 }, { id: 'sosis', qty: 2 }, { id: 'adonan_s', qty: 1 }, { id: 'saus', qty: 1 }],
                M: [{ id: 'keju', qty: 2 }, { id: 'sosis', qty: 3 }, { id: 'adonan_m', qty: 1 }, { id: 'saus', qty: 1 }],
                L: [{ id: 'keju', qty: 3 }, { id: 'sosis', qty: 4 }, { id: 'adonan_l', qty: 1 }, { id: 'saus', qty: 2 }],
            },
            available: true
        },
        {
            id: 'pizza_pepperoni',
            name: 'Pizza Pepperoni',
            description: 'Pepperoni pilihan dengan keju mozzarella berlapis dan saus tomat Italia.',
            image: '🍕',
            category: 'classic',
            prices: { S: 30000, M: 42000, L: 60000 },
            ingredients: {
                S: [{ id: 'keju', qty: 1 }, { id: 'pepperoni', qty: 2 }, { id: 'adonan_s', qty: 1 }, { id: 'saus', qty: 1 }],
                M: [{ id: 'keju', qty: 2 }, { id: 'pepperoni', qty: 3 }, { id: 'adonan_m', qty: 1 }, { id: 'saus', qty: 1 }],
                L: [{ id: 'keju', qty: 3 }, { id: 'pepperoni', qty: 4 }, { id: 'adonan_l', qty: 1 }, { id: 'saus', qty: 2 }],
            },
            available: true
        },
        {
            id: 'pizza_ayam',
            name: 'Pizza Ayam Spesial',
            description: 'Daging ayam berbumbu dengan jamur, paprika, dan keju mozzarella.',
            image: '🍗',
            category: 'premium',
            prices: { S: 32000, M: 45000, L: 65000 },
            ingredients: {
                S: [{ id: 'keju', qty: 1 }, { id: 'daging_ayam', qty: 2 }, { id: 'jamur', qty: 1 }, { id: 'paprika', qty: 1 }, { id: 'adonan_s', qty: 1 }, { id: 'saus', qty: 1 }],
                M: [{ id: 'keju', qty: 2 }, { id: 'daging_ayam', qty: 3 }, { id: 'jamur', qty: 1 }, { id: 'paprika', qty: 1 }, { id: 'adonan_m', qty: 1 }, { id: 'saus', qty: 1 }],
                L: [{ id: 'keju', qty: 3 }, { id: 'daging_ayam', qty: 4 }, { id: 'jamur', qty: 2 }, { id: 'paprika', qty: 2 }, { id: 'adonan_l', qty: 1 }, { id: 'saus', qty: 2 }],
            },
            available: true
        },
        {
            id: 'pizza_seafood',
            name: 'Pizza Seafood',
            description: 'Udang segar dengan zaitun, paprika, dan keju mozzarella premium.',
            image: '🦐',
            category: 'premium',
            prices: { S: 35000, M: 48000, L: 70000 },
            ingredients: {
                S: [{ id: 'keju', qty: 1 }, { id: 'udang', qty: 2 }, { id: 'zaitun', qty: 1 }, { id: 'paprika', qty: 1 }, { id: 'adonan_s', qty: 1 }, { id: 'saus', qty: 1 }],
                M: [{ id: 'keju', qty: 2 }, { id: 'udang', qty: 3 }, { id: 'zaitun', qty: 1 }, { id: 'paprika', qty: 1 }, { id: 'adonan_m', qty: 1 }, { id: 'saus', qty: 1 }],
                L: [{ id: 'keju', qty: 3 }, { id: 'udang', qty: 4 }, { id: 'zaitun', qty: 2 }, { id: 'paprika', qty: 2 }, { id: 'adonan_l', qty: 1 }, { id: 'saus', qty: 2 }],
            },
            available: true
        },
        {
            id: 'pizza_azura_special',
            name: 'Pizza Azura Special',
            description: 'Signature pizza dengan semua topping premium — keju, sosis, pepperoni, jamur, paprika, dan zaitun!',
            image: '⭐',
            category: 'premium',
            prices: { S: 40000, M: 55000, L: 80000 },
            ingredients: {
                S: [{ id: 'keju', qty: 2 }, { id: 'sosis', qty: 1 }, { id: 'pepperoni', qty: 1 }, { id: 'jamur', qty: 1 }, { id: 'paprika', qty: 1 }, { id: 'zaitun', qty: 1 }, { id: 'adonan_s', qty: 1 }, { id: 'saus', qty: 1 }],
                M: [{ id: 'keju', qty: 3 }, { id: 'sosis', qty: 2 }, { id: 'pepperoni', qty: 2 }, { id: 'jamur', qty: 1 }, { id: 'paprika', qty: 1 }, { id: 'zaitun', qty: 1 }, { id: 'adonan_m', qty: 1 }, { id: 'saus', qty: 1 }],
                L: [{ id: 'keju', qty: 4 }, { id: 'sosis', qty: 3 }, { id: 'pepperoni', qty: 3 }, { id: 'jamur', qty: 2 }, { id: 'paprika', qty: 2 }, { id: 'zaitun', qty: 2 }, { id: 'adonan_l', qty: 1 }, { id: 'saus', qty: 2 }],
            },
            available: true
        },
    ];

    // ---- HELPER: localStorage read/write ----
    function getData(key, defaultValue) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : defaultValue;
        } catch {
            return defaultValue;
        }
    }

    function setData(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    // ---- INITIALIZE DATA ----
    function init() {
        if (!localStorage.getItem(KEYS.MENU)) {
            setData(KEYS.MENU, DEFAULT_MENU);
        }
        if (!localStorage.getItem(KEYS.INGREDIENTS)) {
            setData(KEYS.INGREDIENTS, DEFAULT_INGREDIENTS);
        }
        if (!localStorage.getItem(KEYS.TOPPINGS)) {
            setData(KEYS.TOPPINGS, DEFAULT_TOPPINGS);
        }
        if (!localStorage.getItem(KEYS.ORDERS)) {
            setData(KEYS.ORDERS, []);
        }
        if (!localStorage.getItem(KEYS.CART)) {
            setData(KEYS.CART, []);
        }
        if (!localStorage.getItem(KEYS.ORDER_COUNTER)) {
            setData(KEYS.ORDER_COUNTER, 1000);
        }
    }

    // ---- MENU ----
    function getMenu() {
        return getData(KEYS.MENU, DEFAULT_MENU);
    }

    function getMenuItem(id) {
        return getMenu().find(item => item.id === id);
    }

    function updateMenuAvailability() {
        const menu = getMenu();
        const ingredients = getIngredients();
        
        menu.forEach(item => {
            // Check smallest size (S) to determine availability
            const needed = item.ingredients['S'];
            item.available = needed.every(req => {
                const ing = ingredients.find(i => i.id === req.id);
                return ing && ing.stock >= req.qty;
            });
        });
        
        setData(KEYS.MENU, menu);
        return menu;
    }

    // ---- TOPPINGS ----
    function getToppings() {
        return getData(KEYS.TOPPINGS, DEFAULT_TOPPINGS);
    }

    function getTopping(id) {
        return getToppings().find(t => t.id === id);
    }

    // ---- INGREDIENTS / STOCK ----
    function getIngredients() {
        return getData(KEYS.INGREDIENTS, DEFAULT_INGREDIENTS);
    }

    function updateIngredientStock(ingredientId, newStock) {
        const ingredients = getIngredients();
        const ing = ingredients.find(i => i.id === ingredientId);
        if (ing) {
            ing.stock = Math.max(0, newStock);
            setData(KEYS.INGREDIENTS, ingredients);
            updateMenuAvailability();
        }
        return ingredients;
    }

    function setAllIngredients(ingredientsList) {
        setData(KEYS.INGREDIENTS, ingredientsList);
        updateMenuAvailability();
    }

    function deductStock(menuId, size, toppingIds = [], quantity = 1) {
        const ingredients = getIngredients();
        const menuItem = getMenuItem(menuId);
        if (!menuItem) return false;

        const neededIngredients = menuItem.ingredients[size];
        if (!neededIngredients) return false;

        // Collect all needed ingredients (menu + toppings)
        const allNeeded = [...neededIngredients.map(n => ({ ...n, qty: n.qty * quantity }))];

        // Add topping ingredients
        toppingIds.forEach(tid => {
            const topping = getTopping(tid);
            if (topping) {
                topping.ingredients.forEach(ti => {
                    const existing = allNeeded.find(n => n.id === ti.id);
                    if (existing) {
                        existing.qty += ti.qty * quantity;
                    } else {
                        allNeeded.push({ id: ti.id, qty: ti.qty * quantity });
                    }
                });
            }
        });

        // Check if all ingredients available
        const canMake = allNeeded.every(req => {
            const ing = ingredients.find(i => i.id === req.id);
            return ing && ing.stock >= req.qty;
        });

        if (!canMake) return false;

        // Deduct
        allNeeded.forEach(req => {
            const ing = ingredients.find(i => i.id === req.id);
            if (ing) ing.stock -= req.qty;
        });

        setData(KEYS.INGREDIENTS, ingredients);
        updateMenuAvailability();
        return true;
    }

    function getStockWarnings() {
        const ingredients = getIngredients();
        return ingredients.filter(i => i.stock <= i.warningLevel);
    }

    // ---- CART ----
    function getCart() {
        return getData(KEYS.CART, []);
    }

    function addToCart(item) {
        // item: { menuId, name, size, price, toppings: [{id, name, price}], quantity, notes }
        const cart = getCart();
        item.cartId = Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        cart.push(item);
        setData(KEYS.CART, cart);
        return cart;
    }

    function removeFromCart(cartId) {
        let cart = getCart();
        cart = cart.filter(item => item.cartId !== cartId);
        setData(KEYS.CART, cart);
        return cart;
    }

    function updateCartItemQty(cartId, qty) {
        const cart = getCart();
        const item = cart.find(i => i.cartId === cartId);
        if (item) {
            item.quantity = Math.max(1, qty);
            setData(KEYS.CART, cart);
        }
        return cart;
    }

    function clearCart() {
        setData(KEYS.CART, []);
    }

    function getCartTotal() {
        const cart = getCart();
        return cart.reduce((total, item) => {
            const toppingTotal = item.toppings.reduce((sum, t) => sum + t.price, 0);
            return total + (item.price + toppingTotal) * item.quantity;
        }, 0);
    }

    // ---- ORDERS ----
    function getOrders() {
        return getData(KEYS.ORDERS, []);
    }

    function getOrderById(orderId) {
        return getOrders().find(o => o.id === orderId);
    }

    function createOrder(customerInfo) {
        // customerInfo: { name, phone, paymentMethod, orderType, notes }
        const cart = getCart();
        if (cart.length === 0) return null;

        // Deduct stock for each cart item
        for (const item of cart) {
            const toppingIds = item.toppings.map(t => t.id);
            const success = deductStock(item.menuId, item.size, toppingIds, item.quantity);
            if (!success) {
                return { error: `Stok tidak cukup untuk ${item.name} (${item.size})` };
            }
        }

        let counter = getData(KEYS.ORDER_COUNTER, 1000);
        counter++;
        setData(KEYS.ORDER_COUNTER, counter);

        const order = {
            id: 'AZR-' + counter,
            ...customerInfo,
            items: [...cart],
            total: getCartTotal(),
            status: 'pending', // pending, processing, cooking, done
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const orders = getOrders();
        orders.push(order);
        setData(KEYS.ORDERS, orders);
        clearCart();
        return order;
    }

    function updateOrderStatus(orderId, status) {
        const orders = getOrders();
        const order = orders.find(o => o.id === orderId);
        if (order) {
            order.status = status;
            order.updatedAt = new Date().toISOString();
            setData(KEYS.ORDERS, orders);
        }
        return order;
    }

    function deleteOrder(orderId) {
        let orders = getOrders();
        orders = orders.filter(o => o.id !== orderId);
        setData(KEYS.ORDERS, orders);
        return orders;
    }

    function getOrdersByStatus(status) {
        return getOrders().filter(o => o.status === status);
    }

    // ---- UTILITY ----
    function formatCurrency(amount) {
        return 'Rp ' + amount.toLocaleString('id-ID');
    }

    function resetAll() {
        Object.values(KEYS).forEach(key => localStorage.removeItem(key));
        init();
    }

    const STATUS_LABELS = {
        pending: { text: 'Menunggu', icon: '⏳', color: '#f59e0b' },
        processing: { text: 'Diproses', icon: '📋', color: '#3b82f6' },
        cooking: { text: 'Sedang Dibuat', icon: '🔥', color: '#f97316' },
        done: { text: 'Selesai', icon: '✅', color: '#22c55e' },
    };

    const ORDER_TYPE_LABELS = {
        dinein: 'Dine In',
        takeaway: 'Take Away',
        preorder: 'Pre-Order',
    };

    const PAYMENT_LABELS = {
        cash: 'Tunai',
        qris: 'QRIS',
        transfer: 'Transfer Bank',
    };

    // ---- PUBLIC API ----
    return {
        init,
        getMenu, getMenuItem, updateMenuAvailability,
        getToppings, getTopping,
        getIngredients, updateIngredientStock, setAllIngredients, deductStock, getStockWarnings,
        getCart, addToCart, removeFromCart, updateCartItemQty, clearCart, getCartTotal,
        getOrders, getOrderById, createOrder, updateOrderStatus, deleteOrder, getOrdersByStatus,
        formatCurrency, resetAll,
        STATUS_LABELS, ORDER_TYPE_LABELS, PAYMENT_LABELS,
    };
})();

// Auto-initialize
PizzaAzura.init();
