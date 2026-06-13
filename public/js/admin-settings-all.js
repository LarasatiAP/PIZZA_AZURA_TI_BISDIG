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
            adminLogo.innerHTML = '<img src="/images/logo.webp" alt="Pizza Azura" class="logo-img-admin">';
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
        
        // Strip day prefixes for simpler edit fields
        document.getElementById('set_op_weekday').value = stripPrefix(s.op_weekday, 'Senin - Jumat:');
        document.getElementById('set_op_weekend').value = stripPrefix(s.op_weekend, 'Sabtu - Minggu:');
        document.getElementById('set_op_holiday').value = stripPrefix(s.op_holiday, 'Libur Nasional:');
        
        document.getElementById('set_contact_address').value = s.contact_address || '';
        document.getElementById('set_contact_phone').value = s.contact_phone || '';
        document.getElementById('set_contact_email').value = s.contact_email || '';
        document.getElementById('set_about_content').value = s.about_content || '';
        document.getElementById('set_store_lat').value = s.store_lat || '-6.2146';
        document.getElementById('set_store_lng').value = s.store_lng || '106.8215';
        document.getElementById('set_store_name').value = s.store_name || 'Pizza Azura Jakarta';
        document.getElementById('set_store_address').value = s.store_address || 'Jl. Sudirman No. 123, Jakarta Selatan';
        document.getElementById('set_store_maps_link').value = s.store_maps_link || 'https://maps.app.goo.gl/tVq8NLXusB9Wgr4g8';
        document.getElementById('set_fonnte_token').value = s.fonnte_token || '';
        document.getElementById('set_admin_wa').value = s.admin_wa || '6285198042502';

        document.getElementById('loadingSettings').style.display = 'none';
        document.getElementById('settingsContainer').style.display = 'grid';
        
        // Initialize settings map
        initSettingsMap(s.store_lat || -6.2146, s.store_lng || 106.8215);

    } catch(e) {         console.error('Error loading settings:', e);        document.getElementById('loadingSettings').innerHTML = '<span style="color:var(--danger)">Gagal memuat pengaturan.</span>';
    }
});

async function saveAllSettings() {
    const saveBtn = document.getElementById('saveBtn');
    
    try {
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
            store_maps_link: document.getElementById('set_store_maps_link').value.trim(),
            fonnte_token: document.getElementById('set_fonnte_token').value.trim(),
            admin_wa: document.getElementById('set_admin_wa').value.trim()
        };

        // Simple URL validation: allow empty or starting with http/https
        const isValidUrl = (u) => !u || /^https?:\/\//i.test(u);
        if (!isValidUrl(payload.fb_link) || !isValidUrl(payload.ig_link) || !isValidUrl(payload.tt_link)) {
            showToast('Salah satu URL sosial tidak valid. Gunakan http(s)://');
            return;
        }

        saveBtn.disabled = true;
        saveBtn.textContent = 'Menyimpan...';

        const res = await apiFetch('/api/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (res.ok) {
            showToast('Semua pengaturan disimpan');
            setTimeout(() => {
                window.location.href = '/admin';
            }, 1000);
            return; // Don't reset button since we're navigating away
        } else {
            const errData = await res.json().catch(() => ({}));
            showToast(errData.error || 'Gagal menyimpan (HTTP ' + res.status + ')');
        }
    } catch(e) {
        console.error('saveAllSettings error:', e);
        showToast('Kesalahan: ' + (e.message || 'Koneksi server gagal'));
    } finally {
        // Always reset button unless we already navigated away
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Simpan Semua Pengaturan';
        }
    }
}

const stripPrefix = (val, prefix) => {
    if (!val) return '';
    if (val.startsWith(prefix)) {
        return val.substring(prefix.length).trim();
    }
    return val;
};

let settingsMap = null;
let settingsMarker = null;

function initSettingsMap(lat, lng) {
    lat = parseFloat(lat);
    lng = parseFloat(lng);
    
    if (typeof L === 'undefined') {
        setTimeout(() => initSettingsMap(lat, lng), 100);
        return;
    }
    
    const mapContainer = document.getElementById('settingsMap');
    if (!mapContainer) return;
    
    if (settingsMap) {
        settingsMap.setView([lat, lng], 14);
        if (settingsMarker) {
            settingsMarker.setLatLng([lat, lng]);
        }
        settingsMap.invalidateSize();
        return;
    }
    
    settingsMap = L.map('settingsMap', {
        center: [lat, lng],
        zoom: 14,
        zoomControl: true,
        scrollWheelZoom: false
    });
    
    L.tileLayer('http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}', {
        attribution: 'Google Maps Hybrid'
    }).addTo(settingsMap);
    
    const storeIcon = L.divIcon({
        html: `<div style="position:relative; width:40px; height:40px; display:flex; align-items:center; justify-content:center;">
                 <div style="position:absolute; width:100%; height:100%; background:rgba(255,107,53,0.5); border-radius:50%; animation:pulseMap 2s infinite;"></div>
                 <div style="background:var(--accent); width:20px; height:20px; border-radius:50%; border:3px solid white; box-shadow:0 0 15px rgba(0,0,0,0.8); z-index:2;"></div>
               </div>
               <style>@keyframes pulseMap{0%{transform:scale(0.8);opacity:1;}100%{transform:scale(2.5);opacity:0;}}</style>`,
        className: 'custom-settings-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });
    
    settingsMarker = L.marker([lat, lng], {
        icon: storeIcon,
        draggable: true
    }).addTo(settingsMap);
    
    const updateCoords = (newLat, newLng) => {
        document.getElementById('set_store_lat').value = newLat.toFixed(6);
        document.getElementById('set_store_lng').value = newLng.toFixed(6);
    };
    
    settingsMarker.on('dragend', function(e) {
        const position = settingsMarker.getLatLng();
        updateCoords(position.lat, position.lng);
    });
    
    settingsMap.on('click', function(e) {
        settingsMarker.setLatLng(e.latlng);
        updateCoords(e.latlng.lat, e.latlng.lng);
    });
    
    setTimeout(() => {
        settingsMap.invalidateSize();
    }, 200);
}
