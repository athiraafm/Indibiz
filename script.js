/* ==================================================
   INDIBIZ UNDIAN – script.js
   Slider | AOS | Particles | Ranking | Cek Poin
================================================== */

/* ============================================================
   MOCK DATABASE – edit here to match real data
============================================================ */
const CUSTOMERS = {
    '1234567890': {
        name: 'CV. S*** M***',
        city: 'Banjarmasin',
        package: 'IndiBiz High Speed 100Mbps',
        months: {
            'April 2025': { tagihan: 1250000, bayar: true },
            'Mei 2025': { tagihan: 1250000, bayar: true },
            'Juni 2025': { tagihan: 1250000, bayar: true }
        }
    },
    '0987654321': {
        name: 'PT. M*** B***',
        city: 'Balikpapan',
        package: 'IndiBiz Basic 50Mbps',
        months: {
            'April 2025': { tagihan: 750000, bayar: true },
            'Mei 2025': { tagihan: 750000, bayar: true },
            'Juni 2025': { tagihan: 750000, bayar: false }
        }
    },
    '1122334455': {
        name: 'UD. S*** J***',
        city: 'Pontianak',
        package: 'IndiBiz Pro 200Mbps',
        months: {
            'April 2025': { tagihan: 2100000, bayar: true },
            'Mei 2025': { tagihan: 2100000, bayar: true },
            'Juni 2025': { tagihan: 2100000, bayar: true }
        }
    },
    '5544332211': {
        name: 'Toko B*** S***',
        city: 'Samarinda',
        package: 'IndiBiz Basic 50Mbps',
        months: {
            'April 2025': { tagihan: 750000, bayar: true },
            'Mei 2025': { tagihan: 750000, bayar: false },
            'Juni 2025': { tagihan: 750000, bayar: false }
        }
    }
};

const TOP_CUSTOMERS_DATA = [
    { rank: 1, name: "CV. S*** M***", no: "1234567890", city: "Banjarmasin", points: 12540, status: "top" },
    { rank: 2, name: "PT. M*** B***", no: "0987654321", city: "Balikpapan", points: 9850, status: "top" },
    { rank: 3, name: "UD. S*** J***", no: "1122334455", city: "Pontianak", points: 8320, status: "top" },
    { rank: 4, name: "Toko B*** S***", no: "5544332211", city: "Samarinda", points: 7100, status: "active" },
    { rank: 5, name: "CV. B*** U***", no: "3344556677", city: "Palangkaraya", points: 6840, status: "active" },
    { rank: 6, name: "T*** E*** P***", no: "5566778899", city: "Tarakan", points: 6200, status: "active" },
    { rank: 7, name: "PT. G*** N***", no: "4455667788", city: "Singkawang", points: 5980, status: "active" },
    { rank: 8, name: "UD. H*** B***", no: "6677889900", city: "Bontang", points: 5430, status: "active" },
    { rank: 9, name: "CV. M*** S***", no: "7788990011", city: "Banjarbaru", points: 4960, status: "active" },
    { rank: 10, name: "PT. M*** A***", no: "8899001122", city: "Tenggarong", points: 4520, status: "active" },
];

function getMultiplier(tanggalBayar) {
    if (!tanggalBayar || tanggalBayar <= 0) return 0;
    if (tanggalBayar >= 1 && tanggalBayar <= 10) return 3;
    if (tanggalBayar >= 11 && tanggalBayar <= 15) return 2;
    if (tanggalBayar >= 16 && tanggalBayar <= 20) return 1;
    return 0;
}

function calcPoin(tagihan, bayar, tanggalBayar) {
    if (!bayar) return 0;
    const base = Math.floor(tagihan / 100000);
    return base * getMultiplier(tanggalBayar || 0);
}

function formatRp(num) {
    return new Intl.NumberFormat('id-ID').format(num);
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
   RANKING TABLE
============================================================ */
function populateRanking() {
    const body = document.getElementById('rankingBody');
    if (!body) return;

    // Use published data from admin if available, else fallback to mock
    const published = localStorage.getItem('publishedRanking');
    const data = published ? JSON.parse(published).map((c, idx) => ({
        rank: idx + 1,
        name: c.censoredName || c.name,
        no: c.no,
        city: c.city,
        points: c.poin,
        status: idx < 3 ? 'top' : 'active'
    })) : TOP_CUSTOMERS_DATA;

    body.innerHTML = data.map(c => {
        let rankClass = 'rank-normal';
        if (c.rank === 1) rankClass = 'rank-gold';
        else if (c.rank === 2) rankClass = 'rank-silver';
        else if (c.rank === 3) rankClass = 'rank-bronze';
        const statusClass = c.status === 'top' ? 'status-top' : 'status-active';
        const statusLabel = c.status === 'top' ? 'Top Customer' : 'Aktif';
        return `
        <tr>
            <td><span class="rank-badge ${rankClass}">${c.rank}</span></td>
            <td><strong>${c.name}</strong></td>
            <td style="color:rgba(255,255,255,0.55);font-size:0.85rem;">${c.no}</td>
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

    setTimeout(() => {
        loadingOverlay.classList.remove('active');

        // Use published customer data if available, else fallback to mock
        const publishedStr = localStorage.getItem('publishedCustomers');
        const customerDB = publishedStr ? JSON.parse(publishedStr) : CUSTOMERS;
        const customer = customerDB[no];

        if (!customer) {
            emptyState.style.display = 'block';
            document.getElementById('emptyMessage').textContent =
                `Nomor internet "${no}" tidak terdaftar dalam sistem kami. Pastikan nomor yang Anda masukkan benar.`;
        } else {
            showResult(no, customer);
        }
    }, 1600);
}

function showResult(no, cust) {
    const months = Object.entries(cust.months);
    let totalPoin = 0;

    // Customer info
    document.getElementById('customerName').textContent = cust.name;
    document.getElementById('customerNo').textContent = no;
    document.getElementById('customerCity').textContent = cust.city;
    document.getElementById('customerPackage').textContent = cust.package;
    document.getElementById('avatarImg').src =
        `https://ui-avatars.com/api/?name=${encodeURIComponent(cust.name)}&background=1d4ed8&color=fff&size=80&bold=true`;

    // Build monthly table
    const tbody = document.getElementById('pointsBody');
    tbody.innerHTML = '';
    const poinPerBulan = [];

    months.forEach(([bulan, data]) => {
        const poin = calcPoin(data.tagihan, data.bayar, data.tanggalBayar || 0);
        totalPoin += poin;
        poinPerBulan.push({ bulan, poin });

        const badgeClass = data.bayar ? 'badge-paid' : 'badge-unpaid';
        const badgeLabel = data.bayar ? 'Lunas' : 'Belum Bayar';
        const poinText = poin > 0 ? `<strong style="color:#fcd34d">+${poin}</strong>` : `<span style="color:#f87171">0</span>`;

        tbody.innerHTML += `
        <tr>
            <td>${bulan}</td>
            <td>Rp ${formatRp(data.tagihan)}</td>
            <td><span class="${badgeClass}">${badgeLabel}</span></td>
            <td>${poinText}</td>
        </tr>`;
    });

    // Total row
    document.getElementById('totalPoinTable').textContent = `${totalPoin.toLocaleString('id-ID')} Poin`;

    const totalKupon = Math.floor(totalPoin / 3);

    // Animate total values
    animateCounter('totalPoinDisplay', totalPoin);
    if (document.getElementById('totalKuponDisplay')) {
        animateCounter('totalKuponDisplay', totalKupon);
    }

    // Build chart
    buildChart(poinPerBulan);

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

function buildChart(data) {
    const container = document.getElementById('chartContainer');
    container.innerHTML = '';
    const maxPoin = Math.max(...data.map(d => d.poin), 1);

    data.forEach(({ bulan, poin }) => {
        const heightPct = (poin / maxPoin) * 100;
        const wrap = document.createElement('div');
        wrap.className = 'chart-bar-wrap';
        wrap.innerHTML = `
            <div class="chart-bar-val">${poin}</div>
            <div class="chart-bar" style="height:0;" data-height="${heightPct}">
                <span class="chart-bar-label">${bulan}</span>
            </div>`;
        container.appendChild(wrap);
    });

    // Animate bars in
    setTimeout(() => {
        container.querySelectorAll('.chart-bar').forEach(bar => {
            bar.style.height = bar.dataset.height + '%';
        });
    }, 200);
}

/* ============================================================
   INIT
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    initAOS();
    spawnParticles();
    populateRanking();
});
