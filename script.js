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
   RANKING TABLE & PODIUM (Supabase)
============================================================ */
let topCustomersData = [];

async function loadTopCustomers() {
    try {
        // Ambil 10 data pelanggan dengan poin tertinggi
        const { data: poinData, error: errPoin } = await db
            .from('poin_dan_kupon')
            .select('no_internet, total_poin')
            .order('total_poin', { ascending: false })
            .limit(10);

        if (errPoin) throw errPoin;

        if (!poinData || poinData.length === 0) {
            console.log('Belum ada data Top Customer');
            document.getElementById('rankingBody').innerHTML = '<tr><td colspan="6">Belum ada data pelanggan</td></tr>';
            return;
        }

        // Ambil detail nama & kota
        const noInternetList = poinData.map(p => p.no_internet);
        const { data: pelangganData, error: errPelanggan } = await db
            .from('data_pelanggan')
            .select('no_internet, nama_pelanggan, kota')
            .in('no_internet', noInternetList);

        if (errPelanggan) throw errPelanggan;

        const pelangganMap = {};
        (pelangganData || []).forEach(p => pelangganMap[p.no_internet] = p);

        // Bentuk array data Top Customers
        topCustomersData = poinData.map((p, index) => {
            const detail = pelangganMap[p.no_internet] || {};
            return {
                rank: index + 1,
                name: detail.nama_pelanggan || '-',
                no: p.no_internet,
                city: detail.kota || '-',
                points: p.total_poin || 0,
                status: index < 3 ? 'top' : 'active'
            };
        });

        populateRanking();
        updatePodium();

    } catch (err) {
        console.error('Gagal memuat Top Customers dari Supabase:', err);
    }
}

function populateRanking() {
    const body = document.getElementById('rankingBody');
    if (!body) return;
    body.innerHTML = topCustomersData.map(c => {
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
            <td style="color:var(--text-body);font-size:0.85rem;">${maskName(c.no)}</td>
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

async function doCekPoin() {
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

    try {
        // Cek data pelanggan
        const { data: pelanggan, error: errPelanggan } = await db
            .from('data_pelanggan')
            .select('*')
            .eq('no_internet', no)
            .single();

        if (errPelanggan || !pelanggan) {
            throw new Error('Pelanggan tidak ditemukan');
        }

        // Cek poin
        const { data: poin, error: errPoin } = await db
            .from('poin_dan_kupon')
            .select('*')
            .eq('no_internet', no)
            .single();

        // Cek pembayaran
        const { data: pembayaran, error: errPembayaran } = await db
            .from('informasi_pembayaran')
            .select('*')
            .eq('no_internet', no)
            .single();

        loadingOverlay.classList.remove('active');
        showResult(no, pelanggan, poin || { total_poin: 0, total_kupon: 0 }, pembayaran);

    } catch (err) {
        console.error('Error Cek Poin:', err);
        loadingOverlay.classList.remove('active');
        emptyState.style.display = 'block';
        document.getElementById('emptyMessage').textContent =
            `Nomor internet "${no}" tidak terdaftar dalam sistem kami. Pastikan nomor yang Anda masukkan benar.`;
    }
}

function showResult(no, pelanggan, poin, pembayaran) {
    const maskedName = maskName(pelanggan.nama_pelanggan);
    const totalPoin = poin.total_poin || 0;
    const totalKupon = poin.total_kupon || 0;

    // Customer info
    document.getElementById('customerName').textContent = maskedName;
    document.getElementById('customerNo').textContent = maskName(no); // Menyamarkan nomor
    document.getElementById('customerCity').textContent = pelanggan.kota || '-';
    document.getElementById('avatarImg').src =
        `https://ui-avatars.com/api/?name=${encodeURIComponent(maskedName)}&background=1d4ed8&color=fff&size=80&bold=true`;

    // Build monthly table
    const tbody = document.getElementById('pointsBody');
    tbody.innerHTML = '';

    const months = ['4', '5', '6']; // Merepresentasikan bln_4, bln_5, bln_6
    const monthNames = ['April 2026', 'Mei 2026', 'Juni 2026'];

    months.forEach((m, idx) => {
        const isPaid = pembayaran ? pembayaran[`bln_${m}`] : false;
        // Asumsi nilai poin jika bayar = 1/3 dari total poin sementara (karena simulasi riwayat)
        // Jika butuh hitungan akurat dari tagihan, harus ada field tagihan per bulan.
        // Di sini kita tunjukkan status bayar saja dengan pembagian poin rata 
        let currentPoin = isPaid ? Math.floor(totalPoin / 3) : 0; 

        const badgeClass = isPaid ? 'badge-paid' : 'badge-unpaid';
        const badgeLabel = isPaid ? 'Lunas' : 'Belum Bayar';
        const poinText = currentPoin > 0 ? `<strong style="color:#fcd34d">+${currentPoin}</strong>` : `<span style="color:#f87171">0</span>`;

        tbody.innerHTML += `
        <tr>
            <td>${monthNames[idx]}</td>
            <td><span class="${badgeClass}">${badgeLabel}</span></td>
            <td>${poinText}</td>
        </tr>`;
    });

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

function updatePodium() {
    if (!topCustomersData || topCustomersData.length === 0) return;
    
    const top3 = topCustomersData.slice(0, 3);
    top3.forEach(c => {
        const masked = maskName(c.name);
        const nameEl = document.getElementById(`podium-name-${c.rank}`);
        const imgEl = document.getElementById(`podium-img-${c.rank}`);
        if (nameEl) nameEl.textContent = masked;
        if (imgEl) {
            imgEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(masked)}&background=${c.rank === 1 ? 'FFD700' : (c.rank === 2 ? 'C0C0C0' : 'CD7F32')}&color=fff&size=${c.rank === 1 ? 100 : 80}&bold=true`;
        }
        
        const locEl = nameEl ? nameEl.nextElementSibling.nextElementSibling : null;
        if(locEl) locEl.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${c.city}`;
        
        const poinEl = nameEl ? nameEl.nextElementSibling : null;
        if(poinEl) poinEl.innerHTML = `<i class="fas fa-star"></i> ${c.points.toLocaleString('id-ID')} Poin`;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initAOS();
    spawnParticles();
    loadTopCustomers(); // Supabase Fetch
});
