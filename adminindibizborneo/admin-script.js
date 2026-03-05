/* ==================================================
   ADMIN DASHBOARD – admin-script.js
   Auth | Navigation | Data Management | Import/Export
   Top Customer | CMS | Audit Trail
================================================== */

/* ============================================================
   AUTH CHECK
============================================================ */
if (sessionStorage.getItem('adminLoggedIn') !== 'true') {
    window.location.href = 'index.html';
}

/* ============================================================
   MOCK DATA – Initial seed (mirrors customer-facing data)
   Setiap bulan sekarang menyimpan: tagihan, bayar, tanggalBayar
   Rumus Poin:
     - Tagihan / 100.000 = base
     - Tanggal 1-10  → base x 3
     - Tanggal 11-15 → base x 2
     - Tanggal 16-20 → base x 1
     - Tanggal > 20 atau belum bayar → 0
   1 Kupon = 3 Poin
============================================================ */
const DEFAULT_CUSTOMERS = {
    '1234567890': {
        name: 'CV. Sinar Mandiri',
        city: 'Banjarmasin',
        package: 'IndiBiz High Speed 100Mbps',
        months: {
            'April 2025': { tagihan: 1250000, bayar: true, tanggalBayar: 5 },
            'Mei 2025': { tagihan: 1250000, bayar: true, tanggalBayar: 8 },
            'Juni 2025': { tagihan: 1250000, bayar: true, tanggalBayar: 3 }
        }
    },
    '0987654321': {
        name: 'PT. Maju Bersama',
        city: 'Balikpapan',
        package: 'IndiBiz Basic 50Mbps',
        months: {
            'April 2025': { tagihan: 750000, bayar: true, tanggalBayar: 12 },
            'Mei 2025': { tagihan: 750000, bayar: true, tanggalBayar: 7 },
            'Juni 2025': { tagihan: 750000, bayar: false, tanggalBayar: 0 }
        }
    },
    '1122334455': {
        name: 'UD. Sentosa Jaya',
        city: 'Pontianak',
        package: 'IndiBiz Pro 200Mbps',
        months: {
            'April 2025': { tagihan: 2100000, bayar: true, tanggalBayar: 2 },
            'Mei 2025': { tagihan: 2100000, bayar: true, tanggalBayar: 10 },
            'Juni 2025': { tagihan: 2100000, bayar: true, tanggalBayar: 6 }
        }
    },
    '5544332211': {
        name: 'Toko Berkah Sejahtera',
        city: 'Samarinda',
        package: 'IndiBiz Basic 50Mbps',
        months: {
            'April 2025': { tagihan: 750000, bayar: true, tanggalBayar: 14 },
            'Mei 2025': { tagihan: 750000, bayar: false, tanggalBayar: 0 },
            'Juni 2025': { tagihan: 750000, bayar: false, tanggalBayar: 0 }
        }
    },
    '3344556677': {
        name: 'CV. Borneo Utama',
        city: 'Palangkaraya',
        package: 'IndiBiz High Speed 100Mbps',
        months: {
            'April 2025': { tagihan: 1100000, bayar: true, tanggalBayar: 1 },
            'Mei 2025': { tagihan: 1100000, bayar: true, tanggalBayar: 9 },
            'Juni 2025': { tagihan: 1100000, bayar: true, tanggalBayar: 17 }
        }
    },
    '5566778899': {
        name: 'Toko Elektronik Prima',
        city: 'Tarakan',
        package: 'IndiBiz Basic 50Mbps',
        months: {
            'April 2025': { tagihan: 850000, bayar: true, tanggalBayar: 4 },
            'Mei 2025': { tagihan: 850000, bayar: true, tanggalBayar: 11 },
            'Juni 2025': { tagihan: 850000, bayar: true, tanggalBayar: 18 }
        }
    },
    '4455667788': {
        name: 'PT. Global Nusantara',
        city: 'Singkawang',
        package: 'IndiBiz Pro 200Mbps',
        months: {
            'April 2025': { tagihan: 1800000, bayar: true, tanggalBayar: 3 },
            'Mei 2025': { tagihan: 1800000, bayar: true, tanggalBayar: 15 },
            'Juni 2025': { tagihan: 1800000, bayar: false, tanggalBayar: 0 }
        }
    },
    '6677889900': {
        name: 'UD. Harapan Baru',
        city: 'Bontang',
        package: 'IndiBiz Basic 50Mbps',
        months: {
            'April 2025': { tagihan: 950000, bayar: true, tanggalBayar: 6 },
            'Mei 2025': { tagihan: 950000, bayar: true, tanggalBayar: 10 },
            'Juni 2025': { tagihan: 950000, bayar: true, tanggalBayar: 2 }
        }
    },
    '7788990011': {
        name: 'CV. Makmur Sentosa',
        city: 'Banjarbaru',
        package: 'IndiBiz High Speed 100Mbps',
        months: {
            'April 2025': { tagihan: 1250000, bayar: true, tanggalBayar: 7 },
            'Mei 2025': { tagihan: 1250000, bayar: true, tanggalBayar: 13 },
            'Juni 2025': { tagihan: 1250000, bayar: false, tanggalBayar: 0 }
        }
    },
    '8899001122': {
        name: 'PT. Mahakam Abadi',
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

function loadLogs() {
    return JSON.parse(localStorage.getItem('adminLogs') || '[]');
}

function saveLogs(data) {
    localStorage.setItem('adminLogs', JSON.stringify(data));
}

function addLog(type, action, detail) {
    const logs = loadLogs();
    logs.unshift({
        time: new Date().toLocaleString('id-ID'),
        type,
        action,
        detail
    });
    if (logs.length > 200) logs.length = 200;
    saveLogs(logs);
}

/* ============================================================
   HELPERS – POINT CALCULATION
   Tagihan / 100.000 = base
   Tgl 1-10  → base × 3
   Tgl 11-15 → base × 2
   Tgl 16-20 → base × 1
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
    'pelanggan': 'Data Pelanggan & Poin',
    'top-customer': 'Top Customer',
    'laporan': 'Laporan & Export',
    'pengaturan': 'Pengaturan',
    'log': 'Log Aktivitas'
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
        case 'top-customer': renderRankingTable(customers); break;
        case 'laporan': populateExportFilters(customers); break;
        case 'pengaturan': renderSettings(); break;
        case 'log': renderLogs(); break;
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
    const cityPoints = {};

    entries.forEach(([no, cust]) => {
        const p = getTotalPoin(cust);
        const k = getTotalKupon(cust);
        totalPoin += p;
        totalKupon += k;
        if (!cityPoints[cust.city]) cityPoints[cust.city] = 0;
        cityPoints[cust.city] += p;
    });

    document.getElementById('statCustomers').textContent = totalCustomers.toLocaleString('id-ID');
    document.getElementById('statPoints').textContent = totalPoin.toLocaleString('id-ID');
    document.getElementById('statCoupons').textContent = totalKupon.toLocaleString('id-ID');

    const searches = parseInt(localStorage.getItem('cekPoinCount') || '0');
    document.getElementById('statSearches').textContent = searches.toLocaleString('id-ID');

    renderBarChart('chartCity', cityPoints);

    const cityCoupons = {};
    entries.forEach(([no, cust]) => {
        if (!cityCoupons[cust.city]) cityCoupons[cust.city] = 0;
        cityCoupons[cust.city] += getTotalKupon(cust);
    });
    renderBarChart('chartCoupon', cityCoupons);
}

function renderBarChart(containerId, dataObj) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    const entries = Object.entries(dataObj).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const maxVal = Math.max(...entries.map(e => e[1]), 1);

    entries.forEach(([label, val]) => {
        const pct = (val / maxVal) * 100;
        const item = document.createElement('div');
        item.className = 'bar-item';
        item.innerHTML = `
            <div class="bar-value">${val.toLocaleString('id-ID')}</div>
            <div class="bar-fill" style="height: 0%;" data-height="${pct}"></div>
            <div class="bar-label">${label}</div>
        `;
        container.appendChild(item);
    });

    requestAnimationFrame(() => {
        setTimeout(() => {
            container.querySelectorAll('.bar-fill').forEach(bar => {
                bar.style.height = bar.dataset.height + '%';
            });
        }, 100);
    });
}

/* ============================================================
   DATA PELANGGAN TABLE
============================================================ */
let currentSearchFilter = '';

function renderCustomerTable(customers, filter = '') {
    const tbody = document.getElementById('customerTableBody');
    if (!tbody) return;

    const entries = Object.entries(customers);
    let filtered = entries;

    if (filter) {
        const q = filter.toLowerCase();
        filtered = entries.filter(([no, c]) =>
            c.name.toLowerCase().includes(q) ||
            no.includes(q) ||
            c.city.toLowerCase().includes(q)
        );
    }

    filtered.sort((a, b) => getTotalPoin(b[1]) - getTotalPoin(a[1]));

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 30px; color: var(--text-muted);">
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
            <td style="font-size: 0.8rem; color: var(--text-secondary);">${c.package}</td>
            <td style="color: var(--accent-yellow); font-weight: 700;">${poin.toLocaleString('id-ID')}</td>
            <td><span class="badge badge-info">${kupon}</span></td>
            <td>
                <div class="btn-group">
                    <button class="btn btn-outline btn-sm" onclick="showDetail('${no}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteCustomer('${no}')">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </td>
        </tr>`;
    }).join('');
}

function deleteCustomer(no) {
    const customers = loadCustomers();
    const cust = customers[no];
    if (!cust) return;

    if (!confirm(`Yakin ingin menghapus pelanggan "${cust.name}" (${no})?`)) return;

    delete customers[no];
    saveCustomers(customers);

    addLog('edit', 'Hapus Pelanggan', `Pelanggan ${cust.name} (${no}) berhasil dihapus.`);
    showToast('success', `Pelanggan "${cust.name}" berhasil dihapus.`);
    renderCustomerTable(loadCustomers(), currentSearchFilter);
}

const customerSearch = document.getElementById('customerSearch');
if (customerSearch) {
    customerSearch.addEventListener('input', (e) => {
        currentSearchFilter = e.target.value.trim();
        renderCustomerTable(loadCustomers(), currentSearchFilter);
    });
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
   IMPORT EXCEL
============================================================ */
let importedData = [];

const fileInput = document.getElementById('fileInput');
const uploadZone = document.getElementById('uploadZone');

if (uploadZone) {
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });
    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            handleFile(e.dataTransfer.files[0]);
        }
    });
}

if (fileInput) {
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFile(e.target.files[0]);
        }
    });
}

function handleFile(file) {
    const validExts = ['.xlsx', '.xls', '.csv'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();

    if (!validExts.includes(ext)) {
        showToast('error', 'Format file tidak valid. Gunakan .xlsx, .xls, atau .csv');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });

            if (json.length === 0) {
                showToast('error', 'File kosong atau format tidak sesuai.');
                return;
            }
            processImportData(json);
        } catch (err) {
            showToast('error', 'Gagal membaca file: ' + err.message);
        }
    };
    reader.readAsArrayBuffer(file);
}

function processImportData(json) {
    importedData = [];
    let errorCount = 0;
    let successCount = 0;

    json.forEach((row) => {
        const nama = (row.nama || row.Nama || row.NAMA || '').toString().trim();
        const noInternet = (row.no_internet || row['No Internet'] || row.NO_INTERNET || '').toString().trim();
        const kota = (row.kota || row.Kota || row.KOTA || '').toString().trim();
        const paket = (row.paket || row.Paket || row.PAKET || '').toString().trim();
        const bulan = (row.bulan || row.Bulan || row.BULAN || '').toString().trim();
        const tagihan = parseInt(row.tagihan || row.Tagihan || row.TAGIHAN || 0);
        const tanggalBayar = parseInt(row.tanggal_bayar || row['Tanggal Bayar'] || row.TANGGAL_BAYAR || 0);
        const statusRaw = (row.status_bayar || row['Status Bayar'] || row.STATUS_BAYAR || '').toString().trim().toLowerCase();
        const bayar = statusRaw === 'lunas' || statusRaw === 'ya' || statusRaw === 'true' || statusRaw === '1';

        let hasError = false;
        let errorMsg = '';

        if (!nama) { hasError = true; errorMsg = 'Nama kosong'; }
        if (!noInternet) { hasError = true; errorMsg = 'No Internet kosong'; }
        if (!bulan) { hasError = true; errorMsg = 'Bulan kosong'; }
        if (!tagihan || tagihan <= 0) { hasError = true; errorMsg = 'Tagihan tidak valid'; }

        if (hasError) errorCount++;
        else successCount++;

        importedData.push({
            nama, noInternet, kota, paket, bulan, tagihan, tanggalBayar, bayar,
            hasError, errorMsg
        });
    });

    const previewStats = document.getElementById('previewStats');
    previewStats.innerHTML = `
        <div class="preview-stat total"><i class="fas fa-list"></i> Total: ${importedData.length}</div>
        <div class="preview-stat success"><i class="fas fa-check"></i> Valid: ${successCount}</div>
        <div class="preview-stat error"><i class="fas fa-times"></i> Error: ${errorCount}</div>
    `;

    const previewBody = document.getElementById('previewBody');
    previewBody.innerHTML = importedData.map((row, idx) => {
        const rowClass = row.hasError ? 'row-error' : '';
        return `
        <tr class="${rowClass}">
            <td>${idx + 1}${row.hasError ? ' <i class="fas fa-exclamation-circle" title="' + row.errorMsg + '" style="color:var(--accent-red);"></i>' : ''}</td>
            <td>${row.nama || '-'}</td>
            <td>${row.noInternet || '-'}</td>
            <td>${row.kota || '-'}</td>
            <td>${row.paket || '-'}</td>
            <td>${row.bulan || '-'}</td>
            <td>${row.tagihan > 0 ? 'Rp ' + formatRp(row.tagihan) : '-'}</td>
            <td>${row.tanggalBayar > 0 ? 'Tgl ' + row.tanggalBayar + ' (' + getMultiplierLabel(row.tanggalBayar) + ')' : '-'}</td>
            <td>${row.hasError ? '<span class="badge badge-danger">' + row.errorMsg + '</span>' : (row.bayar ? '<span class="badge badge-success">Lunas</span>' : '<span class="badge badge-danger">Belum</span>')}</td>
        </tr>`;
    }).join('');

    document.getElementById('importPreview').style.display = 'block';
    showToast('info', `File berhasil dibaca. ${successCount} data valid, ${errorCount} error.`);
}

function confirmImport() {
    const validRows = importedData.filter(r => !r.hasError);
    if (validRows.length === 0) {
        showToast('error', 'Tidak ada data valid untuk diimport.');
        return;
    }

    const customers = loadCustomers();

    validRows.forEach(row => {
        if (!customers[row.noInternet]) {
            customers[row.noInternet] = {
                name: row.nama,
                city: row.kota,
                package: row.paket,
                months: {}
            };
        }
        customers[row.noInternet].name = row.nama;
        customers[row.noInternet].city = row.kota;
        if (row.paket) customers[row.noInternet].package = row.paket;

        customers[row.noInternet].months[row.bulan] = {
            tagihan: row.tagihan,
            bayar: row.bayar,
            tanggalBayar: row.tanggalBayar || 0
        };
    });

    saveCustomers(customers);

    addLog('upload', 'Import Data Excel',
        `Berhasil mengimport ${validRows.length} baris data tagihan.`);

    document.getElementById('importPreview').style.display = 'none';
    importedData = [];
    if (fileInput) fileInput.value = '';

    showToast('success', `${validRows.length} data berhasil diimport!`);
    renderCustomerTable(loadCustomers(), currentSearchFilter);
}

function cancelImport() {
    document.getElementById('importPreview').style.display = 'none';
    importedData = [];
    if (fileInput) fileInput.value = '';
}

function showTemplateInfo() {
    openModal('templateModal');
}

function downloadTemplate() {
    const templateData = [
        { nama: 'CV. Contoh Usaha', no_internet: '1234567890', kota: 'Banjarmasin', paket: 'IndiBiz High Speed 100Mbps', bulan: 'April 2025', tagihan: 1250000, tanggal_bayar: 5, status_bayar: 'Lunas' },
        { nama: 'PT. Maju Jaya', no_internet: '0987654321', kota: 'Balikpapan', paket: 'IndiBiz Basic 50Mbps', bulan: 'April 2025', tagihan: 750000, tanggal_bayar: 18, status_bayar: 'Lunas' }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'Template_Import_IndiBiz.xlsx');

    addLog('export', 'Download Template', 'Admin mendownload template Excel.');
    showToast('success', 'Template berhasil diunduh!');
}

/* ============================================================
   TOP CUSTOMER / RANKING
============================================================ */
function renderRankingTable(customers) {
    const tbody = document.getElementById('rankingTableBody');
    if (!tbody) return;

    const entries = Object.entries(customers);
    const ranked = entries.map(([no, c]) => ({
        no,
        name: c.name,
        city: c.city,
        poin: getTotalPoin(c),
        kupon: getTotalKupon(c)
    })).sort((a, b) => b.poin - a.poin);

    tbody.innerHTML = ranked.map((c, idx) => {
        const rank = idx + 1;
        let rankClass = 'rank-default';
        if (rank === 1) rankClass = 'rank-1';
        else if (rank === 2) rankClass = 'rank-2';
        else if (rank === 3) rankClass = 'rank-3';

        return `
        <tr>
            <td><span class="rank-num ${rankClass}">${rank}</span></td>
            <td><strong>${c.name}</strong></td>
            <td class="name-censored">${censorName(c.name)}</td>
            <td style="color: var(--text-secondary);">${c.no}</td>
            <td>${c.city}</td>
            <td style="color: var(--accent-yellow); font-weight: 700;">${c.poin.toLocaleString('id-ID')}</td>
            <td><span class="badge badge-info">${c.kupon}</span></td>
        </tr>`;
    }).join('');

    updatePublishStatus();
}

function updatePublishStatus() {
    const lastPublish = localStorage.getItem('lastPublishTime');
    const statusEl = document.getElementById('publishStatus');
    const textEl = document.getElementById('publishStatusText');

    if (lastPublish) {
        statusEl.classList.remove('unpublished');
        textEl.innerHTML = `<i class="fas fa-check-circle"></i> Terakhir di-publish: ${lastPublish}`;
    } else {
        statusEl.classList.add('unpublished');
        textEl.textContent = 'Data belum dipublish ke halaman pelanggan.';
    }
}

function publishRanking() {
    const customers = loadCustomers();
    const entries = Object.entries(customers);

    const ranked = entries.map(([no, c]) => ({
        no,
        name: c.name,
        censoredName: censorName(c.name),
        city: c.city,
        poin: getTotalPoin(c),
        kupon: getTotalKupon(c)
    })).sort((a, b) => b.poin - a.poin);

    localStorage.setItem('publishedRanking', JSON.stringify(ranked));
    localStorage.setItem('publishedCustomers', JSON.stringify(customers));

    const now = new Date().toLocaleString('id-ID');
    localStorage.setItem('lastPublishTime', now);

    addLog('publish', 'Publish Ranking', `Data ranking (${ranked.length} pelanggan) berhasil di-publish ke website.`);
    updatePublishStatus();
    showToast('success', 'Data Top Customer berhasil di-publish ke halaman pelanggan!');
}

/* ============================================================
   LAPORAN & EXPORT
============================================================ */
function populateExportFilters(customers) {
    const citySelect = document.getElementById('exportCityFilter');
    if (!citySelect) return;

    const cities = new Set();
    Object.values(customers).forEach(c => cities.add(c.city));

    citySelect.innerHTML = '<option value="all">Semua Kota</option>';
    [...cities].sort().forEach(city => {
        citySelect.innerHTML += `<option value="${city}">${city}</option>`;
    });

    // Hide preview on section load
    const preview = document.getElementById('reportPreview');
    if (preview) preview.style.display = 'none';
}

/* --- Preview Report (Tampilkan) --- */
function previewReport() {
    const customers = loadCustomers();
    const cityFilter = document.getElementById('exportCityFilter').value;
    const limitFilter = document.getElementById('exportLimitFilter').value;

    const entries = Object.entries(customers)
        .filter(([no, c]) => cityFilter === 'all' || c.city === cityFilter)
        .map(([no, c]) => ({
            no, ...c,
            totalPoin: getTotalPoin(c),
            totalKupon: getTotalKupon(c)
        }))
        .sort((a, b) => b.totalPoin - a.totalPoin);

    const limited = limitFilter === 'all' ? entries : entries.slice(0, parseInt(limitFilter));

    if (limited.length === 0) {
        showToast('error', 'Tidak ada data yang sesuai filter.');
        return;
    }

    // Build table
    const thead = document.getElementById('reportPreviewHead');
    const tbody = document.getElementById('reportPreviewBody');
    const countEl = document.getElementById('reportPreviewCount');

    thead.innerHTML = `<tr>
        <th>No</th>
        <th>Nama Customer</th>
        <th>No Internet</th>
        <th>Kota</th>
        <th>Paket</th>
        <th>Total Poin</th>
        <th>Kupon</th>
    </tr>`;

    tbody.innerHTML = limited.map((c, idx) => `
        <tr>
            <td>${idx + 1}</td>
            <td><strong>${c.name}</strong></td>
            <td style="color: var(--text-secondary);">${c.no}</td>
            <td>${c.city}</td>
            <td style="font-size: 0.8rem; color: var(--text-secondary);">${c.package}</td>
            <td style="color: var(--accent-yellow); font-weight: 700;">${c.totalPoin.toLocaleString('id-ID')}</td>
            <td><span class="badge badge-info">${c.totalKupon}</span></td>
        </tr>
    `).join('');

    countEl.textContent = `Menampilkan ${limited.length} dari ${entries.length} data`;

    document.getElementById('reportPreview').style.display = 'block';
    showToast('success', `${limited.length} data ditampilkan.`);
}

function exportToExcel(type) {
    const customers = loadCustomers();
    const cityFilter = document.getElementById('exportCityFilter').value;
    const limitFilter = document.getElementById('exportLimitFilter').value;

    let data = [];
    let filename = '';

    if (type === 'full') {
        const entries = Object.entries(customers)
            .filter(([no, c]) => cityFilter === 'all' || c.city === cityFilter)
            .map(([no, c]) => ({
                no, ...c,
                totalPoin: getTotalPoin(c),
                totalKupon: getTotalKupon(c)
            }))
            .sort((a, b) => b.totalPoin - a.totalPoin);

        const limited = limitFilter === 'all' ? entries : entries.slice(0, parseInt(limitFilter));

        data = limited.map((c, idx) => {
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
            .filter(([no, c]) => cityFilter === 'all' || c.city === cityFilter)
            .map(([no, c]) => ({
                no, name: c.name, city: c.city,
                poin: getTotalPoin(c), kupon: getTotalKupon(c)
            }))
            .sort((a, b) => b.poin - a.poin);

        const limited = limitFilter === 'all' ? entries : entries.slice(0, parseInt(limitFilter));

        data = limited.map((c, idx) => ({
            'Rank': idx + 1,
            'Nama Customer': c.name,
            'Nama Sensor': censorName(c.name),
            'No Internet': c.no,
            'Kota': c.city,
            'Total Poin': c.poin,
            'Total Kupon': c.kupon
        }));

        filename = `Top_Customer_IndiBiz_${new Date().toISOString().split('T')[0]}.xlsx`;

    } else if (type === 'log') {
        const logs = loadLogs();
        data = logs.map((log, idx) => ({
            'No': idx + 1,
            'Waktu': log.time,
            'Tipe': log.type,
            'Aktivitas': log.action,
            'Detail': log.detail
        }));
        filename = `Log_Aktivitas_IndiBiz_${new Date().toISOString().split('T')[0]}.xlsx`;
    }

    if (data.length === 0) {
        showToast('error', 'Tidak ada data untuk di-export.');
        return;
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, filename);

    addLog('export', `Export ${type === 'full' ? 'Data Pelanggan' : type === 'ranking' ? 'Top Customer' : 'Log Aktivitas'}`,
        `Berhasil meng-export ${data.length} baris data ke file ${filename}`);

    showToast('success', `File "${filename}" berhasil diunduh!`);
}

/* ============================================================
   SETTINGS – BANNER
============================================================ */
function renderSettings() {
    renderBannerPreview();
    renderPeriodList();
}

function renderBannerPreview() {
    const grid = document.getElementById('bannerPreviewGrid');
    if (!grid) return;

    const banners = [
        { src: '../banner1.png', label: 'Banner 1 – Utama' },
        { src: '../banner2.png', label: 'Banner 2 – Kumpulkan Poin' },
        { src: '../banner3.png', label: 'Banner 3 – Top Customer' }
    ];

    grid.innerHTML = banners.map(b => `
        <div class="banner-preview-item">
            <img src="${b.src}" alt="${b.label}">
            <div class="banner-label">${b.label}</div>
        </div>
    `).join('');
}

const bannerUploadInput = document.getElementById('bannerUploadInput');
if (bannerUploadInput) {
    bannerUploadInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            addLog('upload', 'Upload Banner', `Banner baru "${e.target.files[0].name}" berhasil diupload.`);
            showToast('info', 'Banner berhasil diupload! (Demo mode – Hubungi Backend untuk integrasi penuh)');
            e.target.value = '';
        }
    });
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
   LOG AKTIVITAS
============================================================ */
function renderLogs() {
    const tbody = document.getElementById('logTableBody');
    if (!tbody) return;

    const logs = loadLogs();

    if (logs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 30px; color: var(--text-muted);">
            <i class="fas fa-clipboard-list" style="font-size:2rem; display:block; margin-bottom:8px;"></i>
            Belum ada aktivitas tercatat.</td></tr>`;
        return;
    }

    const typeIcons = {
        'login': { icon: 'fas fa-sign-in-alt', class: 'log-login' },
        'upload': { icon: 'fas fa-file-upload', class: 'log-upload' },
        'edit': { icon: 'fas fa-edit', class: 'log-edit' },
        'publish': { icon: 'fas fa-globe', class: 'log-publish' },
        'export': { icon: 'fas fa-download', class: 'log-export' },
        'period': { icon: 'fas fa-calendar', class: 'log-period' }
    };

    tbody.innerHTML = logs.map(log => {
        const ti = typeIcons[log.type] || { icon: 'fas fa-info-circle', class: 'log-login' };
        return `
        <tr>
            <td><span class="log-entry-icon ${ti.class}"><i class="${ti.icon}"></i></span></td>
            <td style="white-space:nowrap; color: var(--text-secondary);">${log.time}</td>
            <td><strong>${log.action}</strong></td>
            <td style="color: var(--text-secondary); font-size: 0.82rem;">${log.detail}</td>
        </tr>`;
    }).join('');
}

function clearLogs() {
    if (confirm('Yakin ingin menghapus semua log aktivitas?')) {
        saveLogs([]);
        addLog('edit', 'Hapus Log', 'Semua log aktivitas berhasil dihapus.');
        renderLogs();
        showToast('success', 'Log aktivitas berhasil dihapus.');
    }
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
    // Reset mock data to use new point system with tanggalBayar
    const stored = localStorage.getItem('adminCustomers');
    if (stored) {
        const data = JSON.parse(stored);
        const firstKey = Object.keys(data)[0];
        if (firstKey) {
            const firstMonth = Object.values(data[firstKey].months)[0];
            if (firstMonth && firstMonth.tanggalBayar === undefined) {
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
