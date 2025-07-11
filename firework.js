const canvas = document.getElementById('fireworks');
const ctx = canvas.getContext('2d');
let W = window.innerWidth;
let H = window.innerHeight;
canvas.width = W;
canvas.height = H;

window.addEventListener('resize', () => {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
});

class Particle {
    constructor(x, y, angle, speed, color, size, fade, gravity = 0.03, sparkle = false) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.size = size;
        this.color = color;
        this.alpha = 1;
        this.gravity = gravity;
        this.fade = fade;
        this.sparkle = sparkle;
        this.life = 0;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.alpha -= this.fade;
        this.life++;
    }
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size + (this.sparkle ? Math.random() * 2 : 0), 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = this.sparkle ? 24 : 12;
        ctx.fill();
        ctx.restore();
    }
}

function randomColor() {
    const colors = [
        "#ff3838", "#f9d423", "#30cfd0", "#a3ffae",
        "#f83600", "#1fa2ff", "#db36a4", "#fff720", "#ff00cc", "#fbff00"
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

let fireworks = [];

function randomFirework() {
    const x = Math.random() * (W * 0.8) + W * 0.1;
    const y = Math.random() * (H * 0.35) + H * 0.1;
    const color = randomColor();
    const shape = Math.random();
    let numParticles = 32 + Math.floor(Math.random() * 32);

    let particles = [];
    for (let i = 0; i < numParticles; i++) {
        let angle, speed;
        // Star, heart, or circle shapes
        if (shape < 0.25) {
            // Star
            angle = (Math.PI * 2 * i) / numParticles;
            speed = 2.6 + 1.6 * Math.sin(5 * angle);
        } else if (shape < 0.4) {
            // Heart
            let t = (Math.PI * 2 * i) / numParticles;
            let r = 12 * (1 - Math.sin(t));
            angle = t;
            speed = 2.3 + r / 14;
        } else {
            // Circle
            angle = (Math.PI * 2 * i) / numParticles;
            speed = 2.5 + Math.random();
        }
        let size = 2.2 + Math.random() * 1.5;
        let fade = 0.012 + Math.random() * 0.013;
        let sparkle = Math.random() > 0.7;
        particles.push(new Particle(x, y, angle, speed, color, size, fade, 0.045, sparkle));
    }
    fireworks.push(...particles);
}

// Bắn pháo hoa lớn đặc biệt
function bigFirework(centerX, centerY, mainColor) {
    let numRings = 3 + Math.floor(Math.random() * 2);
    for (let ring = 1; ring <= numRings; ring++) {
        let numParticles = 36 + ring * 12;
        for (let i = 0; i < numParticles; i++) {
            let angle = (Math.PI * 2 * i) / numParticles;
            let speed = 2.6 + ring * 0.7 + Math.random() * 0.44;
            let fade = 0.008 + ring * 0.004 + Math.random() * 0.002;
            let color = ring === 1 ? mainColor : randomColor();
            let size = 3 + ring * 1.2 + Math.random();
            let sparkle = true;
            fireworks.push(new Particle(centerX, centerY, angle, speed, color, size, fade, 0.03, sparkle));
        }
    }
    // Bắn pháo sáng giữa
    for (let i = 0; i < 38; i++) {
        let angle = (Math.PI * 2 * i) / 38;
        fireworks.push(new Particle(centerX, centerY, angle, 2 + Math.random() * 1.5, "#fff", 3 + Math.random() * 1.1, 0.009, 0.027, true));
    }
}

function animate() {
    ctx.clearRect(0, 0, W, H);
    for (let i = fireworks.length - 1; i >= 0; i--) {
        let p = fireworks[i];
        p.update();
        p.draw(ctx);
        if (p.alpha < 0.04 || p.life > 120) {
            fireworks.splice(i, 1);
        }
    }
    requestAnimationFrame(animate);
}

// Tự động bắn pháo hoa
setInterval(randomFirework, 890);

// Nút bắn pháo hoa lớn
document.getElementById("bigFireworkBtn").addEventListener("click", () => {
    let cx = W / 2 + (Math.random() - 0.5) * W / 5;
    let cy = H * 0.21 + Math.random() * H * 0.17;
    bigFirework(cx, cy, randomColor());
});

// Bắn pháo hoa tại vị trí click
canvas.addEventListener('click', function (e) {
    let rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    bigFirework(x, y, randomColor());
});

animate();