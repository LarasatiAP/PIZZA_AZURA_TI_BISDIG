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
    
    try {
        const res = await apiFetch('/api/settings');
        if (!res.ok) throw new Error();
        const s = await res.json();
        
        document.getElementById('set_slogan').value = s.slogan || '';
        document.getElementById('set_wa_link').value = s.wa_link || '';
        document.getElementById('set_ig_link').value = s.ig_link || '';
        document.getElementById('set_fb_link').value = s.fb_link || '';
        document.getElementById('set_tw_link').value = s.tw_link || '';
        document.getElementById('set_op_weekday').value = s.op_weekday || '';
        document.getElementById('set_op_weekend').value = s.op_weekend || '';
        document.getElementById('set_op_holiday').value = s.op_holiday || '';
        document.getElementById('set_contact_address').value = s.contact_address || '';
        document.getElementById('set_contact_phone').value = s.contact_phone || '';
        document.getElementById('set_contact_email').value = s.contact_email || '';

        document.getElementById('loadingSettings').style.display = 'none';
        document.getElementById('settingsContainer').style.display = 'grid';

    } catch(e) {
        document.getElementById('loadingSettings').innerHTML = '<span style="color:var(--danger)">Gagal memuat pengaturan.</span>';
    }
});

async function saveAllSettings() {
    const payload = {
        slogan: document.getElementById('set_slogan').value,
        wa_link: document.getElementById('set_wa_link').value,
        ig_link: document.getElementById('set_ig_link').value,
        fb_link: document.getElementById('set_fb_link').value,
        tw_link: document.getElementById('set_tw_link').value,
        op_weekday: document.getElementById('set_op_weekday').value,
        op_weekend: document.getElementById('set_op_weekend').value,
        op_holiday: document.getElementById('set_op_holiday').value,
        contact_address: document.getElementById('set_contact_address').value,
        contact_phone: document.getElementById('set_contact_phone').value,
        contact_email: document.getElementById('set_contact_email').value
    };

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
