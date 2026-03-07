/* ==================================================
   PENGUNDIAN PAGE – script.js
   Slot machine animation, confetti, winner reveal
   Sound effects via Web Audio API
================================================== */

/* ============================================================
   SAMPLE KUPON DATA (In production, load from admin data)
============================================================ */
const KUPON_DATA = [
    { noInternet: '1234567890', name: 'Ahmad Fauzi', city: 'Banjarmasin', kupon: 37 },
    { noInternet: '1122334455', name: 'Budi Santoso', city: 'Pontianak', kupon: 63 },
    { noInternet: '3344556677', name: 'Rizky Pratama', city: 'Palangkaraya', kupon: 33 },
    { noInternet: '6677889900', name: 'Andi Saputra', city: 'Bontang', kupon: 28 },
    { noInternet: '4455667788', name: 'Hendra Wijaya', city: 'Singkawang', kupon: 36 },
    { noInternet: '5566778899', name: 'Nur Hidayah', city: 'Tarakan', kupon: 17 },
    { noInternet: '0987654321', name: 'Siti Rahmawati', city: 'Balikpapan', kupon: 15 },
    { noInternet: '7788990011', name: 'Maya Putri', city: 'Banjarbaru', kupon: 25 },
];

const DIGITS = '0123456789';
const NUM_REELS = 10; // 10-digit internet number
let isRunning = false;
let isSpinning = false;
let spinIntervals = [];
let selectedWinner = null;

/* ============================================================
   WEB AUDIO API - SOUND EFFECTS
============================================================ */
let audioCtx = null;
let spinOscillator = null;
let spinGain = null;

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}

/* --- Roulette Spinning Sound --- */
function startSpinSound() {
    try {
        const ctx = getAudioContext();

        // Create a "roulette tick" effect using modulated oscillator
        spinOscillator = ctx.createOscillator();
        spinGain = ctx.createGain();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();

        // Modulated tone for spinning feel
        spinOscillator.type = 'square';
        spinOscillator.frequency.value = 220;

        lfo.type = 'sawtooth';
        lfo.frequency.value = 12; // tick rate
        lfoGain.gain.value = 180;

        lfo.connect(lfoGain);
        lfoGain.connect(spinOscillator.frequency);

        spinGain.gain.value = 0.08;

        spinOscillator.connect(spinGain);
        spinGain.connect(ctx.destination);

        spinOscillator.start();
        lfo.start();

        // Store for cleanup
        spinOscillator._lfo = lfo;
        spinOscillator._lfoGain = lfoGain;
    } catch (e) {
        console.log('Audio not supported:', e);
    }
}

function stopSpinSound() {
    try {
        if (spinOscillator) {
            spinOscillator.stop();
            if (spinOscillator._lfo) spinOscillator._lfo.stop();
            spinOscillator = null;
        }
        if (spinGain) {
            spinGain = null;
        }
    } catch (e) {
        console.log('Error stopping spin sound:', e);
    }
}

/* --- Celebration Sound (fanfare/applause-like) --- */
function playCelebrationSound() {
    try {
        const ctx = getAudioContext();
        const duration = 2.5;
        const now = ctx.currentTime;

        // Fanfare chord sequence
        const frequencies = [
            [523.25, 659.25, 783.99],  // C major
            [587.33, 739.99, 880.00],  // D major
            [659.25, 830.61, 987.77],  // E major
            [698.46, 880.00, 1046.50], // F major
            [783.99, 987.77, 1174.66], // G major
        ];

        frequencies.forEach((chord, i) => {
            chord.forEach(freq => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.value = freq;

                gain.gain.setValueAtTime(0, now + i * 0.3);
                gain.gain.linearRampToValueAtTime(0.06, now + i * 0.3 + 0.05);
                gain.gain.linearRampToValueAtTime(0.03, now + i * 0.3 + 0.25);
                gain.gain.linearRampToValueAtTime(0, now + duration);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(now + i * 0.3);
                osc.stop(now + duration);
            });
        });

        // Cymbal crash (white noise burst)
        const bufferSize = ctx.sampleRate * 0.5;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
        }
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.15, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
        noise.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start(now);
        noise.stop(now + 1.5);

        // "Ding" sound
        const ding = ctx.createOscillator();
        const dingGain = ctx.createGain();
        ding.type = 'sine';
        ding.frequency.value = 1318.51; // High E
        dingGain.gain.setValueAtTime(0.2, now);
        dingGain.gain.exponentialRampToValueAtTime(0.001, now + 2);
        ding.connect(dingGain);
        dingGain.connect(ctx.destination);
        ding.start(now);
        ding.stop(now + 2);

    } catch (e) {
        console.log('Audio not supported:', e);
    }
}

/* ============================================================
   FLOATING PARTICLES - MORE FESTIVE
============================================================ */
function createParticles() {
    const container = document.getElementById('particles');
    const colors = ['#1d4ed8', '#7c3aed', '#db2777', '#d97706', '#0891b2', '#059669', '#f59e0b', '#ec4899'];
    const shapes = ['circle', 'square', 'diamond', 'star'];

    for (let i = 0; i < 80; i++) {
        const particle = document.createElement('div');
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        particle.className = `particle particle-${shape}`;
        const size = Math.random() * 8 + 3;
        const color = colors[Math.floor(Math.random() * colors.length)];

        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            left: ${Math.random() * 100}%;
            animation-duration: ${Math.random() * 15 + 8}s;
            animation-delay: ${Math.random() * 10}s;
            box-shadow: 0 0 ${size * 3}px ${color};
            opacity: 0;
        `;

        if (shape === 'diamond') {
            particle.style.transform = 'rotate(45deg)';
        }
        if (shape === 'star') {
            particle.innerHTML = '<i class="fas fa-star" style="font-size:' + size + 'px; color:' + color + ';"></i>';
            particle.style.background = 'none';
            particle.style.boxShadow = 'none';
        }

        container.appendChild(particle);
    }

    // Add ribbon-like particles
    for (let i = 0; i < 20; i++) {
        const ribbon = document.createElement('div');
        ribbon.className = 'particle particle-ribbon';
        const color = colors[Math.floor(Math.random() * colors.length)];
        ribbon.style.cssText = `
            width: ${Math.random() * 20 + 10}px;
            height: 3px;
            background: ${color};
            left: ${Math.random() * 100}%;
            animation-duration: ${Math.random() * 12 + 8}s;
            animation-delay: ${Math.random() * 8}s;
            box-shadow: 0 0 6px ${color};
            border-radius: 2px;
            opacity: 0;
        `;
        container.appendChild(ribbon);
    }
}
createParticles();

/* ============================================================
   INITIAL SLOT ANIMATION (idle randomizing)
============================================================ */
function startIdleAnimation() {
    const reels = document.querySelectorAll('#slotBox .slot-reel');
    reels.forEach((reel) => {
        setInterval(() => {
            if (!isRunning) {
                reel.querySelector('span').textContent = DIGITS[Math.floor(Math.random() * DIGITS.length)];
            }
        }, 150 + Math.random() * 200);
    });
}
startIdleAnimation();

/* ============================================================
   START LOTTERY - Begin spinning (continuous)
============================================================ */
function startLottery() {
    if (isRunning) return;
    isRunning = true;
    isSpinning = true;

    // Pick random winner NOW (but don't reveal yet)
    selectedWinner = KUPON_DATA[Math.floor(Math.random() * KUPON_DATA.length)];

    const btnStart = document.getElementById('btnStart');
    const btnStop = document.getElementById('btnStop');

    btnStart.style.display = 'none';
    btnStop.style.display = 'flex';

    const statusText = document.getElementById('statusText');
    statusText.textContent = 'Mengundi nomor internet pemenang... Tekan STOP untuk berhenti!';

    const slotContainer = document.getElementById('slotContainer');
    slotContainer.classList.add('active');

    // Start spinning all reels fast
    const reels = document.querySelectorAll('#slotBox .slot-reel');
    reels.forEach((reel) => {
        reel.classList.add('spinning');
        reel.classList.remove('revealed');
    });

    // Fast random for all reels continuously
    spinIntervals = [];
    reels.forEach((reel) => {
        const interval = setInterval(() => {
            reel.querySelector('span').textContent = DIGITS[Math.floor(Math.random() * DIGITS.length)];
        }, 50);
        spinIntervals.push(interval);
    });

    // Start spinning sound
    startSpinSound();
}

/* ============================================================
   STOP LOTTERY - Instant reveal all at once
============================================================ */
function stopLottery() {
    if (!isSpinning || !selectedWinner) return;
    isSpinning = false;

    // Stop spinning sound
    stopSpinSound();

    const winnerDigits = selectedWinner.noInternet.split('');

    // Stop ALL spinning instantly and show the result
    const reels = document.querySelectorAll('#slotBox .slot-reel');
    reels.forEach((reel, i) => {
        clearInterval(spinIntervals[i]);
        reel.classList.remove('spinning');
        reel.classList.add('revealed');
        reel.querySelector('span').textContent = winnerDigits[i] || '0';
    });

    // Visual pop effect
    reels.forEach((reel) => {
        reel.style.transform = 'scale(1.15)';
        setTimeout(() => {
            reel.style.transform = 'scale(1.05)';
        }, 200);
    });

    // Play celebration sound
    playCelebrationSound();

    // Hide STOP button
    const btnStop = document.getElementById('btnStop');
    btnStop.style.display = 'none';

    // Show winner after small delay
    setTimeout(() => {
        showWinner(selectedWinner);
    }, 800);
}

/* ============================================================
   SHOW WINNER
============================================================ */
function showWinner(winner) {
    const statusText = document.getElementById('statusText');
    statusText.textContent = 'Pemenang telah terpilih!';
    statusText.style.color = '#b45309';
    statusText.style.fontSize = '1.2rem';
    statusText.style.fontWeight = '700';

    // Show winner section
    const winnerSection = document.getElementById('winnerSection');
    winnerSection.style.display = 'flex';

    // Populate winner slot display
    const winnerSlotBox = document.getElementById('winnerSlotBox');
    winnerSlotBox.innerHTML = winner.noInternet.split('').map(char =>
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
    const colors = ['#fbbf24', '#f472b6', '#60a5fa', '#a78bfa', '#34d399', '#fb923c', '#f87171', '#818cf8', '#f9a8d4'];
    const totalPieces = 300;

    for (let i = 0; i < totalPieces; i++) {
        pieces.push({
            x: Math.random() * canvas.width,
            y: Math.random() * -canvas.height,
            w: Math.random() * 12 + 4,
            h: Math.random() * 6 + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            rotSpeed: (Math.random() - 0.5) * 12,
            speedY: Math.random() * 4 + 2,
            speedX: (Math.random() - 0.5) * 5,
            oscillation: Math.random() * Math.PI * 2,
            oscillationSpeed: Math.random() * 0.03 + 0.01,
            shape: Math.random() > 0.5 ? 'rect' : 'circle',
        });
    }

    let frame = 0;
    const maxFrames = 500;

    function drawConfetti() {
        if (frame > maxFrames) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        pieces.forEach(p => {
            p.y += p.speedY;
            p.x += p.speedX + Math.sin(p.oscillation) * 0.8;
            p.oscillation += p.oscillationSpeed;
            p.rotation += p.rotSpeed;

            // Fade out near the end
            const alpha = frame > maxFrames - 80 ? (maxFrames - frame) / 80 : 1;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;

            if (p.shape === 'circle') {
                ctx.beginPath();
                ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            }

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
    playCelebrationSound();
}

function finishLottery() {
    if (confirm('Apakah Anda yakin ingin melakukan pengundian lagi?')) {
        // Reset everything
        isRunning = false;
        isSpinning = false;
        selectedWinner = null;

        // Clear any remaining spin intervals
        spinIntervals.forEach(interval => clearInterval(interval));
        spinIntervals = [];

        const btnStart = document.getElementById('btnStart');
        const btnStop = document.getElementById('btnStop');
        btnStart.style.display = 'flex';
        btnStop.style.display = 'none';
        btnStart.disabled = false;
        btnStart.innerHTML = '<i class="fas fa-play"></i><span>START</span>';

        const statusText = document.getElementById('statusText');
        statusText.textContent = 'Tekan START untuk memulai pengundian';
        statusText.style.color = '#64748b';
        statusText.style.fontSize = '0.95rem';
        statusText.style.fontWeight = '400';

        const slotContainer = document.getElementById('slotContainer');
        slotContainer.classList.remove('active');

        const reels = document.querySelectorAll('#slotBox .slot-reel');
        reels.forEach(reel => {
            reel.classList.remove('spinning', 'revealed');
            reel.style.transform = '';
        });

        document.getElementById('winnerSection').style.display = 'none';

        // Reset validate button
        const validBtns = document.querySelectorAll('.btn-valid');
        validBtns.forEach(btn => {
            btn.innerHTML = '<i class="fas fa-check-circle"></i> VALID';
            btn.style.background = '';
            btn.disabled = false;
            btn.style.cursor = '';
        });

        // Scroll back to top
        document.getElementById('lotterySection').scrollIntoView({ behavior: 'smooth' });

        // Clear confetti
        const canvas = document.getElementById('confettiCanvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}
