/**
 * PIZZA AZURA — Customer Ordering Logic
 */
let menuData=[], toppingsData=[], selectedSize='22', selectedToppings=[], selectedQty=1, currentMenuItem=null, settingsData={};

function formatCurrency(n){return'Rp '+n.toLocaleString('id-ID')}
function getCart(){try{return JSON.parse(localStorage.getItem('pizzaAzura_cart')||'[]')}catch{return[]}}
function saveCart(c){localStorage.setItem('pizzaAzura_cart',JSON.stringify(c))}
function getCartTotal(){return getCart().reduce((t,i)=>{const tp=i.toppings.reduce((s,x)=>s+x.price,0);return t+(i.price+tp)*i.quantity},0)}

// THEME
function initTheme(){const s=localStorage.getItem('pizzaAzura_theme')||'dark';document.documentElement.setAttribute('data-theme',s);updateThemeIcon(s)}
function toggleTheme(){const c=document.documentElement.getAttribute('data-theme'),n=c==='dark'?'light':'dark';document.documentElement.setAttribute('data-theme',n);localStorage.setItem('pizzaAzura_theme',n);updateThemeIcon(n)}
function updateThemeIcon(t){const i=document.getElementById('themeThumb');if(i){i.innerHTML=t==='dark'?'<svg class="theme-icon-svg" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>':'<svg class="theme-icon-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';}}

// SPLASH
function closeSplash(){document.getElementById('splashOverlay').classList.add('hidden')}

// INIT
document.addEventListener('DOMContentLoaded',async()=>{
    initTheme();
    await loadSettings();
    await loadMenu();await loadToppings();renderMenu();renderBestsellers();updateCartBadge();
    initGisMap();
    document.querySelectorAll('.modal-overlay').forEach(o=>{o.addEventListener('click',e=>{if(e.target===o){o.classList.remove('active');document.body.style.overflow=''}})});
    
    // Scroll listener for floating cart button appearance
    window.addEventListener('scroll', () => {
        const bestsellerSection = document.querySelector('.bestseller-section');
        const floatingCart = document.getElementById('floatingCartBtn');
        if (bestsellerSection && floatingCart) {
            const rect = bestsellerSection.getBoundingClientRect();
            if (rect.top <= window.innerHeight * 0.8) {
                floatingCart.classList.add('visible');
            } else {
                floatingCart.classList.remove('visible');
            }
        }
    });
});

async function loadMenu(){try{const r=await fetch('/api/menu');menuData=await r.json()}catch{showToast('❌ Gagal memuat menu')}}
async function loadToppings(){try{const r=await fetch('/api/toppings');toppingsData=await r.json()}catch{}}

// RENDER MENU with real images
function toggleMobileMenu(){
    const m = document.getElementById('navMenu');
    if(m) m.classList.toggle('show');
}

async function loadSettings(){
    try {
        const r = await fetch('/api/settings');
        const s = await r.json();
        settingsData = s; // Store globally
        
        const setEl = (id, val, isLink=false) => {
            const el = document.getElementById(id);
            if(el) {
                if(isLink) el.href = val;
                else el.innerHTML = val;
            }
        };
        const formatOpHour = (val, prefix) => {
            if (!val) return '';
            if (val.toLowerCase().includes(prefix.toLowerCase().trim())) return val;
            return prefix + ' ' + val;
        };
        const cleanContactValue = (val) => String(val || '')
            .replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}\uFE0F]+\s*/gu, '')
            .trim();

        setEl('heroWaLink', s.wa_link, true);
        setEl('footerSlogan', s.slogan);
        setEl('footerFbLink', s.fb_link || '#', true);
        setEl('footerIgLink', s.ig_link || 'https://www.instagram.com/pizzaazzura?igsh=MW9zcmtnNDAwdzlheQ==', true);
        setEl('footerTtLink', s.tt_link || 'https://vt.tiktok.com/ZS9v7FKmt/', true);
        setEl('footerOpWeekday', formatOpHour(s.op_weekday, 'Senin - Jumat:'));
        setEl('footerOpWeekend', formatOpHour(s.op_weekend, 'Sabtu - Minggu:'));
        setEl('footerOpHoliday', formatOpHour(s.op_holiday, 'Libur Nasional:'));
        setEl('footerAddress', cleanContactValue(s.contact_address) ? `📍 ${cleanContactValue(s.contact_address)}` : '');
        setEl('footerPhone', cleanContactValue(s.contact_phone) ? `📞 ${cleanContactValue(s.contact_phone)}` : '');
        setEl('footerEmail', cleanContactValue(s.contact_email) ? `✉️ ${cleanContactValue(s.contact_email)}` : '');

        // Dynamically render About Us content
        if (s.about_content) {
            const aboutEl = document.getElementById('aboutContent');
            if (aboutEl) {
                aboutEl.innerHTML = s.about_content.split('\n\n').map(p => `<p>${p}</p>`).join('');
            }
        }
    } catch(e) {
        console.error('Failed to load settings', e);
    }
}
function renderMenu(){
    const g=document.getElementById('menuGrid');
    if(!menuData.length){g.innerHTML='<div class="loading-state"><p>Tidak ada menu</p></div>';return}
    g.innerHTML=menuData.map(item=>{
        const isOut = (item.stock !== undefined && item.stock <= 0);
        return `
        <div class="menu-card" ${!isOut ? `onclick="openDetail('${item.id}')"` : 'style="opacity:0.7; cursor:not-allowed;"'}>
            <div class="card-image"><img src="${item.image}" alt="${item.name}" loading="lazy" ${isOut ? 'style="filter: grayscale(100%);"' : ''}></div>
            <div class="card-body">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <div style="font-size: 13px; color: var(--text-secondary); font-weight: 500; margin-bottom: 8px;">
                    ${isOut ? 'Stok Habis' : 'Sisa Stok: ' + (item.stock ?? 100) + ' porsi'}
                </div>
                <div class="card-footer">
                    ${isOut ? `<div class="card-price"><span style="color:var(--danger); font-weight:700;">Stok Habis</span></div>` : `<div class="card-price">${formatCurrency(item.price_s)}<small>Size 22</small></div>`}
                    <button class="card-add-btn" ${!isOut ? `onclick="event.stopPropagation();openDetail('${item.id}')"` : 'disabled style="background:var(--border);"'}>+</button>
                </div>
            </div>
        </div>`
    }).join('');
}

function renderBestsellers() {
    const bg = document.getElementById('bestsellerGrid');
    if (!bg) return;
    
    // Filter menu items that are marked as bestsellers
    let topItems = menuData.filter(item => item.is_bestseller === 1);
    
    // Fallback to first 3 items if no bestsellers are explicitly marked
    if (!topItems.length) {
        topItems = menuData.slice(0, 3);
    } else {
        // Limit to top 3 items
        topItems = topItems.slice(0, 3);
    }
    
    if (!topItems.length) {
        bg.innerHTML = '<div style="color:var(--text-muted); grid-column: 1/-1; text-align:center; padding: 20px;">Belum ada menu terlaris</div>';
        return;
    }
    
    bg.innerHTML = topItems.map(item => {
        const isOut = (item.stock !== undefined && item.stock <= 0);
        return `
        <div class="bestseller-item" ${isOut ? 'style="opacity:0.8;"' : ''}>
            <div class="bestseller-image-wrap">
                <img class="bestseller-img" src="${item.image}" alt="${item.name}" loading="lazy" ${isOut ? 'style="filter: grayscale(100%);"' : ''}>
                <div class="bestseller-badge">🔥 TOP SELLER</div>
            </div>
            <div class="bestseller-details">
                <h3 class="bestseller-title">${item.name}</h3>
                <p class="bestseller-description">${item.description}</p>
                <div style="font-size: 13px; color: var(--text-secondary); font-weight: 500; margin-bottom: 12px; margin-top: -4px;">
                    ${isOut ? 'Stok Habis' : 'Sisa Stok: ' + (item.stock ?? 100) + ' porsi'}
                </div>
                <div class="bestseller-sizes">
                    <div class="size-pill">
                        <span class="size-name">Size 22 (Small)</span>
                        <span class="size-price">${isOut ? '<span style="color:var(--danger)">Habis</span>' : formatCurrency(item.price_s)}</span>
                    </div>
                    <div class="size-pill">
                        <span class="size-name">Size 26 (Medium)</span>
                        <span class="size-price">${isOut ? '<span style="color:var(--danger)">Habis</span>' : formatCurrency(item.price_m)}</span>
                    </div>
                </div>
                <button class="bestseller-add-btn" ${!isOut ? `onclick="openDetail('${item.id}')"` : 'disabled style="background:var(--border); cursor:not-allowed;"'}>
                    <span>${isOut ? 'Stok Habis' : 'Pesan Sekarang'}</span> ${!isOut ? '<span class="plus-icon">+</span>' : ''}
                </button>
            </div>
        </div>`
    }).join('');
}

// DETAIL
function openDetail(id){currentMenuItem=menuData.find(m=>m.id===id);if(!currentMenuItem)return;selectedSize='22';selectedToppings=[];selectedQty=1;renderDetail();openModal('detailModal')}
function renderDetail(){
    const item=currentMenuItem,prices={'22':item.price_s,'26':item.price_m};
    const availableStock = Math.max(0, Number(item.stock ?? 0));
    const isOut = availableStock <= 0;
    const tpT=selectedToppings.reduce((s,tid)=>{const t=toppingsData.find(x=>x.id===tid);return s+(t?t.price:0)},0);
    const total=(prices[selectedSize]+tpT)*selectedQty;
    selectedQty = Math.min(selectedQty, isOut ? 1 : availableStock);
    document.getElementById('detailContent').innerHTML=`
        <img class="detail-img" src="${item.image}" alt="${item.name}">
        <div class="detail-name">${item.name}</div>
        <div class="detail-desc">${item.description}</div>
        <div style="font-size: 13px; color: ${isOut ? 'var(--danger)' : 'var(--text-secondary)'}; font-weight: 600; margin-bottom: 8px;">${isOut ? 'Stok Habis' : 'Sisa Stok: ' + availableStock + ' porsi'}</div>
        <div class="option-group"><label>Pilih Ukuran</label><div class="size-options">
            ${['22','26'].map(s=>`<button class="size-btn ${selectedSize===s?'active':''}" onclick="selectSize('${s}')"><span class="size-label">Size ${s}</span><span class="size-price">${formatCurrency(prices[s])}</span></button>`).join('')}
        </div></div>
        <div class="option-group"><label>Tambahan</label><div class="topping-list">
            ${toppingsData.map(t=>`<div class="topping-item ${selectedToppings.includes(t.id)?'selected':''}" onclick="toggleTopping('${t.id}')"><span class="topping-name">🧀 ${t.name}</span><span class="topping-price">+${formatCurrency(t.price)}</span></div>`).join('')}
        </div></div>
        <div class="option-group"><label>Jumlah</label><div class="qty-control"><button class="qty-btn" onclick="changeQty(-1)" ${isOut ? 'disabled' : ''}>−</button><span class="qty-value">${selectedQty}</span><button class="qty-btn" onclick="changeQty(1)" ${isOut ? 'disabled' : ''}>+</button></div></div>
        <button class="add-to-cart-btn" onclick="addItemToCart()" ${isOut ? 'disabled style="background:var(--border); cursor:not-allowed;"' : ''}><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:6px;"><path d="M6 6h15l-1.5 7.5H7.5"></path><path d="M6 6L4 2H2"></path><circle cx="9" cy="20" r="1.5"></circle><circle cx="18" cy="20" r="1.5"></circle></svg>${isOut ? 'Stok Habis' : 'Tambah — ' + formatCurrency(total)}</button>`;
}
function selectSize(s){selectedSize=s;renderDetail()}
function toggleTopping(id){const i=selectedToppings.indexOf(id);if(i>=0)selectedToppings.splice(i,1);else selectedToppings.push(id);renderDetail()}
function changeQty(d){
    const availableStock = Math.max(0, Number(currentMenuItem?.stock ?? 0));
    if (availableStock <= 0) return;
    selectedQty = Math.min(availableStock, Math.max(1, selectedQty + d));
    renderDetail();
}

// ADD TO CART
function addItemToCart(){
    const item=currentMenuItem;
    if (!item) return;
    const availableStock = Math.max(0, Number(item.stock ?? 0));
    if (availableStock <= 0) { showToast('❌ Stok menu ini sudah habis'); return; }
    if (selectedQty > availableStock) { showToast('❌ Stok tidak cukup. Maksimal ' + availableStock + ' porsi'); return; }

    const prices={'22':item.price_s,'26':item.price_m},cart=getCart();
    cart.push({cartId:Date.now()+'_'+Math.random().toString(36).substr(2,5),menuId:item.id,name:item.name,image:item.image,size:selectedSize,price:prices[selectedSize],
        toppings:selectedToppings.map(tid=>{const t=toppingsData.find(x=>x.id===tid);return{id:t.id,name:t.name,price:t.price}}),quantity:selectedQty,notes:''});
    saveCart(cart);closeModal('detailModal');updateCartBadge();showToast('✅ Ditambahkan!')
}

// CART
function openCart(){renderCart();openModal('cartModal')}
function renderCart(){
    const cart=getCart(),c=document.getElementById('cartContent');
    if(!cart.length){c.innerHTML='<div class="cart-empty"><svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="display:block;margin:0 auto 8px;"><path d="M6 6h15l-1.5 7.5H7.5"></path><path d="M6 6L4 2H2"></path><circle cx="9" cy="20" r="1.5"></circle><circle cx="18" cy="20" r="1.5"></circle></svg><p>Keranjang masih kosong</p></div>';return}
    const total=getCartTotal();
    c.innerHTML=`<div class="cart-items">${cart.map(item=>{
        const tp=item.toppings.reduce((s,t)=>s+t.price,0),it=(item.price+tp)*item.quantity;
        return`<div class="cart-item"><img class="cart-item-img" src="${item.image}" alt="${item.name}"><div class="cart-item-info"><h4>${item.name} (Size ${item.size}) ×${item.quantity}</h4><div class="cart-item-details">${item.toppings.length?'+ '+item.toppings.map(t=>t.name).join(', '):''}${item.notes?'<br>📝 '+item.notes:''}</div><div class="cart-item-price">${formatCurrency(it)}</div></div><button class="cart-item-remove" onclick="removeCartItem('${item.cartId}')" aria-label="Hapus item" title="Hapus item"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"></path><path d="M19 6l-1 14H6L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path></svg></button></div>`
    }).join('')}</div><div class="cart-summary"><div class="cart-summary-row total"><span>Total</span><span>${formatCurrency(total)}</span></div></div><button class="checkout-btn" onclick="goToCheckout()"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:6px;"><path d="M5 12h14"></path><path d="M13 5l7 7-7 7"></path></svg>Lanjut ke Checkout</button>`;
}
function removeCartItem(id){saveCart(getCart().filter(i=>i.cartId!==id));updateCartBadge();renderCart();showToast('Item dihapus')}

// CHECKOUT
function goToCheckout(){closeModal('cartModal');renderCheckout();setTimeout(()=>openModal('checkoutModal'),200)}
function renderCheckout(){
    const total=getCartTotal();
    const gisInfo = window.taggedGisLocation ? `📍 GIS Delivery Location:\nKoordinat: ${window.taggedGisLocation.lat}, ${window.taggedGisLocation.lng}\nJarak ke toko: ${window.taggedGisLocation.dist} km\n\n` : '';
    document.getElementById('checkoutContent').innerHTML=`
        <div class="form-group"><label>Nama Pemesan</label><input type="text" class="form-input" id="custName" placeholder="Masukkan nama kamu" required></div>
        <div class="form-group"><label>Tipe Pesanan</label><div class="radio-group"><div class="radio-option"><input type="radio" name="orderType" id="typeDinein" value="dinein" checked><label for="typeDinein"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:6px;"><path d="M3 12h18"></path><path d="M5 12v8h14v-8"></path><path d="M7 8V4h10v4"></path><path d="M7 12v2"></path><path d="M17 12v2"></path></svg>Dine In</label></div><div class="radio-option"><input type="radio" name="orderType" id="typeTakeaway" value="takeaway"><label for="typeTakeaway"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:6px;"><path d="M3 7h18"></path><path d="M5 7v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7"></path><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><path d="M9 11h6"></path></svg>Take Away</label></div></div></div>
        <div class="form-group"><label>Catatan</label><textarea class="notes-input" id="orderNotes" placeholder="Opsional">${gisInfo}</textarea></div>
        <div class="cart-summary"><div class="cart-summary-row total"><span>Total</span><span>${formatCurrency(total)}</span></div></div>
        <button class="checkout-btn" onclick="submitOrder()" id="submitBtn"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:6px;"><path d="M20 6L9 17l-5-5"></path></svg>Konfirmasi & Hubungi WhatsApp</button>`;
}
async function submitOrder(){
    const name=document.getElementById('custName').value.trim();if(!name){showToast('⚠️ Masukkan nama!');return}
    const cart=getCart();if(!cart.length){showToast('⚠️ Keranjang kosong!');return}
    const btn=document.getElementById('submitBtn');btn.disabled=true;btn.textContent='⏳ Memproses pesanan...';
    const orderType = document.querySelector('input[name="orderType"]:checked').value;
    const notes = document.getElementById('orderNotes')?.value || '';
    try{
        const res=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({customerName:name,phone:'',orderType:orderType,paymentMethod:'whatsapp',notes,items:cart})});
        const result=await res.json();
        if(!res.ok){showToast('❌ '+(result.error||'Gagal menyimpan pesanan'));btn.disabled=false;btn.textContent='✅ Konfirmasi & Hubungi WhatsApp';return}

        const adminWa = (typeof settingsData !== 'undefined' && settingsData.admin_wa) ? String(settingsData.admin_wa).replace(/\D/g,'') : '6285198042502';
        const waMessage = `Halo Pizza Azura\n` +
            `Saya ${name}\n` +
            `Tipe Pesanan: ${orderType === 'dinein' ? 'Dine In' : 'Take Away'}\n` +
            `Catatan: ${notes || '-'}\n\n` +
            `Detail Pesanan:\n` +
            cart.map(i => `- ${i.name} (Size ${i.size}) x${i.quantity}${i.toppings?.length ? `\n  + Topping: ${i.toppings.map(t => t.name).join(', ')}` : ''}${i.notes ? `\n  * Catatan item: ${i.notes}` : ''}`).join('\n') +
            `\n\nNomor Antrian: #${String(result.queueNumber).padStart(3,'0')}\n` +
            `Total: Rp ${result.total.toLocaleString('id-ID')}\n\n` +
            `Terima kasih!`;
        const waLink = `https://wa.me/${adminWa}?text=${encodeURIComponent(waMessage)}`;

        saveCart([]);updateCartBadge();closeModal('checkoutModal');
        window.open(waLink, '_blank', 'noopener,noreferrer');
        showSuccessModal(result,cart,orderType,name);
    }catch{showToast('❌ Kesalahan menyimpan pesanan');btn.disabled=false;btn.textContent='✅ Konfirmasi & Hubungi WhatsApp'}
}
function showSuccessModal(order,items,orderType,customerName){
    const q=String(order.queueNumber).padStart(3,'0');
    document.getElementById('successContent').innerHTML=`<div style="padding:20px 0"><div style="font-size:48px;margin-bottom:8px">🎉</div><h2 style="font-size:20px;font-weight:700;margin-bottom:4px">Pesanan Berhasil!</h2><p style="color:var(--text-secondary);font-size:13px;margin-bottom:20px">Nomor antrian kamu:</p><div class="queue-number-display">#${q}</div><div class="success-total">${formatCurrency(order.total)}</div><p style="color:var(--text-muted);font-size:12px;margin-bottom:16px">Total Pembayaran</p><div class="success-details">${items.map(i=>{const t=(i.price+i.toppings.reduce((s,t)=>s+t.price,0))*i.quantity;return`<div style="display:flex;justify-content:space-between;padding:5px 0;font-size:13px;border-bottom:1px solid var(--border)"><span>${i.name} (Size ${i.size}) ×${i.quantity}</span><span style="color:var(--accent);font-weight:600">${formatCurrency(t)}</span></div>`}).join('')}</div><div style="background:rgba(255,107,53,0.08);border:1px solid rgba(255,107,53,0.2);border-radius:12px;padding:14px;margin:14px 0"><p style="font-size:13px;color:var(--accent);font-weight:600">📢 Pesanan sudah dikonfirmasi ke Pizza Azura. Kami akan memprosesnya. Mohon ditunggu pesanannya. Terima Kasih</p></div><button class="checkout-btn" onclick="closeModal('successModal')" style="background:var(--accent)">Kembali ke Menu</button></div>`;
    openModal('successModal');
}

function openModal(id){document.getElementById(id).classList.add('active');document.body.style.overflow='hidden'}
function closeModal(id){document.getElementById(id).classList.remove('active');document.body.style.overflow=''}
function updateCartBadge(){
    const c=getCart(),n=c.reduce((s,i)=>s+i.quantity,0);
    const b=document.getElementById('cartBadge');
    if(b){b.textContent=n;b.style.display=n>0?'flex':'none'}
    const fb=document.getElementById('floatingCartBadge');
    if(fb){fb.textContent=n;fb.style.display=n>0?'flex':'none'}
}
function showToast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2500)}

// ============================================
// WEB GIS LOKASI — Leaflet Implementation
// ============================================
window.taggedGisLocation = null;

function initGisMap() {
    if (typeof L === 'undefined') {
        console.warn('Leaflet library not loaded yet, retrying in 500ms');
        setTimeout(initGisMap, 500);
        return;
    }
    
    // Store coordinate: dynamic from settingsData, or fallback to default
    const lat = parseFloat(settingsData.store_lat || -6.2146);
    const lng = parseFloat(settingsData.store_lng || 106.8215);
    const storeLatLng = [lat, lng];
    
    const storeName = settingsData.store_name || 'Pizza Azura Jakarta';
    const storeAddress = settingsData.store_address || 'Jl. Sudirman No. 123, Jakarta Selatan';
    const storeMapsLink = settingsData.store_maps_link || 'https://maps.app.goo.gl/tVq8NLXusB9Wgr4g8';
    
    const map = L.map('map', {
        center: storeLatLng,
        zoom: 14,
        zoomControl: true,
        scrollWheelZoom: false
    });
    
    // Map tile styles
    const streets = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    });
    
    const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });
    
    const darkMatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    });
    
    // Default to streets (Peta Jalan) layer initially
    streets.addTo(map);
    
    const baseMaps = {
        "🗺️ Peta Jalan": streets,
        "🛰️ Satelit": satellite,
        "🕶️ Mode Gelap": darkMatter
    };
    L.control.layers(baseMaps, null, { position: 'topright' }).addTo(map);
    
    // Add custom Pizza Azura Store Marker
    const storeIcon = L.divIcon({
        html: `<div class="gis-marker store-marker">
                 <div class="marker-pulse"></div>
                 <div class="marker-icon">
                   <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
                     <path d="M20 9.58V21a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9.58"></path>
                     <path d="M2 3h20l-2 6.58H4L2 3z"></path>
                     <path d="M12 14v9"></path>
                     <path d="M8 14h8"></path>
                   </svg>
                 </div>
               </div>`,
        className: 'custom-gis-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });
    
    const storeMarker = L.marker(storeLatLng, { icon: storeIcon }).addTo(map);
    storeMarker.bindPopup(`
        <div style="font-family:'Outfit', sans-serif;">
            <h4 style="margin:0 0 5px 0;color:var(--accent);font-size:14px;font-weight:700;display:flex;align-items:center;gap:6px;">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;"><path d="M20 9.58V21a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9.58"></path><path d="M2 3h20l-2 6.58H4L2 3z"></path></svg>
                <span>${storeName}</span>
            </h4>
            <p style="margin:0 0 10px 0;font-size:12px;line-height:1.4;">${storeAddress}<br><i>Freshly Baked Est.2020</i></p>
            <a href="${storeMapsLink}" target="_blank" class="btn-gis" style="display:inline-block;padding:6px 12px;background:var(--accent);color:#fff;border-radius:6px;text-decoration:none;font-size:11px;font-weight:600;">Petunjuk Arah</a>
        </div>
    `).openPopup();
    
    // Coordinates Display HUD
    const CoordsControl = L.Control.extend({
        onAdd: function() {
            const container = L.DomUtil.create('div', 'gis-coords-display');
            container.id = 'gisCoordsControl';
            container.innerHTML = 'Koordinat: -6.21460, 106.82150';
            return container;
        }
    });
    new CoordsControl({ position: 'bottomleft' }).addTo(map);
    
    // Distance calculator (Haversine formula)
    function getDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // km
        const dLat = (lat2-lat1) * Math.PI / 180;
        const dLon = (lon2-lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2); 
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        const d = R * c; 
        return d.toFixed(2);
    }
    
    let userMarker = null;
    let distanceLine = null;
    
    // Click on map to tag location
    map.on('click', function(e) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        const dist = getDistance(storeLatLng[0], storeLatLng[1], lat, lng);
        
        // Update display coordinates
        const display = document.getElementById('gisCoordsControl');
        if (display) {
            display.innerHTML = `Koordinat: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        }
        
        const userIcon = L.divIcon({
            html: `<div class="gis-marker user-marker">
                     <div class="marker-pulse blue"></div>
                     <div class="marker-icon">
                       <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
                         <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                         <circle cx="12" cy="10" r="3"></circle>
                       </svg>
                     </div>
                   </div>`,
            className: 'custom-gis-marker',
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });
        
        if (userMarker) {
            userMarker.setLatLng(e.latlng);
        } else {
            userMarker = L.marker(e.latlng, { icon: userIcon }).addTo(map);
        }
        
        if (distanceLine) {
            distanceLine.setLatLngs([storeLatLng, e.latlng]);
        } else {
            distanceLine = L.polyline([storeLatLng, e.latlng], {
                color: 'var(--accent, #ff6b35)',
                weight: 3,
                dashArray: '6, 12',
                opacity: 0.85
            }).addTo(map);
        }
        
        userMarker.bindPopup(`
            <div style="font-family:'Outfit', sans-serif; min-width:180px;">
                <h4 style="margin:0 0 5px 0;color:#2563eb;font-size:13px;font-weight:700;display:flex;align-items:center;gap:6px;">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    <span>Lokasi Pengiriman Anda</span>
                </h4>
                <p style="margin:0 0 4px 0;font-size:12px;"><b>Jarak ke Toko:</b> ${dist} km</p>
                <p style="margin:0 0 10px 0;font-size:11px;color:var(--text-muted);">Lokasi ini akan digunakan sebagai titik antar pesanan.</p>
                <button onclick="fillAddressCoord(${lat.toFixed(6)}, ${lng.toFixed(6)}, ${dist})" class="btn-gis" style="width:100%;border:none;background:#2563eb;font-family:inherit;cursor:pointer;text-align:center;">Gunakan Lokasi Ini</button>
            </div>
        `).openPopup();
    });
}

window.fillAddressCoord = function(lat, lng, dist) {
    window.taggedGisLocation = { lat, lng, dist };
    showToast(`📍 Lokasi ditag! Jarak: ${dist} km. Koordinat telah disimpan untuk checkout.`);
    
    // Open cart automatically to guide checkout if there are items
    const cart = getCart();
    if (cart.length > 0) {
        openCart();
    } else {
        showToast("📍 Lokasi disimpan. Silakan pilih menu pizza untuk memesan!");
    }
};

// Smooth scrolling for navigation links and mobile sidebar handling
document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (link) {
        const targetId = link.getAttribute('href');
        if (targetId === '#') return;
        
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
            e.preventDefault();
            targetEl.scrollIntoView({ behavior: 'smooth' });
            
            // Close mobile menu if open
            const menu = document.getElementById('navMenu');
            if (menu && menu.classList.contains('show')) {
                menu.classList.remove('show');
            }
        }
    }
});

// Close mobile navigation menu on click outside
document.addEventListener('click', (e) => {
    const menu = document.getElementById('navMenu');
    const burgerBtn = document.getElementById('burgerBtn');
    if (menu && menu.classList.contains('show')) {
        if (!menu.contains(e.target) && (!burgerBtn || !burgerBtn.contains(e.target))) {
            menu.classList.remove('show');
        }
    }
});
