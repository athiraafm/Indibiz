/* ==================================================
   INDIBIZ UNDIAN – script.js
   Slider | AOS | Particles | Ranking | Cek Poin
================================================== */

/* ============================================================
   SUPABASE CONFIG
============================================================ */
const SUPABASE_URL = 'https://swqrvjtpnapvdgtxgrci.supabase.co';
const SUPABASE_KEY = 'sb_publishable_hF0op8sFap54NyZrduW8qg_DMvXo-h8';
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ============================================================
   FALLBACK MOCK DATABASE – used when Supabase is empty
============================================================ */
const SAMPLE_CUSTOMERS = {
    '1234567890': {
        name: 'Andi Syahputra',
        city: 'Banjarmasin',
        package: 'IndiBiz High Speed 100Mbps',
        months: {
            'April 2025': { tagihan: 1250000, bayar: true },
            'Mei 2025': { tagihan: 1250000, bayar: true },
            'Juni 2025': { tagihan: 1250000, bayar: true }
        }
    },
    '0987654321': {
        name: 'Budi Raharjo',
        city: 'Balikpapan',
        package: 'IndiBiz Basic 50Mbps',
        months: {
            'April 2025': { tagihan: 750000, bayar: true },
            'Mei 2025': { tagihan: 750000, bayar: true },
            'Juni 2025': { tagihan: 750000, bayar: false }
        }
    },
    '1122334455': {
        name: 'Chandra Dimas',
        city: 'Pontianak',
        package: 'IndiBiz Pro 200Mbps',
        months: {
            'April 2025': { tagihan: 2100000, bayar: true },
            'Mei 2025': { tagihan: 2100000, bayar: true },
            'Juni 2025': { tagihan: 2100000, bayar: true }
        }
    },
    '5544332211': {
        name: 'Dedy Kusuma',
        city: 'Samarinda',
        package: 'IndiBiz Basic 50Mbps',
        months: {
            'April 2025': { tagihan: 750000, bayar: true },
            'Mei 2025': { tagihan: 750000, bayar: false },
            'Juni 2025': { tagihan: 750000, bayar: false }
        }
    }
};

const SAMPLE_TOP_CUSTOMERS = [
    { rank: 1, name: "Andi Syahputra", no: "1234567890", city: "Banjarmasin", points: 12540, status: "top" },
    { rank: 2, name: "Budi Raharjo", no: "0987654321", city: "Balikpapan", points: 9850, status: "top" },
    { rank: 3, name: "Chandra Dimas", no: "1122334455", city: "Pontianak", points: 8320, status: "top" },
    { rank: 4, name: "Dedy Kusuma", no: "5544332211", city: "Samarinda", points: 7100, status: "active" },
    { rank: 5, name: "Edi Pramono", no: "3344556677", city: "Palangkaraya", points: 6840, status: "active" },
    { rank: 6, name: "Fifi Lutfia", no: "5566778899", city: "Tarakan", points: 6200, status: "active" },
    { rank: 7, name: "Gita Maya", no: "4455667788", city: "Singkawang", points: 5980, status: "active" },
    { rank: 8, name: "Hadi Tanu", no: "6677889900", city: "Bontang", points: 5430, status: "active" },
    { rank: 9, name: "Irwan Wahyu", no: "7788990011", city: "Banjarbaru", points: 4960, status: "active" },
    { rank: 10, name: "Junaedi Saputra", no: "8899001122", city: "Tenggarong", points: 4520, status: "active" },
];

/* ============================================================
   HELPERS
============================================================ */
function calcPoin(tagihan, bayar) {
    if (!bayar) return 0;
    // 1 poin per 10.000 rupiah tagihan
    return Math.floor(tagihan / 10000);
}

function formatRp(num) {
    return new Intl.NumberFormat('id-ID').format(num);
}

function maskName(name) {
    if (!name) return "";
    return name.toLowerCase().split(' ').map(part => {
        if (part.length <= 2) return part[0] + "*";
        let chars = part.split('');
        for (let i = 1; i < chars.length - 1; i++) {
            // Increased mask probability for "scattered" feel
            if (Math.random() > 0.5) {
                chars[i] = '*';
            }
        }
        // Ensure at least one asterisk
        if (!chars.includes('*') && chars.length > 2) {
            const pos = Math.floor(Math.random() * (chars.length - 2)) + 1;
            chars[pos] = '*';
        }
        return chars.join('');
    }).join(' ');
}

/* ============================================================
   NAVBAR – scroll effect & smooth active highlight
============================================================ */
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
    highlightActiveNav();
});

function highlightActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    let activeId = 'home';
    sections.forEach(sec => {
        if (window.scrollY >= sec.offsetTop - 120) {
            activeId = sec.id;
        }
    });
    navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${activeId}`);
    });
}

// Hamburger
const hamburger = document.getElementById('hamburger');
const navLinksEl = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
    navLinksEl.classList.toggle('open');
    const bars = hamburger.querySelectorAll('span');
    bars[0].style.transform = navLinksEl.classList.contains('open') ? 'rotate(45deg) translateY(7.5px)' : '';
    bars[1].style.opacity = navLinksEl.classList.contains('open') ? '0' : '';
    bars[2].style.transform = navLinksEl.classList.contains('open') ? 'rotate(-45deg) translateY(-7.5px)' : '';
});
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navLinksEl.classList.remove('open');
    });
});

/* ============================================================
   SLIDER
============================================================ */
const slidesEl = document.querySelectorAll('.slide');
const sliderWrapper = document.getElementById('sliderWrapper');
const dots = document.querySelectorAll('.dot');
let currentSlide = 0;
const sliderContainer = document.querySelector('.slider-container');
let isPaused = false;
let autoSlide;

function goToSlide(idx) {
    const slide = slidesEl[idx];
    if (!slide) return;

    // Prevent vertical jump: calculate horizontal offset to center the slide manually
    const containerWidth = sliderContainer.clientWidth;
    const slideWidth = slide.clientWidth;
    const slideOffset = slide.offsetLeft;

    const scrollToX = slideOffset - (containerWidth / 2) + (slideWidth / 2);

    sliderContainer.scrollTo({
        left: scrollToX,
        behavior: 'smooth'
    });
}

// Intersection Observer for active state syncing
const observerOptions = {
    root: sliderContainer,
    threshold: 0.6
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const index = Array.from(slidesEl).indexOf(entry.target);
            updateActiveState(index);
        }
    });
}, observerOptions);

slidesEl.forEach(slide => observer.observe(slide));

function updateActiveState(index) {
    if (currentSlide === index && slidesEl[index].classList.contains('active')) return;

    slidesEl[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');

    currentSlide = index;

    slidesEl[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
}

// Manual movement reset timer
sliderContainer.addEventListener('scroll', () => {
    // For simplicity, any scroll resets timer to give user time to read
    resetAutoTimer();
}, { passive: true });

document.getElementById('sliderNext').addEventListener('click', () => {
    goToSlide((currentSlide + 1) % slidesEl.length);
    resetAutoTimer();
});

document.getElementById('sliderPrev').addEventListener('click', () => {
    goToSlide((currentSlide - 1 + slidesEl.length) % slidesEl.length);
    resetAutoTimer();
});

dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
        goToSlide(idx);
        resetAutoTimer();
    });
});

function resetAutoTimer() {
    if (!isPaused) {
        clearInterval(autoSlide);
        startAutoSlide();
    }
}

function startAutoSlide() {
    if (isPaused) return;
    autoSlide = setInterval(() => {
        goToSlide((currentSlide + 1) % slidesEl.length);
    }, 5000);
}

// Pause Toggle
const pauseToggle = document.getElementById('pauseToggle');
if (pauseToggle) {
    pauseToggle.addEventListener('click', () => {
        isPaused = !isPaused;
        const icon = pauseToggle.querySelector('i');
        if (isPaused) {
            clearInterval(autoSlide);
            icon.className = 'fas fa-play';
        } else {
            startAutoSlide();
            icon.className = 'fas fa-pause';
        }
    });
}

startAutoSlide();

// Touch/swipe
let touchStartX = 0;
const hero = document.querySelector('.hero');
hero.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
hero.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
        clearInterval(autoSlide);
        diff > 0 ? goToSlide(currentSlide + 1) : goToSlide(currentSlide - 1);
        startAutoSlide();
    }
});

/* ============================================================
   AOS – scroll-triggered animations
============================================================ */
function initAOS() {
    const targets = document.querySelectorAll('[data-aos]');
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('aos-animate');
                // Don't un-observe so cards stay visible
            }
        });
    }, { threshold: 0.12 });
    targets.forEach(el => io.observe(el));
}

/* ============================================================
   PARTICLES
============================================================ */
function spawnParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    const colors = ['#3b82f6', '#06b6d4', '#f59e0b', '#ffffff'];
    for (let i = 0; i < 30; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = Math.random() * 6 + 3;
        const col = colors[Math.floor(Math.random() * colors.length)];
        const dur = Math.random() * 15 + 10;
        const delay = Math.random() * -20;
        const startX = Math.random() * 100;
        p.style.cssText = `
            width:${size}px; height:${size}px;
            background:${col};
            left:${startX}%;
            top:${Math.random() * 100}%;
            animation-duration:${dur}s;
            animation-delay:${delay}s;
        `;
        p.style.animation = `particleFloat ${dur}s ${delay}s linear infinite`;
        container.appendChild(p);
    }
}

// Add keyframe for particles dynamically
(function injectParticleKeyframe() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes particleFloat {
            0%   { transform: translateY(0)   rotate(0deg); opacity: 0.3; }
            50%  { opacity: 0.5; }
            100% { transform: translateY(-120vh) rotate(360deg); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
})();

/* ============================================================
   RANKING TABLE (Live from Supabase)
============================================================ */
let TOP_CUSTOMERS_DATA = []; // will be populated from Supabase

async function populateRanking() {
    const body = document.getElementById('rankingBody');
    if (!body) return;

    try {
        // Fetch top customers by total_poin descending
        const { data: poinData, error: errPoin } = await db
            .from('poin_dan_kupon')
            .select('no_internet, total_poin, total_kupon')
            .order('total_poin', { ascending: false })
            .limit(10);

        if (errPoin) throw errPoin;

        if (!poinData || poinData.length === 0) {
            // Fallback to sample data
            TOP_CUSTOMERS_DATA = SAMPLE_TOP_CUSTOMERS;
            renderRanking(body, TOP_CUSTOMERS_DATA);
            return;
        }

        // Fetch customer names & cities
        const noList = poinData.map(p => p.no_internet);
        const { data: pelangganData, error: errP } = await db
            .from('data_pelanggan')
            .select('no_internet, nama_pelanggan, kota')
            .in('no_internet', noList);

        if (errP) throw errP;

        const map = {};
        (pelangganData || []).forEach(p => { map[p.no_internet] = p; });

        TOP_CUSTOMERS_DATA = poinData.map((p, idx) => ({
            rank: idx + 1,
            name: map[p.no_internet]?.nama_pelanggan || '-',
            no: p.no_internet,
            city: map[p.no_internet]?.kota || '-',
            points: p.total_poin || 0,
            status: idx < 3 ? 'top' : 'active'
        }));

        renderRanking(body, TOP_CUSTOMERS_DATA);
    } catch (err) {
        console.error('Gagal memuat ranking dari Supabase:', err);
        TOP_CUSTOMERS_DATA = SAMPLE_TOP_CUSTOMERS;
        renderRanking(body, TOP_CUSTOMERS_DATA);
    }
}

function renderRanking(body, data) {
    body.innerHTML = data.map(c => {
        let rankClass = 'rank-normal';
        if (c.rank === 1) rankClass = 'rank-gold';
        else if (c.rank === 2) rankClass = 'rank-silver';
        else if (c.rank === 3) rankClass = 'rank-bronze';
        const statusClass = c.status === 'top' ? 'status-top' : 'status-active';
        const statusLabel = c.status === 'top' ? 'Top Customer' : 'Aktif';
        const masked = maskName(c.name);
        return `
        <tr>
            <td><span class="rank-badge ${rankClass}">${c.rank}</span></td>
            <td><strong>${masked}</strong></td>
            <td style="color:var(--text-body);font-size:0.85rem;">${c.no}</td>
            <td>${c.city}</td>
            <td style="color:#fcd34d;font-weight:700;">${c.points.toLocaleString('id-ID')}</td>
            <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
        </tr>`;
    }).join('');
}

/* ============================================================
   CEK POIN
============================================================ */
const searchBtn = document.getElementById('searchBtn');
const noInternetInput = document.getElementById('noInternetInput');
const resultContainer = document.getElementById('resultContainer');
const emptyState = document.getElementById('emptyState');
const loadingOverlay = document.getElementById('loadingOverlay');

searchBtn.addEventListener('click', doCekPoin);
noInternetInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') doCekPoin();
});

function doCekPoin() {
    const no = noInternetInput.value.trim();
    if (!no) {
        noInternetInput.focus();
        noInternetInput.parentElement.style.borderColor = '#f87171';
        setTimeout(() => noInternetInput.parentElement.style.borderColor = '', 1200);
        return;
    }

    // Show loading
    loadingOverlay.classList.add('active');
    resultContainer.style.display = 'none';
    emptyState.style.display = 'none';

    cekPoinFromSupabase(no);
}

async function cekPoinFromSupabase(no) {
    try {
        // 1. Cari pelanggan
        const { data: pelanggan, error: errP } = await db
            .from('data_pelanggan')
            .select('*')
            .eq('no_internet', no)
            .single();

        if (errP || !pelanggan) {
            // Coba fallback ke sample data
            const sampleCust = SAMPLE_CUSTOMERS[no];
            loadingOverlay.classList.remove('active');
            if (!sampleCust) {
                emptyState.style.display = 'block';
                document.getElementById('emptyMessage').textContent =
                    `Nomor internet "${no}" tidak terdaftar dalam sistem kami. Pastikan nomor yang Anda masukkan benar.`;
            } else {
                showResultFromSample(no, sampleCust);
            }
            return;
        }

        // 2. Ambil histori pembayaran
        const { data: pembayaran } = await db
            .from('informasi_pembayaran')
            .select('periode_tagihan, tanggal_bayar, status_lunas')
            .eq('no_internet', no)
            .order('periode_tagihan');

        // 3. Ambil poin & kupon
        const { data: poinArr } = await db
            .from('poin_dan_kupon')
            .select('total_poin, total_kupon')
            .eq('no_internet', no);

        const poinData = poinArr && poinArr.length > 0 ? poinArr[0] : { total_poin: 0, total_kupon: 0 };

        loadingOverlay.classList.remove('active');
        showResultFromSupabase(no, pelanggan, pembayaran || [], poinData);

    } catch (err) {
        console.error('Error Cek Poin:', err);
        loadingOverlay.classList.remove('active');
        // Try sample fallback
        const sampleCust = SAMPLE_CUSTOMERS[no];
        if (!sampleCust) {
            emptyState.style.display = 'block';
            document.getElementById('emptyMessage').textContent =
                `Terjadi kesalahan saat mencari data. Silakan coba lagi.`;
        } else {
            showResultFromSample(no, sampleCust);
        }
    }
}

function showResultFromSupabase(no, pelanggan, pembayaran, poinData) {
    const maskedName = maskName(pelanggan.nama_pelanggan);
    const totalPoin = poinData.total_poin || 0;
    const totalKupon = poinData.total_kupon || 0;

    // Customer info
    document.getElementById('customerName').textContent = maskedName;
    document.getElementById('customerNo').textContent = no;
    document.getElementById('customerCity').textContent = pelanggan.kota || '-';
    document.getElementById('avatarImg').src =
        `https://ui-avatars.com/api/?name=${encodeURIComponent(maskedName)}&background=1d4ed8&color=fff&size=80&bold=true`;

    // Build monthly table from pembayaran
    const tbody = document.getElementById('pointsBody');
    tbody.innerHTML = '';

    if (pembayaran.length > 0) {
        pembayaran.forEach(p => {
            const isBayar = p.status_lunas === true;
            const poin = isBayar ? calcPoin(pelanggan.nominal_tagihan || 0, true) : 0;
            const badgeClass = isBayar ? 'badge-paid' : 'badge-unpaid';
            const badgeLabel = isBayar ? 'Lunas' : 'Belum Bayar';
            const poinText = poin > 0 ? `<strong style="color:#fcd34d">+${poin}</strong>` : `<span style="color:#f87171">0</span>`;

            tbody.innerHTML += `
            <tr>
                <td>${p.periode_tagihan || '-'}</td>
                <td><span class="${badgeClass}">${badgeLabel}</span></td>
                <td>${poinText}</td>
            </tr>`;
        });
    } else {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color: var(--text-muted);">Belum ada data pembayaran.</td></tr>`;
    }

    // Total row
    document.getElementById('totalPoinTable').textContent = `${totalPoin.toLocaleString('id-ID')} Poin`;

    // Animate total values
    animateCounter('totalPoinDisplay', totalPoin);
    if (document.getElementById('totalKuponDisplay')) {
        animateCounter('totalKuponDisplay', totalKupon);
    }

    resultContainer.style.display = 'block';
    resultContainer.querySelectorAll('[data-aos]').forEach(el => {
        el.classList.remove('aos-animate');
        setTimeout(() => el.classList.add('aos-animate'), 50);
    });
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Fallback: show result from local sample data
function showResultFromSample(no, cust) {
    const months = Object.entries(cust.months);
    let totalPoin = 0;
    const maskedName = maskName(cust.name);

    document.getElementById('customerName').textContent = maskedName;
    document.getElementById('customerNo').textContent = no;
    document.getElementById('customerCity').textContent = cust.city;
    document.getElementById('avatarImg').src =
        `https://ui-avatars.com/api/?name=${encodeURIComponent(maskedName)}&background=1d4ed8&color=fff&size=80&bold=true`;

    const tbody = document.getElementById('pointsBody');
    tbody.innerHTML = '';

    months.forEach(([bulan, data]) => {
        const poin = calcPoin(data.tagihan, data.bayar);
        totalPoin += poin;
        const badgeClass = data.bayar ? 'badge-paid' : 'badge-unpaid';
        const badgeLabel = data.bayar ? 'Lunas' : 'Belum Bayar';
        const poinText = poin > 0 ? `<strong style="color:#fcd34d">+${poin}</strong>` : `<span style="color:#f87171">0</span>`;

        tbody.innerHTML += `
        <tr>
            <td>${bulan}</td>
            <td><span class="${badgeClass}">${badgeLabel}</span></td>
            <td>${poinText}</td>
        </tr>`;
    });

    document.getElementById('totalPoinTable').textContent = `${totalPoin.toLocaleString('id-ID')} Poin`;
    const totalKupon = Math.floor(totalPoin / 3);
    animateCounter('totalPoinDisplay', totalPoin);
    if (document.getElementById('totalKuponDisplay')) {
        animateCounter('totalKuponDisplay', totalKupon);
    }

    resultContainer.style.display = 'block';
    resultContainer.querySelectorAll('[data-aos]').forEach(el => {
        el.classList.remove('aos-animate');
        setTimeout(() => el.classList.add('aos-animate'), 50);
    });
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function animateCounter(elId, target) {
    const el = document.getElementById(elId);
    const dur = 1800;
    const start = performance.now();
    const from = 0;

    function step(now) {
        const prog = Math.min((now - start) / dur, 1);
        const ease = 1 - Math.pow(1 - prog, 4);
        el.textContent = Math.round(from + (target - from) * ease).toLocaleString('id-ID');
        if (prog < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}


/* ============================================================
   INIT
============================================================ */
function updatePodium() {
    const top3 = TOP_CUSTOMERS_DATA.slice(0, 3);
    top3.forEach(c => {
        const masked = maskName(c.name);
        const nameEl = document.getElementById(`podium-name-${c.rank}`);
        const imgEl = document.getElementById(`podium-img-${c.rank}`);
        if (nameEl) nameEl.textContent = masked;
        if (imgEl) {
            imgEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(masked)}&background=${c.rank === 1 ? 'FFD700' : (c.rank === 2 ? 'C0C0C0' : 'CD7F32')}&color=fff&size=${c.rank === 1 ? 100 : 80}&bold=true`;
        }
        // Update points display on podium
        const podiumItem = nameEl?.closest('.podium-item');
        if (podiumItem) {
            const pointsEl = podiumItem.querySelector('.podium-points');
            if (pointsEl) {
                pointsEl.innerHTML = `<i class="fas fa-star"></i> ${c.points.toLocaleString('id-ID')} Poin`;
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    initAOS();
    spawnParticles();
    await populateRanking();
    updatePodium();
});
