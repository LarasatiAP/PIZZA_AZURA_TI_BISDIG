/**
 * PIZZA AZURA — Customer Ordering Logic
 */
let menuData=[], toppingsData=[], selectedSize='22', selectedToppings=[], selectedQty=1, currentMenuItem=null;

function formatCurrency(n){return'Rp '+n.toLocaleString('id-ID')}
function getCart(){try{return JSON.parse(localStorage.getItem('pizzaAzura_cart')||'[]')}catch{return[]}}
function saveCart(c){localStorage.setItem('pizzaAzura_cart',JSON.stringify(c))}
function getCartTotal(){return getCart().reduce((t,i)=>{const tp=i.toppings.reduce((s,x)=>s+x.price,0);return t+(i.price+tp)*i.quantity},0)}

// THEME
function initTheme(){const s=localStorage.getItem('pizzaAzura_theme')||'dark';document.documentElement.setAttribute('data-theme',s);updateThemeIcon(s)}
function toggleTheme(){const c=document.documentElement.getAttribute('data-theme'),n=c==='dark'?'light':'dark';document.documentElement.setAttribute('data-theme',n);localStorage.setItem('pizzaAzura_theme',n);updateThemeIcon(n)}
function updateThemeIcon(t){const i=document.getElementById('themeIcon');if(i)i.textContent=t==='dark'?'☀️':'🌙'}

// SPLASH
function closeSplash(){document.getElementById('splashOverlay').classList.add('hidden')}

// INIT
document.addEventListener('DOMContentLoaded',async()=>{
    initTheme();
    await loadMenu();await loadToppings();renderMenu();updateCartBadge();
    document.querySelectorAll('.modal-overlay').forEach(o=>{o.addEventListener('click',e=>{if(e.target===o){o.classList.remove('active');document.body.style.overflow=''}})});
});

async function loadMenu(){try{const r=await fetch('/api/menu');menuData=await r.json()}catch{showToast('❌ Gagal memuat menu')}}
async function loadToppings(){try{const r=await fetch('/api/toppings');toppingsData=await r.json()}catch{}}

// RENDER MENU with real images
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
    document.getElementById('checkoutContent').innerHTML=`
        <div class="form-group"><label>Nama Pemesan</label><input type="text" class="form-input" id="custName" placeholder="Masukkan nama kamu"></div>
        <div class="form-group"><label>Tipe Pesanan</label><div class="radio-group"><div class="radio-option"><input type="radio" name="orderType" id="typeDinein" value="dinein" checked><label for="typeDinein">🍽️ Dine In</label></div><div class="radio-option"><input type="radio" name="orderType" id="typeTakeaway" value="takeaway"><label for="typeTakeaway">📦 Take Away</label></div></div></div>
        <div class="form-group"><label>Pembayaran</label><div class="radio-group"><div class="radio-option"><input type="radio" name="payMethod" id="payCash" value="cash" checked><label for="payCash">💵 Tunai</label></div><div class="radio-option"><input type="radio" name="payMethod" id="payQris" value="qris"><label for="payQris">📱 QRIS</label></div></div></div>
        <div class="form-group"><label>Catatan</label><textarea class="notes-input" id="orderNotes" placeholder="Opsional"></textarea></div>
        <div class="cart-summary"><div class="cart-summary-row total"><span>Total</span><span>${formatCurrency(total)}</span></div></div>
        <button class="checkout-btn" onclick="submitOrder()" id="submitBtn">✅ Konfirmasi Pesanan</button>`;
}
async function submitOrder(){
    const name=document.getElementById('custName').value.trim();if(!name){showToast('⚠️ Masukkan nama!');return}
    const cart=getCart();if(!cart.length){showToast('⚠️ Keranjang kosong!');return}
    const btn=document.getElementById('submitBtn');btn.disabled=true;btn.textContent='⏳ Memproses...';
    try{
        const res=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({customerName:name,phone:'',orderType:document.querySelector('input[name="orderType"]:checked').value,paymentMethod:document.querySelector('input[name="payMethod"]:checked').value,notes:document.getElementById('orderNotes')?.value||'',items:cart})});
        const result=await res.json();if(!res.ok){showToast('❌ '+(result.error||'Gagal'));btn.disabled=false;btn.textContent='✅ Konfirmasi Pesanan';return}
        saveCart([]);updateCartBadge();closeModal('checkoutModal');showSuccessModal(result,cart);
    }catch{showToast('❌ Kesalahan');btn.disabled=false;btn.textContent='✅ Konfirmasi Pesanan'}
}
function showSuccessModal(order,items){
    const q=String(order.queueNumber).padStart(3,'0');
    document.getElementById('successContent').innerHTML=`<div style="padding:20px 0"><div style="font-size:48px;margin-bottom:8px">🎉</div><h2 style="font-size:20px;font-weight:700;margin-bottom:4px">Pesanan Berhasil!</h2><p style="color:var(--text-secondary);font-size:13px;margin-bottom:20px">Nomor antrian kamu:</p><div class="queue-number-display">#${q}</div><div class="success-total">${formatCurrency(order.total)}</div><p style="color:var(--text-muted);font-size:12px;margin-bottom:16px">Total Pembayaran</p><div class="success-details">${items.map(i=>{const t=(i.price+i.toppings.reduce((s,t)=>s+t.price,0))*i.quantity;return`<div style="display:flex;justify-content:space-between;padding:5px 0;font-size:13px;border-bottom:1px solid var(--border)"><span>${i.name} (Size ${i.size}) ×${i.quantity}</span><span style="color:var(--accent);font-weight:600">${formatCurrency(t)}</span></div>`}).join('')}</div><div style="background:rgba(255,107,53,0.08);border:1px solid rgba(255,107,53,0.2);border-radius:12px;padding:14px;margin:14px 0"><p style="font-size:13px;color:var(--accent);font-weight:600">📢 Silakan tunggu nomor antrian Anda dipanggil!</p></div><button class="checkout-btn" onclick="closeModal('successModal')">Kembali ke Menu</button></div>`;
    openModal('successModal');
}

function openModal(id){document.getElementById(id).classList.add('active');document.body.style.overflow='hidden'}
function closeModal(id){document.getElementById(id).classList.remove('active');document.body.style.overflow=''}
function updateCartBadge(){const c=getCart(),b=document.getElementById('cartBadge'),n=c.reduce((s,i)=>s+i.quantity,0);b.textContent=n;b.style.display=n>0?'flex':'none'}
function showToast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2500)}
