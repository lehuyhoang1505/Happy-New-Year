// ===== VIETNAMESE LUNAR CALENDAR CONVERSION =====
// Based on Vietnamese lunar calendar calculations

// Can and Chi arrays for Vietnamese calendar
const CAN = ["Canh", "Tân", "Nhâm", "Quý", "Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ"];
const CHI = ["Thân", "Dậu", "Tuất", "Hợi", "Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi"];

// Julian day number calculation
function jdFromDate(dd, mm, yy) {
    const a = Math.floor((14 - mm) / 12);
    const y = yy + 4800 - a;
    const m = mm + 12 * a - 3;
    let jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    if (jd < 2299161) {
        jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;
    }
    return jd;
}

function getNewMoonDay(k, timeZone) {
    const T = k / 1236.85;
    const T2 = T * T;
    const T3 = T2 * T;
    const dr = Math.PI / 180;
    let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
    Jd1 = Jd1 + 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
    const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
    const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
    const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
    let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
    C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
    C1 = C1 - 0.0004 * Math.sin(dr * 3 * Mpr);
    C1 = C1 + 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
    C1 = C1 - 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
    C1 = C1 - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
    C1 = C1 + 0.0010 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));
    let deltat;
    if (T < -11) {
        deltat = 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3;
    } else {
        deltat = -0.000278 + 0.000265 * T + 0.000262 * T2;
    }
    const JdNew = Jd1 + C1 - deltat;
    return Math.floor(JdNew + 0.5 + timeZone / 24);
}

function getSunLongitude(jdn, timeZone) {
    const T = (jdn - 2451545.5 - timeZone / 24) / 36525;
    const T2 = T * T;
    const dr = Math.PI / 180;
    const M = 357.52910 + 35999.05030 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
    const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
    let DL = (1.914600 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
    DL = DL + (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.000290 * Math.sin(dr * 3 * M);
    let L = L0 + DL;
    L = L * dr;
    L = L - Math.PI * 2 * (Math.floor(L / (Math.PI * 2)));
    return Math.floor(L / Math.PI * 6);
}

function getLunarMonth11(yy, timeZone) {
    const off = jdFromDate(31, 12, yy) - 2415021;
    const k = Math.floor(off / 29.530588853);
    let nm = getNewMoonDay(k, timeZone);
    const sunLong = getSunLongitude(nm, timeZone);
    if (sunLong >= 9) {
        nm = getNewMoonDay(k - 1, timeZone);
    }
    return nm;
}

function getLeapMonthOffset(a11, timeZone) {
    const k = Math.floor((a11 - 2415021.076998695) / 29.530588853 + 0.5);
    let last = 0;
    let i = 1;
    let arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
    do {
        last = arc;
        i++;
        arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
    } while (arc !== last && i < 14);
    return i - 1;
}

function convertSolar2Lunar(dd, mm, yy, timeZone = 7) {
    const dayNumber = jdFromDate(dd, mm, yy);
    const k = Math.floor((dayNumber - 2415021.076998695) / 29.530588853);
    let monthStart = getNewMoonDay(k + 1, timeZone);
    if (monthStart > dayNumber) {
        monthStart = getNewMoonDay(k, timeZone);
    }
    let a11 = getLunarMonth11(yy, timeZone);
    let b11 = a11;
    let lunarYear;
    if (a11 >= monthStart) {
        lunarYear = yy;
        a11 = getLunarMonth11(yy - 1, timeZone);
    } else {
        lunarYear = yy + 1;
        b11 = getLunarMonth11(yy + 1, timeZone);
    }
    const lunarDay = dayNumber - monthStart + 1;
    const diff = Math.floor((monthStart - a11) / 29);
    let lunarLeap = 0;
    let lunarMonth = diff + 11;
    if (b11 - a11 > 365) {
        const leapMonthDiff = getLeapMonthOffset(a11, timeZone);
        if (diff >= leapMonthDiff) {
            lunarMonth = diff + 10;
            if (diff === leapMonthDiff) {
                lunarLeap = 1;
            }
        }
    }
    if (lunarMonth > 12) {
        lunarMonth = lunarMonth - 12;
    }
    if (lunarMonth >= 11 && diff < 4) {
        lunarYear -= 1;
    }
    return [lunarDay, lunarMonth, lunarYear, lunarLeap];
}

function getCanChi(lunarYear) {
    const can = CAN[(lunarYear + 6) % 10];
    const chi = CHI[(lunarYear + 8) % 12];
    return `${can} ${chi}`;
}

function getLunarYearAnimal(lunarYear) {
    const animals = ["Khỉ", "Gà", "Chó", "Lợn", "Tý", "Trâu", "Dần", "Mão", "Rồng", "Rắn", "Ngựa", "Dê"];
    return animals[(lunarYear + 8) % 12];
}

// Get lunar date for Tết (lunar new year detection)
function getTetDate(solarYear) {
    // Tết usually falls between late January and mid-February
    // Check from Jan 20 to Feb 20
    for (let month = 1; month <= 2; month++) {
        const endDay = month === 1 ? 31 : 20;
        for (let day = (month === 1 ? 20 : 1); day <= endDay; day++) {
            const [lunarDay, lunarMonth] = convertSolar2Lunar(day, month, solarYear);
            if (lunarDay === 1 && lunarMonth === 1) {
                return { day, month, year: solarYear };
            }
        }
    }
    return null;
}

// ===== Global Variables =====
let musicPlaying = false;
const music = document.getElementById('backgroundMusic');
const musicBtn = document.getElementById('musicBtn');
const musicIcon = document.getElementById('musicIcon');
const wishBtn = document.getElementById('wishBtn');
const shareBtn = document.getElementById('shareBtn');
const wishModal = document.getElementById('wishModal');
const shareModal = document.getElementById('shareModal');
const closeModal = document.querySelector('.close');
const closeShareModal = document.querySelector('.close-share');
const canvas = document.getElementById('fireworks');
const ctx = canvas.getContext('2d');

// ===== Canvas Setup =====
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// ===== Global State for New Year Detection =====
let hasTriggeredNewYear = false;
let hasTriggeredLunarNewYear = false;
let isNewYearCelebrating = false;
let newYearFireworksInterval = null;
let newYearFireworksTimeout = null;

// ===== Clock Auto-Collapse Feature =====
let inactivityTimer = null;
const INACTIVITY_DELAY = 3000; // 3 seconds
const clockContainer = document.querySelector('.clock-container');
let isClockExpanded = true;

function collapseClockPanel() {
    if (!isClockExpanded || isNewYearCelebrating) return;
    clockContainer.classList.add('collapsed');
    isClockExpanded = false;
}

function expandClockPanel() {
    if (isClockExpanded) return;
    clockContainer.classList.remove('collapsed');
    isClockExpanded = true;
}

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    expandClockPanel();
    inactivityTimer = setTimeout(collapseClockPanel, INACTIVITY_DELAY);
}

// Mouse and touch event listeners
clockContainer.addEventListener('mouseenter', () => {
    clearTimeout(inactivityTimer);
    expandClockPanel();
});

clockContainer.addEventListener('mouseleave', () => {
    inactivityTimer = setTimeout(collapseClockPanel, INACTIVITY_DELAY);
});

clockContainer.addEventListener('touchstart', (e) => {
    clearTimeout(inactivityTimer);
    expandClockPanel();
    // Prevent double-tap zoom on mobile
    e.preventDefault();
}, { passive: false });

clockContainer.addEventListener('touchend', () => {
    inactivityTimer = setTimeout(collapseClockPanel, INACTIVITY_DELAY);
});

// Global mouse/touch movement detection
document.addEventListener('mousemove', resetInactivityTimer);
document.addEventListener('mousedown', resetInactivityTimer);
document.addEventListener('keydown', resetInactivityTimer);
document.addEventListener('touchstart', resetInactivityTimer, { passive: true });
document.addEventListener('scroll', resetInactivityTimer, { passive: true });

// Start the inactivity timer on page load
resetInactivityTimer();

// ===== Clock Function with New Year Detection =====
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    document.getElementById('clock').textContent = `${hours}:${minutes}:${seconds}`;

    // Get lunar calendar information
    const solarDay = now.getDate();
    const solarMonth = now.getMonth() + 1;
    const solarYear = now.getFullYear();
    const [lunarDay, lunarMonth, lunarYear, lunarLeap] = convertSolar2Lunar(solarDay, solarMonth, solarYear);
    const canChi = getCanChi(lunarYear);

    // Display lunar calendar
    const leapText = lunarLeap === 1 ? 'nhuận ' : '';
    document.getElementById('lunarDate').innerHTML =
        `<span class="lunar-label">Âm lịch:</span> ${lunarDay}/${leapText}${lunarMonth}/${lunarYear}`;
    document.getElementById('lunarYear').innerHTML =
        `<span class="lunar-label">Năm:</span> ${canChi}`;

    // Get current year for dynamic countdown
    const currentYear = now.getFullYear();
    const newYear = new Date(`${currentYear + 1}-01-01T00:00:00`);
    const diff = newYear - now;

    // Check for Solar New Year transition (within 2 seconds of midnight)
    const isSolarNewYear = now.getMonth() === 0 && now.getDate() === 1 &&
        now.getHours() === 0 && now.getMinutes() === 0 &&
        now.getSeconds() < 2;

    // Check for Lunar New Year (Tết) transition
    const isLunarNewYear = lunarDay === 1 && lunarMonth === 1 &&
        now.getHours() === 0 && now.getMinutes() === 0 &&
        now.getSeconds() < 2;

    // Trigger Solar New Year celebration
    if (isSolarNewYear && !hasTriggeredNewYear) {
        triggerNewYearCelebration(false, solarYear + 1);
        hasTriggeredNewYear = true;
        setTimeout(() => { hasTriggeredNewYear = false; }, 60000);
    }

    // Trigger Lunar New Year (Tết) celebration - PRIORITY
    if (isLunarNewYear && !hasTriggeredLunarNewYear) {
        triggerNewYearCelebration(true, lunarYear, canChi);
        hasTriggeredLunarNewYear = true;
        setTimeout(() => { hasTriggeredLunarNewYear = false; }, 60000);
    }

    // Countdown to Tết (Lunar New Year)
    const tetDate = getTetDate(currentYear);
    if (tetDate) {
        const tetDateTime = new Date(tetDate.year, tetDate.month - 1, tetDate.day, 0, 0, 0);
        const tetDiff = tetDateTime - now;

        if (tetDiff > 0) {
            const days = Math.floor(tetDiff / (1000 * 60 * 60 * 24));
            const hrs = Math.floor((tetDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const mins = Math.floor((tetDiff % (1000 * 60 * 60)) / (1000 * 60));
            const secs = Math.floor((tetDiff % (1000 * 60)) / 1000);

            const nextLunarYear = lunarMonth === 12 ? lunarYear + 1 : lunarYear;
            const nextCanChi = getCanChi(nextLunarYear);

            document.getElementById('countdown').innerHTML =
                `🧧 Đến Tết ${nextCanChi}: <strong>${days}d ${hrs}h ${mins}m ${secs}s</strong>`;
        } else {
            document.getElementById('countdown').textContent = '🎊 Chúc Mừng Năm Mới! 🎊';
        }
    } else if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById('countdown').textContent =
            `Đến năm ${currentYear + 1}: ${days}d ${hrs}h ${mins}m ${secs}s`;
    } else {
        document.getElementById('countdown').textContent = '🎊 Chúc Mừng Năm Mới! 🎊';
    }
}

// ===== New Year Celebration Function =====
function triggerNewYearCelebration(isLunar = false, year = 2027, canChi = '') {
    if (isNewYearCelebrating) return;

    isNewYearCelebrating = true;

    // Expand and keep clock expanded during celebration
    clearTimeout(inactivityTimer);
    expandClockPanel();

    const messageElement = document.getElementById('newYearMessage');
    const titleElement = document.getElementById('celebrationTitle');
    const subtextElement = document.getElementById('celebrationSubtext');
    const lunarElement = document.getElementById('celebrationLunar');

    // Update celebration message based on type
    if (isLunar) {
        titleElement.innerHTML = `🧧 CHÚC MỪNG NĂM MỚI ${canChi.toUpperCase()}! 🧧`;
        subtextElement.textContent = '🎊 Xuân Sang - Phúc Lộc Đầy Nhà 🎊';
        lunarElement.innerHTML = `<span style="font-size: 1.8rem;">🌸 Năm ${canChi} - ${year} 🌸</span>`;
    } else {
        titleElement.textContent = `🎊 CHÚC MỪNG NĂM MỚI ${year}! 🎊`;
        subtextElement.textContent = 'Happy New Year!';
        lunarElement.textContent = '';
    }

    // Show celebration message
    messageElement.classList.add('show');

    // Play celebration sound if music is enabled
    if (musicPlaying) {
        music.volume = 0.7;
    }

    // Trigger intense fireworks for 20 seconds
    startIntenseFireworks();

    // Launch confetti multiple times
    launchConfetti();
    setTimeout(() => launchConfetti(), 1000);
    setTimeout(() => launchConfetti(), 2000);
    setTimeout(() => launchConfetti(), 3000);
    setTimeout(() => launchConfetti(), 4000);

    // Hide message after 15 seconds
    setTimeout(() => {
        messageElement.classList.remove('show');
    }, 15000);

    // Stop intense fireworks after 20 seconds and resume auto-collapse
    setTimeout(() => {
        stopIntenseFireworks();
        isNewYearCelebrating = false;
        resetInactivityTimer();
    }, 20000);
}

// ===== Intense Fireworks for New Year =====
function startIntenseFireworks() {
    // Clear existing interval if any
    if (newYearFireworksInterval) {
        clearInterval(newYearFireworksInterval);
    }

    // Create fireworks more frequently (every 300ms)
    newYearFireworksInterval = setInterval(() => {
        createFirework();
        createFirework(); // Double fireworks
    }, 300);
}

function stopIntenseFireworks() {
    if (newYearFireworksInterval) {
        clearInterval(newYearFireworksInterval);
        newYearFireworksInterval = null;
    }
}

setInterval(updateClock, 1000);
updateClock();

// ===== Music Control =====
musicBtn.addEventListener('click', () => {
    if (musicPlaying) {
        music.pause();
        musicIcon.textContent = '🔇';
        musicBtn.innerHTML = '<span id="musicIcon">🔇</span> Tắt nhạc';
        musicPlaying = false;
    } else {
        music.play().catch(e => {
            console.log('Auto-play prevented:', e);
            alert('Vui lòng nhấn nút để phát nhạc!');
        });
        musicIcon.textContent = '🔊';
        musicBtn.innerHTML = '<span id="musicIcon">🔊</span> Bật nhạc';
        musicPlaying = true;
    }
});

// ===== Modal Controls =====
wishBtn.addEventListener('click', () => {
    wishModal.style.display = 'block';
    launchConfetti();
});

closeModal.addEventListener('click', () => {
    wishModal.style.display = 'none';
});

shareBtn.addEventListener('click', () => {
    shareModal.style.display = 'block';
});

closeShareModal.addEventListener('click', () => {
    shareModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === wishModal) {
        wishModal.style.display = 'none';
    }
    if (e.target === shareModal) {
        shareModal.style.display = 'none';
    }
});

// ===== Confetti Effect =====
function launchConfetti() {
    const count = 200;
    const defaults = {
        origin: { y: 0.7 },
        zIndex: 9999
    };

    function fire(particleRatio, opts) {
        confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio),
            colors: ['#ff6b6b', '#ffd93d', '#ff8c42', '#f093fb', '#4facfe']
        });
    }

    fire(0.25, {
        spread: 26,
        startVelocity: 55,
    });

    fire(0.2, {
        spread: 60,
    });

    fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8
    });

    fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2
    });

    fire(0.1, {
        spread: 120,
        startVelocity: 45,
    });
}

// Launch confetti on page load
window.addEventListener('load', () => {
    setTimeout(launchConfetti, 500);
    // Repeat confetti every 10 seconds
    setInterval(launchConfetti, 10000);
});

// ===== Canvas Fireworks Animation =====
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocity = {
            x: (Math.random() - 0.5) * 8,
            y: (Math.random() - 0.5) * 8
        };
        this.alpha = 1;
        this.decay = Math.random() * 0.02 + 0.01;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    update() {
        this.velocity.y += 0.1;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= this.decay;
    }
}

let particles = [];
const colors = ['#ff6b6b', '#ffd93d', '#ff8c42', '#f093fb', '#4facfe', '#00f2fe'];

function createFirework() {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height * 0.6;
    const color = colors[Math.floor(Math.random() * colors.length)];

    for (let i = 0; i < 50; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function animateFireworks() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach((particle, index) => {
        particle.update();
        particle.draw();

        if (particle.alpha <= 0) {
            particles.splice(index, 1);
        }
    });

    requestAnimationFrame(animateFireworks);
}

// Start fireworks animation
animateFireworks();

// Create firework every 2 seconds (optimized for performance)
setInterval(createFirework, 2000);

// Reduce firework frequency on mobile for better performance
if (window.innerWidth < 768) {
    // Mobile devices: less frequent fireworks
    setInterval(createFirework, 3000);
} else {
    // Desktop: normal frequency
    setInterval(createFirework, 2000);
}

// ===== Share Functions =====
document.getElementById('copyLinkBtn').addEventListener('click', () => {
    const url = window.location.href;

    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
            showCopyMessage('✅ Đã copy link thành công!');
        }).catch(() => {
            fallbackCopyTextToClipboard(url);
        });
    } else {
        fallbackCopyTextToClipboard(url);
    }
});

function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.top = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        document.execCommand('copy');
        showCopyMessage('✅ Đã copy link thành công!');
    } catch (err) {
        showCopyMessage('❌ Không thể copy link!');
    }

    document.body.removeChild(textArea);
}

function showCopyMessage(message) {
    const copyMessage = document.getElementById('copyMessage');
    copyMessage.textContent = message;
    setTimeout(() => {
        copyMessage.textContent = '';
    }, 3000);
}

document.getElementById('facebookBtn').addEventListener('click', () => {
    const url = window.location.href;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
});

document.getElementById('zaloBtn').addEventListener('click', () => {
    const url = window.location.href;
    const message = '🎉 Chúc Mừng Năm Mới 2026! 🎉\n\n' +
        '💪 Sức khỏe dồi dào\n' +
        '🏆 Thành công vượt trội\n' +
        '🍀 May mắn trọn vẹn\n' +
        '😊 Hạnh phúc tràn đầy\n\n' +
        '💝 Lời chúc từ: Lê Huy Hoàng\n\n' +
        `Xem lời chúc: ${url}`;

    // For mobile Zalo app
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        const zaloUrl = `https://zalo.me/share?link=${encodeURIComponent(url)}&text=${encodeURIComponent(message)}`;
        window.location.href = zaloUrl;
    } else {
        // For desktop - copy message
        if (navigator.clipboard) {
            navigator.clipboard.writeText(message).then(() => {
                showCopyMessage('✅ Đã copy nội dung! Hãy dán vào Zalo.');
            });
        } else {
            fallbackCopyTextToClipboard(message);
        }
    }
});

// ===== Add Sparkle Effect on Mouse Move =====
document.addEventListener('mousemove', (e) => {
    if (Math.random() > 0.95) {
        const x = e.clientX;
        const y = e.clientY;
        const color = colors[Math.floor(Math.random() * colors.length)];

        for (let i = 0; i < 5; i++) {
            particles.push(new Particle(x, y, color));
        }
    }
});

// ===== Easter Egg: Click on title for extra confetti =====
document.querySelector('.main-title').addEventListener('click', () => {
    launchConfetti();
    launchConfetti();
});

console.log('🎉 Happy New Year 2026! Created by Lê Huy Hoàng 🎉');
