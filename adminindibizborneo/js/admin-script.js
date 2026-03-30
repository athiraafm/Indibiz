/* ==================================================
   ADMIN DASHBOARD – admin-script.js
   Auth | Navigation | Data Management | Export
   Connected to Supabase (PostgreSQL Cloud)
================================================== */

/* ============================================================
   SUPABASE CONFIG
============================================================ */
const SUPABASE_URL = 'https://swqrvjtpnapvdgtxgrci.supabase.co';
const SUPABASE_KEY = 'sb_publishable_hF0op8sFap54NyZrduW8qg_DMvXo-h8';
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ============================================================
   HELPERS
============================================================ */
function formatRp(num) {
    return new Intl.NumberFormat('id-ID').format(num);
}

function censorName(name) {
    const parts = (name || '').split(' ');
    return parts.map((part) => {
        if (part.endsWith('.') || part.length <= 2) return part;
        return part.charAt(0) + '***';
    }).join(' ');
}

function getMultiplierLabel(tgl) {
    if (!tgl || tgl <= 0) return '-';
    if (tgl >= 1 && tgl <= 10) return 'x3';
    if (tgl >= 11 && tgl <= 15) return 'x2';
    if (tgl >= 16 && tgl <= 20) return 'x1';
    return 'x0';
}

function calcPoin(tagihan, bayar, tanggalBayar) {
    if (!bayar) return 0;
    const base = Math.floor(tagihan / 100000);
    if (tanggalBayar >= 1 && tanggalBayar <= 10) return base * 3;
    if (tanggalBayar >= 11 && tanggalBayar <= 15) return base * 2;
    if (tanggalBayar >= 16 && tanggalBayar <= 20) return base * 1;
    return 0;
}

function addLog(type, action, detail) {
    const logs = JSON.parse(localStorage.getItem('adminLogs') || '[]');
    logs.unshift({ time: new Date().toLocaleString('id-ID'), type, action, detail });
    if (logs.length > 200) logs.length = 200;
    localStorage.setItem('adminLogs', JSON.stringify(logs));
}

/* ============================================================
   NAVIGATION
============================================================ */
const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
const pageSections = document.querySelectorAll('.page-section');
const pageTitle = document.getElementById('pageTitle');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

const SECTION_TITLES = {
    'overview': 'Overview',
    'pelanggan': 'Data Pelanggan',
    'pengaturan': 'Pengaturan'
};

function navigateTo(sectionId) {
    sidebarLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.section === sectionId);
    });
    pageSections.forEach(sec => {
        sec.classList.toggle('active', sec.id === `sec-${sectionId}`);
    });
    pageTitle.textContent = SECTION_TITLES[sectionId] || 'Dashboard';
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('show');
    refreshSection(sectionId);
}

sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(link.dataset.section);
    });
});

document.getElementById('menuToggle').addEventListener('click', () => {
    sidebar.classList.toggle('open');
    sidebarOverlay.classList.toggle('show');
});

sidebarOverlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('show');
});

document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    addLog('login', 'Logout', 'Admin logout dari dashboard.');
    sessionStorage.removeItem('adminLoggedIn');
    window.location.href = 'index.html';
});

/* ============================================================
   SECTION REFRESH
============================================================ */
function refreshSection(sectionId) {
    switch (sectionId) {
        case 'overview': fetchOverview(); break;
        case 'pelanggan': fetchCustomerTable(); break;
        case 'pengaturan': renderSettings(); break;
    }
}

/* ============================================================
   OVERVIEW – Fetch from Supabase
============================================================ */
async function fetchOverview() {
    try {
        // Total pelanggan
        const { count: totalPelanggan } = await db
            .from('data_pelanggan')
            .select('*', { count: 'exact', head: true });

        // Total poin & kupon
        const { data: poinData } = await db
            .from('poin_dan_kupon')
            .select('total_poin, total_kupon');

        let totalPoin = 0;
        let totalKupon = 0;
        if (poinData) {
            poinData.forEach(row => {
                totalPoin += row.total_poin || 0;
                totalKupon += row.total_kupon || 0;
            });
        }

        document.getElementById('statCustomers').textContent = (totalPelanggan || 0).toLocaleString('id-ID');
        document.getElementById('statPoints').textContent = totalPoin.toLocaleString('id-ID');
        document.getElementById('statCoupons').textContent = totalKupon.toLocaleString('id-ID');
    } catch (err) {
        console.error('Gagal memuat overview:', err);
        showToast('error', 'Gagal memuat data overview.');
    }
}

/* ============================================================
   DATA PELANGGAN TABLE – Fetch from Supabase
============================================================ */
let currentSearchFilter = '';
let currentCityFilter = 'all';
let currentSortField = 'poin';
let currentSortDir = 'desc';
let cachedCustomers = [];

async function fetchCustomerTable() {
    try {
        // Ambil semua pelanggan
        let query = db.from('data_pelanggan').select('*');

        if (currentSearchFilter) {
            const q = `%${currentSearchFilter}%`;
            query = query.or(`nama_pelanggan.ilike.${q},no_internet.ilike.${q},kota.ilike.${q}`);
        }

        if (currentCityFilter !== 'all') {
            query = query.eq('kota', currentCityFilter);
        }

        const { data: pelanggan, error } = await query;
        if (error) throw error;

        // Ambil semua poin
        const { data: poinData } = await db.from('poin_dan_kupon').select('no_internet, total_poin, total_kupon');
        const poinMap = {};
        if (poinData) {
            poinData.forEach(p => {
                if (!poinMap[p.no_internet]) {
                    poinMap[p.no_internet] = { total_poin: 0, total_kupon: 0 };
                }
                poinMap[p.no_internet].total_poin += p.total_poin || 0;
                poinMap[p.no_internet].total_kupon += p.total_kupon || 0;
            });
        }

        // Gabungkan data
        cachedCustomers = (pelanggan || []).map(c => ({
            ...c,
            total_poin: poinMap[c.no_internet]?.total_poin || 0,
            total_kupon: poinMap[c.no_internet]?.total_kupon || 0
        }));

        renderCustomerTable(cachedCustomers);
    } catch (err) {
        console.error('Gagal memuat data pelanggan:', err);
        showToast('error', 'Gagal memuat data pelanggan dari Supabase.');
    }
}

function renderCustomerTable(customers) {
    const tbody = document.getElementById('customerTableBody');
    if (!tbody) return;

    let sorted = [...customers];

    if (currentSortField === 'poin') {
        sorted.sort((a, b) => currentSortDir === 'desc' ? (b.total_poin || 0) - (a.total_poin || 0) : (a.total_poin || 0) - (b.total_poin || 0));
    } else if (currentSortField === 'nama') {
        sorted.sort((a, b) => currentSortDir === 'asc' ? (a.nama_pelanggan || '').localeCompare(b.nama_pelanggan || '') : (b.nama_pelanggan || '').localeCompare(a.nama_pelanggan || ''));
    } else if (currentSortField === 'kota') {
        sorted.sort((a, b) => currentSortDir === 'asc' ? (a.kota || '').localeCompare(b.kota || '') : (b.kota || '').localeCompare(a.kota || ''));
    } else if (currentSortField === 'kupon') {
        sorted.sort((a, b) => currentSortDir === 'desc' ? (b.total_kupon || 0) - (a.total_kupon || 0) : (a.total_kupon || 0) - (b.total_kupon || 0));
    }

    if (sorted.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 30px; color: var(--text-muted);">
            <i class="fas fa-inbox" style="font-size:2rem; display:block; margin-bottom:8px;"></i>
            Tidak ada data pelanggan ditemukan.</td></tr>`;
        return;
    }

    tbody.innerHTML = sorted.map((c, idx) => {
        const poin = c.total_poin || 0;
        const kupon = c.total_kupon || 0;
        return `
        <tr>
            <td>${idx + 1}</td>
            <td><strong>${c.nama_pelanggan || '-'}</strong></td>
            <td style="color: var(--text-secondary);">${c.no_internet || '-'}</td>
            <td>${c.kota || '-'}</td>
            <td style="color: var(--accent-yellow); font-weight: 700;">${poin.toLocaleString('id-ID')}</td>
            <td><span class="badge badge-info">${kupon}</span></td>
            <td>
                <button class="btn btn-outline btn-sm" onclick="showDetail('${c.no_internet}')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>`;
    }).join('');
}

const customerSearch = document.getElementById('customerSearch');
if (customerSearch) {
    let searchTimeout;
    customerSearch.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        currentSearchFilter = e.target.value.trim();
        searchTimeout = setTimeout(() => fetchCustomerTable(), 300);
    });
}

const customerCityFilter = document.getElementById('customerCityFilter');
if (customerCityFilter) {
    customerCityFilter.addEventListener('change', (e) => {
        currentCityFilter = e.target.value;
        fetchCustomerTable();
    });
}

function sortCustomerTable(field) {
    if (currentSortField === field) {
        currentSortDir = currentSortDir === 'desc' ? 'asc' : 'desc';
    } else {
        currentSortField = field;
        currentSortDir = (field === 'nama' || field === 'kota') ? 'asc' : 'desc';
    }
    renderCustomerTable(cachedCustomers);
}

/* ============================================================
   DETAIL PELANGGAN MODAL – Fetch from Supabase
============================================================ */
async function showDetail(no) {
    try {
        // Ambil data pelanggan
        const { data: pelanggan, error: errP } = await db
            .from('data_pelanggan')
            .select('*')
            .eq('no_internet', no)
            .single();

        if (errP || !pelanggan) {
            showToast('error', 'Pelanggan tidak ditemukan.');
            return;
        }

        // Ambil histori pembayaran
        const { data: pembayaran } = await db
            .from('informasi_pembayaran')
            .select('*')
            .eq('no_internet', no)
            .order('periode_tagihan');

        // Ambil poin
        const { data: poinData } = await db
            .from('poin_dan_kupon')
            .select('*')
            .eq('no_internet', no);

        document.getElementById('detailModalTitle').textContent = `Detail: ${pelanggan.nama_pelanggan}`;
        document.getElementById('detailName').textContent = pelanggan.nama_pelanggan;
        document.getElementById('detailNo').textContent = pelanggan.no_internet;
        document.getElementById('detailCity').textContent = pelanggan.kota || '-';
        document.getElementById('detailPackage').textContent = pelanggan.paket || '-';

        const tbody = document.getElementById('detailPointsBody');
        let totalPoin = 0;
        tbody.innerHTML = '';

        (pembayaran || []).forEach((pay) => {
            const tglBayar = pay.tanggal_bayar ? new Date(pay.tanggal_bayar).getDate() : 0;
            const tagihan = pelanggan.nominal_tagihan || 0;
            const isLunas = pay.status_lunas;
            const poin = calcPoin(tagihan, isLunas, tglBayar);
            totalPoin += poin;

            const badgeClass = isLunas ? 'badge-success' : 'badge-danger';
            const badgeText = isLunas ? 'Lunas' : 'Belum Bayar';
            const poinColor = poin > 0 ? 'var(--accent-yellow)' : 'var(--accent-red)';
            const base = Math.floor(tagihan / 100000);
            const mult = getMultiplierLabel(tglBayar);
            const tglFormatted = pay.tanggal_bayar ? new Date(pay.tanggal_bayar).toLocaleDateString('id-ID') : '-';

            tbody.innerHTML += `
            <tr>
                <td>${pay.periode_tagihan || '-'}</td>
                <td>Rp ${formatRp(tagihan)}</td>
                <td><span class="badge ${badgeClass}">${badgeText}</span></td>
                <td style="color: var(--text-secondary);">${tglFormatted}</td>
                <td style="color: var(--text-secondary);">${isLunas ? base + ' ' + mult : '-'}</td>
                <td style="font-weight: 700; color: ${poinColor};">${poin > 0 ? '+' : ''}${poin}</td>
            </tr>`;
        });

        const totalKupon = poinData && poinData.length > 0 ? (poinData[0].total_kupon || 0) : Math.floor(totalPoin / 3);
        const displayPoin = poinData && poinData.length > 0 ? (poinData[0].total_poin || totalPoin) : totalPoin;
        document.getElementById('detailTotalPoin').textContent = `${displayPoin.toLocaleString('id-ID')} Poin (${totalKupon} Kupon)`;

        openModal('detailModal');
    } catch (err) {
        console.error('Gagal memuat detail:', err);
        showToast('error', 'Gagal memuat detail pelanggan.');
    }
}

/* ============================================================
   EXPORT TO EXCEL
============================================================ */
function exportToExcel(type) {
    const customers = cachedCustomers;
    let data = [];
    let filename = '';

    if (type === 'full') {
        data = customers.map((c, idx) => ({
            'No': idx + 1,
            'Nama Customer': c.nama_pelanggan,
            'No Internet': c.no_internet,
            'Kota': c.kota,
            'Witel': c.witel || '',
            'Paket': c.paket || '',
            'Total Poin': c.total_poin || 0,
            'Total Kupon': c.total_kupon || 0
        }));
        filename = `Laporan_Pelanggan_IndiBiz_${new Date().toISOString().split('T')[0]}.xlsx`;
    } else if (type === 'ranking') {
        const sorted = [...customers].sort((a, b) => (b.total_poin || 0) - (a.total_poin || 0));
        data = sorted.map((c, idx) => ({
            'Rank': idx + 1,
            'Nama Customer': c.nama_pelanggan,
            'Nama Sensor': censorName(c.nama_pelanggan || ''),
            'No Internet': c.no_internet,
            'Kota': c.kota,
            'Total Poin': c.total_poin || 0,
            'Total Kupon': c.total_kupon || 0
        }));
        filename = `Top_Customer_IndiBiz_${new Date().toISOString().split('T')[0]}.xlsx`;
    }

    if (data.length === 0) {
        showToast('error', 'Tidak ada data untuk di-export.');
        return;
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, filename);

    addLog('export', `Export ${type === 'full' ? 'Data Pelanggan' : 'Top Customer'}`,
        `Berhasil meng-export ${data.length} baris data ke file ${filename}`);
    showToast('success', `File "${filename}" berhasil diunduh!`);
}

/* ============================================================
   SETTINGS
============================================================ */
function renderSettings() {
    renderPeriodList();
}

/* ============================================================
   SETTINGS – CHANGE PASSWORD
============================================================ */
function changePassword() {
    const currentPass = document.getElementById('currentPassword').value;
    const newPass = document.getElementById('newPassword').value;
    const confirmPass = document.getElementById('confirmPassword').value;

    if (!currentPass || !newPass || !confirmPass) {
        showToast('error', 'Semua field password wajib diisi.');
        return;
    }

    const savedCreds = JSON.parse(localStorage.getItem('adminCredentials') || 'null');
    const actualPassword = savedCreds ? savedCreds.password : 'admin123';

    if (currentPass !== actualPassword) {
        showToast('error', 'Password lama tidak sesuai.');
        return;
    }

    if (newPass.length < 6) {
        showToast('error', 'Password baru minimal 6 karakter.');
        return;
    }

    if (newPass !== confirmPass) {
        showToast('error', 'Konfirmasi password tidak cocok.');
        return;
    }

    const username = savedCreds ? savedCreds.username : 'admin';
    localStorage.setItem('adminCredentials', JSON.stringify({ username, password: newPass }));

    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';

    addLog('edit', 'Ganti Password', 'Admin berhasil mengubah password.');
    showToast('success', 'Password berhasil diubah!');
}

/* ============================================================
   SETTINGS – PERIOD MANAGEMENT
============================================================ */
function loadPeriods() {
    const stored = localStorage.getItem('adminPeriods');
    if (stored) return JSON.parse(stored);
    const defaults = [
        { name: 'Periode April – Juni 2025', start: '2025-04-01', end: '2025-06-30', active: true }
    ];
    localStorage.setItem('adminPeriods', JSON.stringify(defaults));
    return defaults;
}

function savePeriods(data) {
    localStorage.setItem('adminPeriods', JSON.stringify(data));
}

function renderPeriodList() {
    const container = document.getElementById('periodList');
    if (!container) return;

    const periods = loadPeriods();
    container.innerHTML = periods.map((p) => `
        <div class="period-card">
            <div class="period-info">
                <div class="period-dot ${p.active ? '' : 'archived'}"></div>
                <div>
                    <div class="period-name">${p.name}</div>
                    <div class="period-date">${p.start} s/d ${p.end}</div>
                </div>
            </div>
            <div>
                ${p.active
            ? `<span class="badge badge-success"><i class="fas fa-circle" style="font-size:0.5rem;"></i> Aktif</span>`
            : `<span class="badge badge-warning"><i class="fas fa-archive" style="font-size:0.5rem;"></i> Diarsipkan</span>`
        }
            </div>
        </div>
    `).join('');
}

function openNewPeriodModal() {
    document.getElementById('newPeriodName').value = '';
    document.getElementById('newPeriodStart').value = '';
    document.getElementById('newPeriodEnd').value = '';
    openModal('periodModal');
}

function createNewPeriod() {
    const name = document.getElementById('newPeriodName').value.trim();
    const start = document.getElementById('newPeriodStart').value;
    const end = document.getElementById('newPeriodEnd').value;

    if (!name || !start || !end) {
        showToast('error', 'Semua field wajib diisi.');
        return;
    }

    const periods = loadPeriods();
    periods.forEach(p => p.active = false);
    periods.unshift({ name, start, end, active: true });
    savePeriods(periods);

    addLog('period', 'Buat Periode Baru',
        `Periode "${name}" (${start} s/d ${end}) berhasil dibuat. Periode sebelumnya telah diarsipkan.`);

    closeModal('periodModal');
    showToast('success', `Periode "${name}" berhasil dibuat!`);
    renderPeriodList();
}

/* ============================================================
   MODALS
============================================================ */
function openModal(id) {
    document.getElementById(id).classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeModal(id) {
    document.getElementById(id).classList.remove('show');
    document.body.style.overflow = '';
}

document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('show');
            document.body.style.overflow = '';
        }
    });
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.show').forEach(m => {
            m.classList.remove('show');
        });
        document.body.style.overflow = '';
    }
});

/* ============================================================
   TOAST NOTIFICATIONS
============================================================ */
function showToast(type, message) {
    const container = document.getElementById('toastContainer');
    const iconMap = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        info: 'fas fa-info-circle'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="${iconMap[type]}"></i><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(40px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

/* ============================================================
   INIT
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    fetchOverview();

    // Realtime clock
    function updateClock() {
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        const ss = String(now.getSeconds()).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const mo = String(now.getMonth() + 1).padStart(2, '0');
        const yy = now.getFullYear();
        const clockEl = document.getElementById('clockText');
        const dateEl = document.getElementById('dateText');
        if (clockEl) clockEl.textContent = `${hh}:${mm}:${ss}`;
        if (dateEl) dateEl.textContent = `${dd}/${mo}/${yy}`;
    }
    updateClock();
    setInterval(updateClock, 1000);
});
