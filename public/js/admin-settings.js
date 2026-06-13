/**
 * Logic for admin settings pages
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

const urlParams = new URLSearchParams(window.location.search);
const type = urlParams.get('type');
let currentSettings = {};

document.addEventListener('DOMContentLoaded', async () => {
    checkAuth();
    // Ganti logo navbar ke logo Pizza Azura saat halaman pengaturan dibuka
    try {
        const adminLogo = document.querySelector('.admin-logo');
        if (adminLogo) {
            adminLogo.innerHTML = '<img src="/images/logo.webp" alt="Pizza Azura" class="logo-img-admin">';
        }
    } catch(e) { /* ignore if DOM not ready */ }

    if (!type) return; // If on menu page, do nothing more

    const formTitle = document.getElementById('formTitle');
    const dynamicForm = document.getElementById('dynamicForm');
    const saveBtn = document.getElementById('saveBtn');

    try {
        const res = await apiFetch('/api/settings');
        if (!res.ok) throw new Error();
        currentSettings = await res.json();
    } catch(e) {
        dynamicForm.innerHTML = '<div style="color:var(--danger)">Gagal memuat pengaturan.</div>';
        return;
    }

    let html = '';
    
    if (type === 'slogan') {
        formTitle.textContent = 'Edit Slogan Footer';
        html = `
            <div class="form-group" style="margin-bottom:15px;">
                <label style="display:block;margin-bottom:5px;font-size:13px;color:var(--text-secondary);">Slogan Footer</label>
                <textarea id="set_slogan" style="width:100%;padding:10px;background:var(--bg-primary);border:1px solid var(--border);color:var(--text-primary);border-radius:8px;font-family:inherit;resize:vertical;" rows="4">${currentSettings.slogan || ''}</textarea>
            </div>`;
    } else if (type === 'walink') {
        formTitle.textContent = 'Edit Link WhatsApp';
        html = `
            <div class="form-group" style="margin-bottom:15px;">
                <label style="display:block;margin-bottom:5px;font-size:13px;color:var(--text-secondary);">Link WhatsApp (Banner Atas)</label>
                <input type="text" id="set_wa_link" value="${currentSettings.wa_link || ''}" style="width:100%;padding:10px;background:var(--bg-primary);border:1px solid var(--border);color:var(--text-primary);border-radius:8px;font-family:inherit;">
            </div>`;
    } else if (type === 'sosmed') {
        formTitle.textContent = 'Edit Media Sosial';
        html = `
            <div style="display:grid;grid-template-columns:1fr;gap:15px;margin-bottom:15px;">
                <div>
                    <label style="display:block;margin-bottom:5px;font-size:12px;color:var(--text-secondary);">Link Facebook</label>
                    <input type="text" id="set_fb_link" value="${currentSettings.fb_link || ''}" style="width:100%;padding:10px;background:var(--bg-primary);border:1px solid var(--border);color:var(--text-primary);border-radius:8px;font-family:inherit;">
                </div>
                <div>
                    <label style="display:block;margin-bottom:5px;font-size:12px;color:var(--text-secondary);">Link Instagram</label>
                    <input type="text" id="set_ig_link" value="${currentSettings.ig_link || ''}" style="width:100%;padding:10px;background:var(--bg-primary);border:1px solid var(--border);color:var(--text-primary);border-radius:8px;font-family:inherit;">
                </div>
                <div>
                    <label style="display:block;margin-bottom:5px;font-size:12px;color:var(--text-secondary);">Link TikTok</label>
                    <input type="text" id="set_tt_link" value="${currentSettings.tt_link || ''}" style="width:100%;padding:10px;background:var(--bg-primary);border:1px solid var(--border);color:var(--text-primary);border-radius:8px;font-family:inherit;">
                </div>
            </div>`;
    } else if (type === 'jam') {
        formTitle.textContent = 'Edit Jam Operasional';
        html = `
            <div style="display:grid;grid-template-columns:1fr;gap:15px;margin-bottom:15px;">
                <div>
                    <label style="display:block;margin-bottom:5px;font-size:12px;color:var(--text-secondary);">Senin - Jumat</label>
                    <input type="text" id="set_op_weekday" value="${stripPrefix(currentSettings.op_weekday, 'Senin - Jumat:')}" placeholder="contoh: 10.00 - 22.00" style="width:100%;padding:10px;background:var(--bg-primary);border:1px solid var(--border);color:var(--text-primary);border-radius:8px;font-family:inherit;">
                </div>
                <div>
                    <label style="display:block;margin-bottom:5px;font-size:12px;color:var(--text-secondary);">Sabtu - Minggu</label>
                    <input type="text" id="set_op_weekend" value="${stripPrefix(currentSettings.op_weekend, 'Sabtu - Minggu:')}" placeholder="contoh: 11.00 - 23.00" style="width:100%;padding:10px;background:var(--bg-primary);border:1px solid var(--border);color:var(--text-primary);border-radius:8px;font-family:inherit;">
                </div>
                <div>
                    <label style="display:block;margin-bottom:5px;font-size:12px;color:var(--text-secondary);">Libur Nasional</label>
                    <input type="text" id="set_op_holiday" value="${stripPrefix(currentSettings.op_holiday, 'Libur Nasional:')}" placeholder="contoh: Buka" style="width:100%;padding:10px;background:var(--bg-primary);border:1px solid var(--border);color:var(--text-primary);border-radius:8px;font-family:inherit;">
                </div>
            </div>`;
    } else if (type === 'kontak') {
        formTitle.textContent = 'Edit Kontak & Alamat';
        html = `
            <div style="display:grid;grid-template-columns:1fr;gap:15px;margin-bottom:15px;">
                <div>
                    <label style="display:block;margin-bottom:5px;font-size:12px;color:var(--text-secondary);">Alamat (Footer)</label>
                    <input type="text" id="set_contact_address" value="${currentSettings.contact_address || ''}" placeholder="Alamat lengkap" style="width:100%;padding:10px;background:var(--bg-primary);border:1px solid var(--border);color:var(--text-primary);border-radius:8px;font-family:inherit;">
                </div>
                <div>
                    <label style="display:block;margin-bottom:5px;font-size:12px;color:var(--text-secondary);">Nomor Telepon</label>
                    <input type="text" id="set_contact_phone" value="${currentSettings.contact_phone || ''}" placeholder="+62 8..." style="width:100%;padding:10px;background:var(--bg-primary);border:1px solid var(--border);color:var(--text-primary);border-radius:8px;font-family:inherit;">
                </div>
                <div>
                    <label style="display:block;margin-bottom:5px;font-size:12px;color:var(--text-secondary);">Email</label>
                    <input type="text" id="set_contact_email" value="${currentSettings.contact_email || ''}" placeholder="hello@pizzaazura.com" style="width:100%;padding:10px;background:var(--bg-primary);border:1px solid var(--border);color:var(--text-primary);border-radius:8px;font-family:inherit;">
                </div>
            </div>`;
    } else {
        html = '<div style="color:var(--danger)">Kategori tidak ditemukan.</div>';
    }

    dynamicForm.innerHTML = html;
    if (html.includes('<input') || html.includes('<textarea')) {
        saveBtn.style.display = 'block';
    }
});

async function saveSettings() {
    const payload = {};
    
    // Only update fields that are present on the current form screen
    const getVal = id => {
        const el = document.getElementById(id);
        return el ? el.value : null;
    };

    if (type === 'slogan') payload.slogan = getVal('set_slogan');
    if (type === 'walink') payload.wa_link = getVal('set_wa_link');
    if (type === 'sosmed') {
        payload.fb_link = getVal('set_fb_link');
        payload.ig_link = getVal('set_ig_link');
        payload.tt_link = getVal('set_tt_link');
    }
    if (type === 'jam') {
        payload.op_weekday = getVal('set_op_weekday');
        payload.op_weekend = getVal('set_op_weekend');
        payload.op_holiday = getVal('set_op_holiday');
    }
    if (type === 'kontak') {
        payload.contact_address = getVal('set_contact_address');
        payload.contact_phone = getVal('set_contact_phone');
        payload.contact_email = getVal('set_contact_email');
    }

    const saveBtn = document.getElementById('saveBtn');
    // Simple URL validation for social fields when present (allow empty, #, or http/https)
    const isValidUrl = (u) => !u || u === '#' || /^https?:\/\//i.test(u);
    if (payload.fb_link !== undefined && !isValidUrl(payload.fb_link)) { showToast('❌ URL Facebook tidak valid'); return; }
    if (payload.ig_link !== undefined && !isValidUrl(payload.ig_link)) { showToast('❌ URL Instagram tidak valid'); return; }
    if (payload.tt_link !== undefined && !isValidUrl(payload.tt_link)) { showToast('❌ URL TikTok tidak valid'); return; }

    saveBtn.disabled = true;
    saveBtn.textContent = '⏳ Menyimpan...';

    try {
        const res = await apiFetch('/api/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (res.ok) {
            showToast('✅ Pengaturan disimpan');
            setTimeout(() => {
                window.location.href = '/admin';
            }, 1000);
        } else {
            showToast('❌ Gagal menyimpan');
            saveBtn.disabled = false;
            saveBtn.textContent = '💾 Simpan Pengaturan';
        }
    } catch(e) {
        showToast('❌ Kesalahan server');
        saveBtn.disabled = false;
        saveBtn.textContent = '💾 Simpan Pengaturan';
    }
}

const stripPrefix = (val, prefix) => {
    if (!val) return '';
    if (val.startsWith(prefix)) {
        return val.substring(prefix.length).trim();
    }
    return val;
};

