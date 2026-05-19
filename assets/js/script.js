document.addEventListener('DOMContentLoaded', function() {
    const cartCountEl = document.getElementById('cart-count');
    const buttons = document.querySelectorAll('.btn-order, .btn-order-item');

    const showToast = (message, success = true) => {
        const toast = document.createElement('div');
        toast.className = `toast ${success ? 'toast-success' : 'toast-error'}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add('toast-visible');
        });

        setTimeout(() => {
            toast.classList.remove('toast-visible');
            toast.addEventListener('transitionend', () => toast.remove(), { once: true });
        }, 3200);
    };

    const updateCartCount = (count) => {
        if (!cartCountEl) return;
        cartCountEl.textContent = Number(count || 0);
        cartCountEl.classList.toggle('has-items', Number(count) > 0);
    };

    const fetchCartCount = async () => {
        if (!cartCountEl) return;

        try {
            const res = await fetch(window.siteUrl + 'cart/count', {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            if (!res.ok) return;
            const data = await res.json();
            if (data && data.success) {
                updateCartCount(data.total_items);
            }
        } catch (err) {
            console.warn('Unable to refresh cart count:', err);
        }
    };

    const handleCartResponse = async (res) => {
        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || 'Server error');
        }

        try {
            return await res.json();
        } catch (err) {
            const text = await res.text();
            throw new Error(text || 'Invalid JSON response');
        }
    };

    buttons.forEach(button => {
        button.addEventListener('click', async () => {
            const id = button.dataset.id || button.getAttribute('data-id');
            const name = button.dataset.name || button.getAttribute('data-name') || button.closest('.product-card')?.querySelector('h1, h2, .product-label')?.innerText || 'Pizza';
            const price = button.dataset.price || button.getAttribute('data-price') || 0;
            const payload = `id=${encodeURIComponent(id)}&name=${encodeURIComponent(name)}&price=${encodeURIComponent(price)}&qty=1`;

            try {
                const res = await fetch(window.siteUrl + 'cart/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': 'application/json'
                    },
                    body: payload
                });

                const data = await handleCartResponse(res);

                if (data.success) {
                    showToast('Pizza berhasil ditambahkan ke cart');
                    updateCartCount(data.total_items);
                } else {
                    showToast('Gagal menambahkan ke cart: ' + (data.message || 'Unknown'), false);
                }
            } catch (err) {
                console.error('Add to cart error:', err);
                showToast('Terjadi kesalahan saat menambahkan ke cart', false);
            }
        });
    });

    fetchCartCount();
});