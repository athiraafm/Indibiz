/* ==================================================
   PENGUNDIAN PAGE – script.js
   Slot machine animation, confetti, winner reveal
================================================== */

/* ============================================================
   SAMPLE KUPON DATA (In production, load from admin data)
============================================================ */
const KUPON_DATA = [
    { kode: 'IB2501', noInternet: '1234567890', name: 'Ahmad Fauzi', city: 'Banjarmasin', kupon: 37 },
    { kode: 'IB2502', noInternet: '1122334455', name: 'Budi Santoso', city: 'Pontianak', kupon: 63 },
    { kode: 'IB2503', noInternet: '3344556677', name: 'Rizky Pratama', city: 'Palangkaraya', kupon: 33 },
    { kode: 'IB2504', noInternet: '6677889900', name: 'Andi Saputra', city: 'Bontang', kupon: 28 },
    { kode: 'IB2505', noInternet: '4455667788', name: 'Hendra Wijaya', city: 'Singkawang', kupon: 36 },
    { kode: 'IB2506', noInternet: '5566778899', name: 'Nur Hidayah', city: 'Tarakan', kupon: 17 },
    { kode: 'IB2507', noInternet: '0987654321', name: 'Siti Rahmawati', city: 'Balikpapan', kupon: 15 },
    { kode: 'IB2508', noInternet: '7788990011', name: 'Maya Putri', city: 'Banjarbaru', kupon: 25 },
];

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
let isRunning = false;
let spinIntervals = [];

/* ============================================================
   FLOATING PARTICLES
============================================================ */
function createParticles() {
    const container = document.getElementById('particles');
    const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#fbbf24', '#60a5fa', '#f472b6'];

    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const size = Math.random() * 6 + 2;
        const color = colors[Math.floor(Math.random() * colors.length)];

        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            left: ${Math.random() * 100}%;
            animation-duration: ${Math.random() * 15 + 10}s;
            animation-delay: ${Math.random() * 10}s;
            box-shadow: 0 0 ${size * 2}px ${color};
        `;
        container.appendChild(particle);
    }
}
createParticles();

/* ============================================================
   INITIAL SLOT ANIMATION (idle randomizing)
============================================================ */
function startIdleAnimation() {
    const reels = document.querySelectorAll('.slot-reel');
    reels.forEach((reel) => {
        setInterval(() => {
            if (!isRunning) {
                reel.querySelector('span').textContent = CHARS[Math.floor(Math.random() * CHARS.length)];
            }
        }, 150 + Math.random() * 200);
    });
}
startIdleAnimation();

/* ============================================================
   START LOTTERY
============================================================ */
function startLottery() {
    if (isRunning) return;
    isRunning = true;

    const btn = document.getElementById('btnStart');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>MENGUNDI...</span>';

    const statusText = document.getElementById('statusText');
    statusText.textContent = 'Mengundi kupon pemenang...';

    const slotContainer = document.getElementById('slotContainer');
    slotContainer.classList.add('active');

    // Pick random winner
    const winner = KUPON_DATA[Math.floor(Math.random() * KUPON_DATA.length)];
    const winnerCode = winner.kode.split('');

    // Start spinning all reels fast
    const reels = document.querySelectorAll('#slotContainer .slot-reel');
    reels.forEach((reel) => {
        reel.classList.add('spinning');
    });

    // Fast random for all reels
    spinIntervals = [];
    reels.forEach((reel, i) => {
        const interval = setInterval(() => {
            reel.querySelector('span').textContent = CHARS[Math.floor(Math.random() * CHARS.length)];
        }, 50);
        spinIntervals.push(interval);
    });

    // Reveal each reel one by one with dramatic delay
    const revealDelay = 1200;
    const startDelay = 2000;

    reels.forEach((reel, i) => {
        setTimeout(() => {
            // Stop spinning this reel
            clearInterval(spinIntervals[i]);
            reel.classList.remove('spinning');
            reel.classList.add('revealed');

            // Set the final character
            reel.querySelector('span').textContent = winnerCode[i] || '';

            // Sound-like visual feedback
            reel.style.transform = 'scale(1.15)';
            setTimeout(() => {
                reel.style.transform = 'scale(1.05)';
            }, 150);

            // After last reel revealed
            if (i === reels.length - 1) {
                setTimeout(() => {
                    showWinner(winner);
                }, 800);
            }
        }, startDelay + (i * revealDelay));
    });
}

/* ============================================================
   SHOW WINNER
============================================================ */
function showWinner(winner) {
    const statusText = document.getElementById('statusText');
    statusText.textContent = '🎉 Pemenang telah terpilih! 🎉';
    statusText.style.color = '#fbbf24';
    statusText.style.fontSize = '1.2rem';
    statusText.style.fontWeight = '700';

    // Show winner section
    const winnerSection = document.getElementById('winnerSection');
    winnerSection.style.display = 'flex';

    // Populate winner slot display
    const winnerSlotBox = document.getElementById('winnerSlotBox');
    winnerSlotBox.innerHTML = winner.kode.split('').map(char =>
        `<div class="slot-reel"><span>${char}</span></div>`
    ).join('');

    // Populate winner info
    document.getElementById('winnerNo').textContent = winner.noInternet;
    document.getElementById('winnerName').textContent = winner.name;
    document.getElementById('winnerCity').textContent = winner.city;
    document.getElementById('winnerKupon').textContent = winner.kupon + ' kupon';

    // Start confetti
    launchConfetti();

    // Scroll to winner section smoothly
    setTimeout(() => {
        winnerSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 500);
}

/* ============================================================
   CONFETTI SYSTEM
============================================================ */
function launchConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = [];
    const colors = ['#fbbf24', '#f472b6', '#60a5fa', '#a78bfa', '#34d399', '#fb923c', '#f87171'];
    const totalPieces = 200;

    for (let i = 0; i < totalPieces; i++) {
        pieces.push({
            x: Math.random() * canvas.width,
            y: Math.random() * -canvas.height,
            w: Math.random() * 10 + 5,
            h: Math.random() * 5 + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            rotSpeed: (Math.random() - 0.5) * 10,
            speedY: Math.random() * 3 + 2,
            speedX: (Math.random() - 0.5) * 4,
            oscillation: Math.random() * Math.PI * 2,
            oscillationSpeed: Math.random() * 0.02 + 0.01,
        });
    }

    let frame = 0;
    const maxFrames = 400; // ~6.7 seconds at 60fps

    function drawConfetti() {
        if (frame > maxFrames) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        pieces.forEach(p => {
            p.y += p.speedY;
            p.x += p.speedX + Math.sin(p.oscillation) * 0.5;
            p.oscillation += p.oscillationSpeed;
            p.rotation += p.rotSpeed;

            // Fade out near the end
            const alpha = frame > maxFrames - 60 ? (maxFrames - frame) / 60 : 1;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.restore();

            // Reset pieces that fall off screen
            if (p.y > canvas.height + 20) {
                p.y = -20;
                p.x = Math.random() * canvas.width;
            }
        });

        frame++;
        requestAnimationFrame(drawConfetti);
    }

    drawConfetti();

    // Handle resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

/* ============================================================
   VALIDATE & FINISH
============================================================ */
function validateWinner() {
    const btn = event.target.closest('button');
    btn.innerHTML = '<i class="fas fa-check-circle"></i> TERVALIDASI';
    btn.style.background = 'linear-gradient(135deg, #059669, #047857)';
    btn.disabled = true;
    btn.style.cursor = 'not-allowed';

    // Re-launch confetti celebration  
    launchConfetti();
}

function finishLottery() {
    if (confirm('Apakah Anda yakin ingin mengakhiri sesi pengundian?')) {
        // Reset everything
        isRunning = false;

        const btn = document.getElementById('btnStart');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-play"></i><span>START</span>';

        const statusText = document.getElementById('statusText');
        statusText.textContent = 'Tekan START untuk memulai pengundian';
        statusText.style.color = 'rgba(255, 255, 255, 0.6)';
        statusText.style.fontSize = '0.95rem';
        statusText.style.fontWeight = '400';

        const slotContainer = document.getElementById('slotContainer');
        slotContainer.classList.remove('active');

        const reels = document.querySelectorAll('#slotContainer .slot-reel');
        reels.forEach(reel => {
            reel.classList.remove('spinning', 'revealed');
            reel.style.transform = '';
        });

        document.getElementById('winnerSection').style.display = 'none';

        // Scroll back to top
        document.getElementById('lotterySection').scrollIntoView({ behavior: 'smooth' });

        // Clear confetti
        const canvas = document.getElementById('confettiCanvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}
