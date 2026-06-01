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
        setEl('heroWaLink', s.wa_link, true);
        setEl('footerSlogan', s.slogan);
        setEl('footerFbLink', s.fb_link || '#', true);
        setEl('footerIgLink', s.ig_link || 'https://www.instagram.com/pizzaazzura?igsh=MW9zcmtnNDAwdzlheQ==', true);
        setEl('footerTtLink', s.tt_link || 'https://vt.tiktok.com/ZS9v7FKmt/', true);
        setEl('footerOpWeekday', s.op_weekday);
        setEl('footerOpWeekend', s.op_weekend);
        setEl('footerOpHoliday', s.op_holiday);
        setEl('footerAddress', s.contact_address);
        setEl('footerPhone', s.contact_phone);
        setEl('footerEmail', s.contact_email);

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
    g.innerHTML=menuData.map(item=>`
        <div class="menu-card" onclick="openDetail('${item.id}')">
            <div class="card-image"><img src="${item.image}" alt="${item.name}" loading="lazy"></div>
            <div class="card-body">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <div class="card-footer">
                    <div class="card-price">${formatCurrency(item.price_s)}<small>Size 22</small></div>
                    <button class="card-add-btn" onclick="event.stopPropagation();openDetail('${item.id}')">+</button>
                </div>
            </div>
        </div>`).join('');
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
    
    bg.innerHTML = topItems.map(item => `
        <div class="bestseller-item" onclick="openDetail('${item.id}')">
            <div class="bestseller-image-wrap">
                <img class="bestseller-img" src="${item.image}" alt="${item.name}" loading="lazy">
                <div class="bestseller-badge">🔥 TOP SELLER</div>
            </div>
            <div class="bestseller-details">
                <h3 class="bestseller-title">${item.name}</h3>
                <p class="bestseller-description">${item.description}</p>
                <div class="bestseller-sizes">
                    <div class="size-pill">
                        <span class="size-name">Size 22 (Small)</span>
                        <span class="size-price">${formatCurrency(item.price_s)}</span>
                    </div>
                    <div class="size-pill">
                        <span class="size-name">Size 26 (Medium)</span>
                        <span class="size-price">${formatCurrency(item.price_m)}</span>
                    </div>
                </div>
                <button class="bestseller-add-btn" onclick="event.stopPropagation();openDetail('${item.id}')">
                    <span>Pesan Sekarang</span> <span class="plus-icon">+</span>
                </button>
            </div>
        </div>`).join('');
}

// DETAIL
function openDetail(id){currentMenuItem=menuData.find(m=>m.id===id);if(!currentMenuItem)return;selectedSize='22';selectedToppings=[];selectedQty=1;renderDetail();openModal('detailModal')}
function renderDetail(){
    const item=currentMenuItem,prices={'22':item.price_s,'26':item.price_m};
    const tpT=selectedToppings.reduce((s,tid)=>{const t=toppingsData.find(x=>x.id===tid);return s+(t?t.price:0)},0);
    const total=(prices[selectedSize]+tpT)*selectedQty;
    document.getElementById('detailContent').innerHTML=`
        <img class="detail-img" src="${item.image}" alt="${item.name}">
        <div class="detail-name">${item.name}</div>
        <div class="detail-desc">${item.description}</div>
        <div class="option-group"><label>Pilih Ukuran</label><div class="size-options">
            ${['22','26'].map(s=>`<button class="size-btn ${selectedSize===s?'active':''}" onclick="selectSize('${s}')"><span class="size-label">Size ${s}</span><span class="size-price">${formatCurrency(prices[s])}</span></button>`).join('')}
        </div></div>
        <div class="option-group"><label>Tambahan</label><div class="topping-list">
            ${toppingsData.map(t=>`<div class="topping-item ${selectedToppings.includes(t.id)?'selected':''}" onclick="toggleTopping('${t.id}')"><span class="topping-name">🧀 ${t.name}</span><span class="topping-price">+${formatCurrency(t.price)}</span></div>`).join('')}
        </div></div>
        <div class="option-group"><label>Jumlah</label><div class="qty-control"><button class="qty-btn" onclick="changeQty(-1)">−</button><span class="qty-value">${selectedQty}</span><button class="qty-btn" onclick="changeQty(1)">+</button></div></div>
        <div class="option-group"><label>Catatan (opsional)</label><textarea class="notes-input" id="itemNotes" placeholder="Contoh: tidak pedas..."></textarea></div>
        <button class="add-to-cart-btn" onclick="addItemToCart()">🛒 Tambah — ${formatCurrency(total)}</button>`;
}
function selectSize(s){selectedSize=s;renderDetail()}
function toggleTopping(id){const i=selectedToppings.indexOf(id);if(i>=0)selectedToppings.splice(i,1);else selectedToppings.push(id);renderDetail()}
function changeQty(d){selectedQty=Math.max(1,selectedQty+d);renderDetail()}

// ADD TO CART
function addItemToCart(){
    const item=currentMenuItem,prices={'22':item.price_s,'26':item.price_m},cart=getCart();
    cart.push({cartId:Date.now()+'_'+Math.random().toString(36).substr(2,5),menuId:item.id,name:item.name,image:item.image,size:selectedSize,price:prices[selectedSize],
        toppings:selectedToppings.map(tid=>{const t=toppingsData.find(x=>x.id===tid);return{id:t.id,name:t.name,price:t.price}}),quantity:selectedQty,notes:document.getElementById('itemNotes')?.value||''});
    saveCart(cart);closeModal('detailModal');updateCartBadge();showToast('✅ Ditambahkan!')
}

// CART
function openCart(){renderCart();openModal('cartModal')}
function renderCart(){
    const cart=getCart(),c=document.getElementById('cartContent');
    if(!cart.length){c.innerHTML='<div class="cart-empty"><span>🛒</span><p>Keranjang masih kosong</p></div>';return}
    const total=getCartTotal();
    c.innerHTML=`<div class="cart-items">${cart.map(item=>{
        const tp=item.toppings.reduce((s,t)=>s+t.price,0),it=(item.price+tp)*item.quantity;
        return`<div class="cart-item"><img class="cart-item-img" src="${item.image}" alt="${item.name}"><div class="cart-item-info"><h4>${item.name} (Size ${item.size}) ×${item.quantity}</h4><div class="cart-item-details">${item.toppings.length?'+ '+item.toppings.map(t=>t.name).join(', '):''}${item.notes?'<br>📝 '+item.notes:''}</div><div class="cart-item-price">${formatCurrency(it)}</div></div><button class="cart-item-remove" onclick="removeCartItem('${item.cartId}')">🗑️</button></div>`
    }).join('')}</div><div class="cart-summary"><div class="cart-summary-row total"><span>Total</span><span>${formatCurrency(total)}</span></div></div><button class="checkout-btn" onclick="goToCheckout()">Lanjut ke Checkout →</button>`;
}
function removeCartItem(id){saveCart(getCart().filter(i=>i.cartId!==id));updateCartBadge();renderCart();showToast('🗑️ Dihapus')}

// CHECKOUT
function goToCheckout(){closeModal('cartModal');renderCheckout();setTimeout(()=>openModal('checkoutModal'),200)}
function renderCheckout(){
    const total=getCartTotal();
    const gisInfo = window.taggedGisLocation ? `📍 GIS Delivery Location:\nKoordinat: ${window.taggedGisLocation.lat}, ${window.taggedGisLocation.lng}\nJarak ke toko: ${window.taggedGisLocation.dist} km\n\n` : '';
    document.getElementById('checkoutContent').innerHTML=`
        <div class="form-group"><label>Nama Pemesan</label><input type="text" class="form-input" id="custName" placeholder="Masukkan nama kamu"></div>
        <div class="form-group"><label>Nomor WhatsApp</label><input type="tel" class="form-input" id="custPhone" placeholder="+62 8..."></div>
        <div class="form-group"><label>Tipe Pesanan</label><div class="radio-group"><div class="radio-option"><input type="radio" name="orderType" id="typeDinein" value="dinein" checked><label for="typeDinein">🍽️ Dine In</label></div><div class="radio-option"><input type="radio" name="orderType" id="typeTakeaway" value="takeaway"><label for="typeTakeaway">📦 Take Away</label></div></div></div>
        <div class="form-group"><label>Pembayaran</label><div class="payment-note">✅ Pembayaran menggunakan WhatsApp. Setelah pesanan dikonfirmasi, kami akan menghubungi kamu lewat WhatsApp.</div></div>
        <div class="form-group"><label>Catatan</label><textarea class="notes-input" id="orderNotes" placeholder="Opsional">${gisInfo}</textarea></div>
        <div class="cart-summary"><div class="cart-summary-row total"><span>Total</span><span>${formatCurrency(total)}</span></div></div>
        <button class="checkout-btn" onclick="submitOrder()" id="submitBtn">✅ Konfirmasi Pesanan</button>`;
}
async function submitOrder(){
    const name=document.getElementById('custName').value.trim();if(!name){showToast('⚠️ Masukkan nama!');return}
    const cart=getCart();if(!cart.length){showToast('⚠️ Keranjang kosong!');return}
    const btn=document.getElementById('submitBtn');btn.disabled=true;btn.textContent='⏳ Memproses pesanan...';
    const customerPhone = document.getElementById('custPhone')?.value.trim() || '';
    const orderType = document.querySelector('input[name="orderType"]:checked').value;
    try{
        const res=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({customerName:name,phone:customerPhone,orderType:orderType,paymentMethod:'whatsapp',notes:document.getElementById('orderNotes')?.value||'',items:cart})});
        const result=await res.json();
        if(!res.ok){showToast('❌ '+(result.error||'Gagal menyimpan pesanan'));btn.disabled=false;btn.textContent='✅ Konfirmasi Pesanan';return}
        saveCart([]);updateCartBadge();closeModal('checkoutModal');showSuccessModal(result,cart,customerPhone,orderType);
    }catch{showToast('❌ Kesalahan menyimpan pesanan');btn.disabled=false;btn.textContent='✅ Konfirmasi Pesanan'}
}
function showSuccessModal(order,items,customerPhone,orderType){
    const q=String(order.queueNumber).padStart(3,'0');
    const waNumber = '6282171938725';
    const itemList = items.map(i => `${i.name} (Size ${i.size}) x${i.quantity}`).join('\n');
    const waMessage = `Halo Admin,\nSaya ${order.customerName || 'Pelanggan'}\nNomor WA: ${customerPhone || '-'}\nJenis Pesanan: ${orderType || '-'}\n\nDetail Pesanan:\n${itemList}\n\nNomor Antrian: #${q}\nTotal: Rp ${order.total.toLocaleString('id-ID')}\n\nTerima kasih!`;
    const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;
    document.getElementById('successContent').innerHTML=`<div style="padding:20px 0"><div style="font-size:48px;margin-bottom:8px">🎉</div><h2 style="font-size:20px;font-weight:700;margin-bottom:4px">Pesanan Berhasil!</h2><p style="color:var(--text-secondary);font-size:13px;margin-bottom:20px">Nomor antrian kamu:</p><div class="queue-number-display">#${q}</div><div class="success-total">${formatCurrency(order.total)}</div><p style="color:var(--text-muted);font-size:12px;margin-bottom:16px">Total Pembayaran</p><div class="success-details">${items.map(i=>{const t=(i.price+i.toppings.reduce((s,t)=>s+t.price,0))*i.quantity;return`<div style="display:flex;justify-content:space-between;padding:5px 0;font-size:13px;border-bottom:1px solid var(--border)"><span>${i.name} (Size ${i.size}) ×${i.quantity}</span><span style="color:var(--accent);font-weight:600">${formatCurrency(t)}</span></div>`}).join('')}</div><div style="background:rgba(255,107,53,0.08);border:1px solid rgba(255,107,53,0.2);border-radius:12px;padding:14px;margin:14px 0"><p style="font-size:13px;color:var(--accent);font-weight:600">📢 Pesanan Anda sudah masuk ke sistem kami dan sedang dikirim otomatis ke WhatsApp admin. Silakan tunggu konfirmasi selanjutnya.</p></div><a href="${waLink}" target="_blank" class="checkout-btn" style="display:inline-block;text-align:center;text-decoration:none;margin-bottom:10px;background:linear-gradient(135deg,#25d366,#20ba5a)">💬 Kirim Ulang Manual ke WA Admin</a><button class="checkout-btn" onclick="closeModal('successModal')" style="background:var(--accent)">Kembali ke Menu</button></div>`;
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
                 <div class="marker-icon">🍕</div>
               </div>`,
        className: 'custom-gis-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });
    
    const storeMarker = L.marker(storeLatLng, { icon: storeIcon }).addTo(map);
    storeMarker.bindPopup(`
        <div style="font-family:'Outfit', sans-serif;">
            <h4 style="margin:0 0 5px 0;color:var(--accent);font-size:14px;font-weight:700;">🍕 ${storeName}</h4>
            <p style="margin:0 0 10px 0;font-size:12px;line-height:1.4;">${storeAddress}<br><i>Freshly Baked Est.2020</i></p>
            <a href="${storeMapsLink}" target="_blank" class="btn-gis" style="display:inline-block;padding:6px 12px;background:var(--accent);color:#fff;border-radius:6px;text-decoration:none;font-size:11px;font-weight:600;">Petunjuk Arah 🗺️</a>
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
                     <div class="marker-icon">📍</div>
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
                <h4 style="margin:0 0 5px 0;color:#2563eb;font-size:13px;font-weight:700;">📍 Lokasi Pengiriman Anda</h4>
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
