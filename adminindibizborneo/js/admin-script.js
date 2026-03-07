/* ==================================================
   ADMIN DASHBOARD – admin-script.js
   Auth | Navigation | Data Management | Export
================================================== */

/* ============================================================
   DEFAULT CUSTOMER DATA
   Struktur data:
   {
     'noInternet': {
       name: string,
       city: string,
       package: string,
       months: {
         'Bulan Tahun': { tagihan: number, bayar: boolean, tanggalBayar: number }
       }
     }
   }

   Rumus poin:
     Tagihan / 100.000 = base
     - Tanggal 1-10  → base x 3
     - Tanggal 11-15 → base x 2
     - Tanggal 16-20 → base x 1
     - Tanggal > 20 atau belum bayar → 0
   1 Kupon = 3 Poin
============================================================ */

const DEFAULT_CUSTOMERS = {
    '1234567890': {
        name: 'Ahmad Fauzi',
        city: 'Banjarmasin',
        package: 'IndiBiz High Speed 100Mbps',
        months: {
            'April 2025': { tagihan: 1250000, bayar: true, tanggalBayar: 5 },
            'Mei 2025': { tagihan: 1250000, bayar: true, tanggalBayar: 8 },
            'Juni 2025': { tagihan: 1250000, bayar: true, tanggalBayar: 3 }
        }
    },
    '1122334455': {
        name: 'Budi Santoso',
        city: 'Pontianak',
        package: 'IndiBiz Pro 200Mbps',
        months: {
            'April 2025': { tagihan: 2100000, bayar: true, tanggalBayar: 2 },
            'Mei 2025': { tagihan: 2100000, bayar: true, tanggalBayar: 10 },
            'Juni 2025': { tagihan: 2100000, bayar: true, tanggalBayar: 6 }
        }
    },
    '5544332211': {
        name: 'Dewi Lestari',
        city: 'Samarinda',
        package: 'IndiBiz Basic 50Mbps',
        months: {
            'April 2025': { tagihan: 750000, bayar: true, tanggalBayar: 14 },
            'Mei 2025': { tagihan: 750000, bayar: false, tanggalBayar: 0 },
            'Juni 2025': { tagihan: 750000, bayar: false, tanggalBayar: 0 }
        }
    },
    '3344556677': {
        name: 'Rizky Pratama',
        city: 'Palangkaraya',
        package: 'IndiBiz High Speed 100Mbps',
        months: {
            'April 2025': { tagihan: 1100000, bayar: true, tanggalBayar: 1 },
            'Mei 2025': { tagihan: 1100000, bayar: true, tanggalBayar: 9 },
            'Juni 2025': { tagihan: 1100000, bayar: true, tanggalBayar: 17 }
        }
    },
    '5566778899': {
        name: 'Nur Hidayah',
        city: 'Tarakan',
        package: 'IndiBiz Basic 50Mbps',
        months: {
            'April 2025': { tagihan: 850000, bayar: true, tanggalBayar: 4 },
            'Mei 2025': { tagihan: 850000, bayar: true, tanggalBayar: 11 },
            'Juni 2025': { tagihan: 850000, bayar: true, tanggalBayar: 18 }
        }
    },
    '4455667788': {
        name: 'Hendra Wijaya',
        city: 'Singkawang',
        package: 'IndiBiz Pro 200Mbps',
        months: {
            'April 2025': { tagihan: 1800000, bayar: true, tanggalBayar: 3 },
            'Mei 2025': { tagihan: 1800000, bayar: true, tanggalBayar: 15 },
            'Juni 2025': { tagihan: 1800000, bayar: false, tanggalBayar: 0 }
        }
    },
    '6677889900': {
        name: 'Andi Saputra',
        city: 'Bontang',
        package: 'IndiBiz Basic 50Mbps',
        months: {
            'April 2025': { tagihan: 950000, bayar: true, tanggalBayar: 6 },
            'Mei 2025': { tagihan: 950000, bayar: true, tanggalBayar: 10 },
            'Juni 2025': { tagihan: 950000, bayar: true, tanggalBayar: 2 }
        }
    },
    '7788990011': {
        name: 'Maya Putri',
        city: 'Banjarbaru',
        package: 'IndiBiz High Speed 100Mbps',
        months: {
            'April 2025': { tagihan: 1250000, bayar: true, tanggalBayar: 7 },
            'Mei 2025': { tagihan: 1250000, bayar: true, tanggalBayar: 13 },
            'Juni 2025': { tagihan: 1250000, bayar: false, tanggalBayar: 0 }
        }
    },
    '8899001122': {
        name: 'Rahmat Hidayat',
        city: 'Tenggarong',
        package: 'IndiBiz Basic 50Mbps',
        months: {
            'April 2025': { tagihan: 650000, bayar: true, tanggalBayar: 9 },
            'Mei 2025': { tagihan: 650000, bayar: true, tanggalBayar: 5 },
            'Juni 2025': { tagihan: 650000, bayar: true, tanggalBayar: 19 }
        }
    }
};

/* ============================================================
   DATA LAYER (localStorage)
============================================================ */
function loadCustomers() {
    const stored = localStorage.getItem('adminCustomers');
    if (stored) return JSON.parse(stored);
    // Seed with defaults
    localStorage.setItem('adminCustomers', JSON.stringify(DEFAULT_CUSTOMERS));
    return { ...DEFAULT_CUSTOMERS };
}

function saveCustomers(data) {
    localStorage.setItem('adminCustomers', JSON.stringify(data));
}

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

function addLog(type, action, detail) {
    // Log kept for internal tracking but no UI
    const logs = JSON.parse(localStorage.getItem('adminLogs') || '[]');
    logs.unshift({
        time: new Date().toLocaleString('id-ID'),
        type,
        action,
        detail
    });
    if (logs.length > 200) logs.length = 200;
    localStorage.setItem('adminLogs', JSON.stringify(logs));
}

/* ============================================================
   HELPERS – POINT CALCULATION
   Tagihan / 100.000 = base
   Tgl 1-10  → base x 3
   Tgl 11-15 → base x 2
   Tgl 16-20 → base x 1
   Tgl > 20 / belum bayar → 0
   1 Kupon = 3 Poin
============================================================ */
function getMultiplier(tanggalBayar) {
    if (!tanggalBayar || tanggalBayar <= 0) return 0;
    if (tanggalBayar >= 1 && tanggalBayar <= 10) return 3;
    if (tanggalBayar >= 11 && tanggalBayar <= 15) return 2;
    if (tanggalBayar >= 16 && tanggalBayar <= 20) return 1;
    return 0; // >20 = no points
}

function calcPoin(tagihan, bayar, tanggalBayar) {
    if (!bayar) return 0;
    const base = Math.floor(tagihan / 100000);
    const multiplier = getMultiplier(tanggalBayar || 0);
    return base * multiplier;
}

function getTotalPoin(cust) {
    let total = 0;
    for (const m of Object.values(cust.months)) {
        total += calcPoin(m.tagihan, m.bayar, m.tanggalBayar || 0);
    }
    return total;
}

function getTotalKupon(cust) {
    return Math.floor(getTotalPoin(cust) / 3);
}

function formatRp(num) {
    return new Intl.NumberFormat('id-ID').format(num);
}

function censorName(name) {
    const parts = name.split(' ');
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

/* Convert "April 2025" + tanggalBayar (5) → "05/04/25" */
const MONTH_MAP = {
    'januari': 1, 'februari': 2, 'maret': 3, 'april': 4,
    'mei': 5, 'juni': 6, 'juli': 7, 'agustus': 8,
    'september': 9, 'oktober': 10, 'november': 11, 'desember': 12
};

function bulanToDate(bulanStr, tanggalBayar) {
    if (!tanggalBayar || tanggalBayar <= 0) return '-';
    const parts = bulanStr.split(' ');
    const monthName = parts[0].toLowerCase();
    const year = parseInt(parts[1]) || 2025;
    const month = MONTH_MAP[monthName] || 1;
    const dd = String(tanggalBayar).padStart(2, '0');
    const mm = String(month).padStart(2, '0');
    const yy = String(year).slice(-2);
    return `${dd}/${mm}/${yy}`;
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
    const customers = loadCustomers();
    switch (sectionId) {
        case 'overview': renderOverview(customers); break;
        case 'pelanggan': renderCustomerTable(customers); break;
        case 'pengaturan': renderSettings(); break;
    }
}

/* ============================================================
   OVERVIEW
============================================================ */
function renderOverview(customers) {
    const entries = Object.entries(customers);
    const totalCustomers = entries.length;
    let totalPoin = 0;
    let totalKupon = 0;

    entries.forEach(([no, cust]) => {
        const p = getTotalPoin(cust);
        const k = getTotalKupon(cust);
        totalPoin += p;
        totalKupon += k;
    });

    document.getElementById('statCustomers').textContent = totalCustomers.toLocaleString('id-ID');
    document.getElementById('statPoints').textContent = totalPoin.toLocaleString('id-ID');
    document.getElementById('statCoupons').textContent = totalKupon.toLocaleString('id-ID');
}

/* ============================================================
   DATA PELANGGAN TABLE
============================================================ */
let currentSearchFilter = '';
let currentCityFilter = 'all';
let currentSortField = 'poin';
let currentSortDir = 'desc';

function renderCustomerTable(customers, filter = '') {
    const tbody = document.getElementById('customerTableBody');
    if (!tbody) return;

    const entries = Object.entries(customers);
    let filtered = entries;

    // Text search filter
    if (filter) {
        const q = filter.toLowerCase();
        filtered = filtered.filter(([no, c]) =>
            c.name.toLowerCase().includes(q) ||
            no.includes(q) ||
            c.city.toLowerCase().includes(q)
        );
    }

    // City/Witel filter
    if (currentCityFilter !== 'all') {
        filtered = filtered.filter(([no, c]) =>
            c.city.toLowerCase() === currentCityFilter.toLowerCase()
        );
    }

    // Apply sorting
    if (currentSortField === 'poin') {
        filtered.sort((a, b) => currentSortDir === 'desc' ? getTotalPoin(b[1]) - getTotalPoin(a[1]) : getTotalPoin(a[1]) - getTotalPoin(b[1]));
    } else if (currentSortField === 'nama') {
        filtered.sort((a, b) => currentSortDir === 'asc' ? a[1].name.localeCompare(b[1].name) : b[1].name.localeCompare(a[1].name));
    } else if (currentSortField === 'kota') {
        filtered.sort((a, b) => currentSortDir === 'asc' ? a[1].city.localeCompare(b[1].city) : b[1].city.localeCompare(a[1].city));
    } else if (currentSortField === 'kupon') {
        filtered.sort((a, b) => currentSortDir === 'desc' ? getTotalKupon(b[1]) - getTotalKupon(a[1]) : getTotalKupon(a[1]) - getTotalKupon(b[1]));
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 30px; color: var(--text-muted);">
            <i class="fas fa-inbox" style="font-size:2rem; display:block; margin-bottom:8px;"></i>
            Tidak ada data pelanggan ditemukan.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(([no, c], idx) => {
        const poin = getTotalPoin(c);
        const kupon = getTotalKupon(c);
        return `
        <tr>
            <td>${idx + 1}</td>
            <td><strong>${c.name}</strong></td>
            <td style="color: var(--text-secondary);">${no}</td>
            <td>${c.city}</td>
            <td style="color: var(--accent-yellow); font-weight: 700;">${poin.toLocaleString('id-ID')}</td>
            <td><span class="badge badge-info">${kupon}</span></td>
            <td>
                <button class="btn btn-outline btn-sm" onclick="showDetail('${no}')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>`;
    }).join('');
}

const customerSearch = document.getElementById('customerSearch');
if (customerSearch) {
    customerSearch.addEventListener('input', (e) => {
        currentSearchFilter = e.target.value.trim();
        renderCustomerTable(loadCustomers(), currentSearchFilter);
    });
}

const customerCityFilter = document.getElementById('customerCityFilter');
if (customerCityFilter) {
    customerCityFilter.addEventListener('change', (e) => {
        currentCityFilter = e.target.value;
        renderCustomerTable(loadCustomers(), currentSearchFilter);
    });
}

function sortCustomerTable(field) {
    if (currentSortField === field) {
        currentSortDir = currentSortDir === 'desc' ? 'asc' : 'desc';
    } else {
        currentSortField = field;
        currentSortDir = (field === 'nama' || field === 'kota') ? 'asc' : 'desc';
    }
    renderCustomerTable(loadCustomers(), currentSearchFilter);
}

/* ============================================================
   DETAIL PELANGGAN MODAL
============================================================ */
function showDetail(no) {
    const customers = loadCustomers();
    const cust = customers[no];
    if (!cust) return;

    document.getElementById('detailModalTitle').textContent = `Detail: ${cust.name}`;
    document.getElementById('detailName').textContent = cust.name;
    document.getElementById('detailNo').textContent = no;
    document.getElementById('detailCity').textContent = cust.city;
    document.getElementById('detailPackage').textContent = cust.package;

    const tbody = document.getElementById('detailPointsBody');
    let totalPoin = 0;
    tbody.innerHTML = '';

    Object.entries(cust.months).forEach(([bulan, data]) => {
        const tgl = data.tanggalBayar || 0;
        const poin = calcPoin(data.tagihan, data.bayar, tgl);
        totalPoin += poin;
        const badgeClass = data.bayar ? 'badge-success' : 'badge-danger';
        const badgeText = data.bayar ? 'Lunas' : 'Belum Bayar';
        const poinColor = poin > 0 ? 'var(--accent-yellow)' : 'var(--accent-red)';
        const base = Math.floor(data.tagihan / 100000);
        const mult = getMultiplierLabel(tgl);

        tbody.innerHTML += `
        <tr>
            <td>${bulan}</td>
            <td>Rp ${formatRp(data.tagihan)}</td>
            <td><span class="badge ${badgeClass}">${badgeText}</span></td>
            <td style="color: var(--text-secondary);">${bulanToDate(bulan, tgl)}</td>
            <td style="color: var(--text-secondary);">${data.bayar ? base + ' ' + mult : '-'}</td>
            <td style="font-weight: 700; color: ${poinColor};">${poin > 0 ? '+' : ''}${poin}</td>
        </tr>`;
    });

    document.getElementById('detailTotalPoin').textContent = `${totalPoin.toLocaleString('id-ID')} Poin (${getTotalKupon(cust)} Kupon)`;

    openModal('detailModal');
}

/* ============================================================
   EXPORT TO EXCEL
============================================================ */
function exportToExcel(type) {
    const customers = loadCustomers();

    let data = [];
    let filename = '';

    if (type === 'full') {
        const entries = Object.entries(customers)
            .map(([no, c]) => ({
                no, ...c,
                totalPoin: getTotalPoin(c),
                totalKupon: getTotalKupon(c)
            }))
            .sort((a, b) => b.totalPoin - a.totalPoin);

        // Apply city filter if active
        const filtered = currentCityFilter === 'all' ? entries :
            entries.filter(c => c.city.toLowerCase() === currentCityFilter.toLowerCase());

        data = filtered.map((c, idx) => {
            const row = {
                'No': idx + 1,
                'Nama Customer': c.name,
                'No Internet': c.no,
                'Kota': c.city,
                'Paket': c.package,
                'Total Poin': c.totalPoin,
                'Total Kupon': c.totalKupon
            };
            Object.entries(c.months).forEach(([bulan, m]) => {
                row[`${bulan} - Tagihan`] = m.tagihan;
                row[`${bulan} - Tgl Bayar`] = m.tanggalBayar || 0;
                row[`${bulan} - Status`] = m.bayar ? 'Lunas' : 'Belum Bayar';
                row[`${bulan} - Poin`] = calcPoin(m.tagihan, m.bayar, m.tanggalBayar || 0);
            });
            return row;
        });

        filename = `Laporan_Pelanggan_IndiBiz_${new Date().toISOString().split('T')[0]}.xlsx`;

    } else if (type === 'ranking') {
        const entries = Object.entries(customers)
            .map(([no, c]) => ({
                no, name: c.name, city: c.city,
                poin: getTotalPoin(c), kupon: getTotalKupon(c)
            }))
            .sort((a, b) => b.poin - a.poin);

        // Apply city filter if active
        const filtered = currentCityFilter === 'all' ? entries :
            entries.filter(c => c.city.toLowerCase() === currentCityFilter.toLowerCase());

        data = filtered.map((c, idx) => ({
            'Rank': idx + 1,
            'Nama Customer': c.name,
            'Nama Sensor': censorName(c.name),
            'No Internet': c.no,
            'Kota': c.city,
            'Total Poin': c.poin,
            'Total Kupon': c.kupon
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

    // Load saved credentials or use defaults
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
    // Reset mock data if format is old
    const stored = localStorage.getItem('adminCustomers');
    if (stored) {
        const data = JSON.parse(stored);
        const firstKey = Object.keys(data)[0];
        if (firstKey) {
            const firstMonth = Object.values(data[firstKey].months)[0];
            const hasOldFormat = firstMonth && firstMonth.tanggalBayar === undefined;
            const hasOldNames = data[firstKey].name && (data[firstKey].name.startsWith('CV.') || data[firstKey].name.startsWith('PT.') || data[firstKey].name.startsWith('UD.') || data[firstKey].name.startsWith('Toko '));
            if (hasOldFormat || hasOldNames) {
                localStorage.setItem('adminCustomers', JSON.stringify(DEFAULT_CUSTOMERS));
            }
        }
    }

    renderOverview(loadCustomers());

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
