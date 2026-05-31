/**
 * Logic for admin settings single page
 */

function getToken() { return sessionStorage.getItem('adminToken'); }
function checkAuth() {
    if (!getToken()) window.location.href = '/admin-login';
}

async function apiFetch(url, options = {}) {
    const token = getToken();
    if (token) {
        options.headers = { ...options.headers, 'Authorization': 'Bearer ' + token };
    }
    return fetch(url, options);
}

function showToast(message) {
    const toast = document.getElementById('toast');
    if(!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

document.addEventListener('DOMContentLoaded', async () => {
    checkAuth();
    // Ganti logo navbar ke logo Pizza Azura saat halaman pengaturan dibuka
    try {
        const adminLogo = document.querySelector('.admin-logo');
        if (adminLogo) {
            adminLogo.innerHTML = '<img src="/images/logo.png" alt="Pizza Azura" class="logo-img-admin">';
        }
    } catch(e) { /* ignore if DOM not ready */ }
    
    try {
        const res = await apiFetch('/api/settings');
        if (!res.ok) throw new Error();
        const s = await res.json();
        console.log('Settings loaded:', s);
        
        document.getElementById('set_slogan').value = s.slogan || '';
        document.getElementById('set_wa_link').value = s.wa_link || '';
        document.getElementById('set_fb_link').value = s.fb_link || '';
        document.getElementById('set_ig_link').value = s.ig_link || 'https://www.instagram.com/pizzaazzura?igsh=MW9zcmtnNDAwdzlheQ==';
        document.getElementById('set_tt_link').value = s.tt_link || 'https://vt.tiktok.com/ZS9v7FKmt/';
        document.getElementById('set_op_weekday').value = s.op_weekday || '';
        document.getElementById('set_op_weekend').value = s.op_weekend || '';
        document.getElementById('set_op_holiday').value = s.op_holiday || '';
        document.getElementById('set_contact_address').value = s.contact_address || '';
        document.getElementById('set_contact_phone').value = s.contact_phone || '';
        document.getElementById('set_contact_email').value = s.contact_email || '';
        document.getElementById('set_about_content').value = s.about_content || '';
        document.getElementById('set_store_lat').value = s.store_lat || '-6.2146';
        document.getElementById('set_store_lng').value = s.store_lng || '106.8215';
        document.getElementById('set_store_name').value = s.store_name || 'Pizza Azura Jakarta';
        document.getElementById('set_store_address').value = s.store_address || 'Jl. Sudirman No. 123, Jakarta Selatan';
        document.getElementById('set_store_maps_link').value = s.store_maps_link || 'https://maps.app.goo.gl/tVq8NLXusB9Wgr4g8';

        document.getElementById('loadingSettings').style.display = 'none';
        document.getElementById('settingsContainer').style.display = 'grid';

    } catch(e) {         console.error('Error loading settings:', e);        document.getElementById('loadingSettings').innerHTML = '<span style="color:var(--danger)">Gagal memuat pengaturan.</span>';
    }
});

async function saveAllSettings() {
    const payload = {
        slogan: document.getElementById('set_slogan').value,
        wa_link: document.getElementById('set_wa_link').value,
        fb_link: document.getElementById('set_fb_link').value,
        ig_link: document.getElementById('set_ig_link').value,
        tt_link: document.getElementById('set_tt_link').value,
        op_weekday: document.getElementById('set_op_weekday').value,
        op_weekend: document.getElementById('set_op_weekend').value,
        op_holiday: document.getElementById('set_op_holiday').value,
        contact_address: document.getElementById('set_contact_address').value,
        contact_phone: document.getElementById('set_contact_phone').value,
        contact_email: document.getElementById('set_contact_email').value,
        about_content: document.getElementById('set_about_content').value,
        store_lat: document.getElementById('set_store_lat').value.trim(),
        store_lng: document.getElementById('set_store_lng').value.trim(),
        store_name: document.getElementById('set_store_name').value.trim(),
        store_address: document.getElementById('set_store_address').value.trim(),
        store_maps_link: document.getElementById('set_store_maps_link').value.trim()
    };

    // Simple URL validation: allow empty or starting with http/https
    const isValidUrl = (u) => !u || /^https?:\/\//i.test(u);
    if (!isValidUrl(payload.fb_link) || !isValidUrl(payload.ig_link) || !isValidUrl(payload.tt_link)) {
        showToast('❌ Salah satu URL sosial tidak valid. Gunakan http(s)://');
        return;
    }

    const saveBtn = document.getElementById('saveBtn');
    saveBtn.disabled = true;
    saveBtn.textContent = '⏳ Menyimpan...';

    try {
        const res = await apiFetch('/api/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (res.ok) {
            showToast('✅ Semua pengaturan disimpan');
            setTimeout(() => {
                window.location.href = '/admin';
            }, 1000);
        } else {
            showToast('❌ Gagal menyimpan');
            saveBtn.disabled = false;
            saveBtn.textContent = '💾 Simpan Semua Pengaturan';
        }
    } catch(e) {
        showToast('❌ Kesalahan server');
        saveBtn.disabled = false;
        saveBtn.textContent = '💾 Simpan Semua Pengaturan';
    }
}
