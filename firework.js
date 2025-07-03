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

function randomColor() {
    const colors = ['#ff4242', '#42ff42', '#4242ff', '#fff842', '#f441a5', '#41f4ce', '#ffd700', '#ffffff'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function Firework(x, y, shape = 'circle') {
    this.x = x;
    this.y = y;
    this.shape = shape;
    this.particles = [];
    let n = 60;
    if (shape === 'heart') n = 70;
    if (shape === 'text') n = 100;
    for (let i = 0; i < n; i++) {
        this.particles.push(new Particle(x, y, randomColor(), i, n, shape));
    }
}

function Particle(x, y, color, index, total, shape) {
    this.x = x;
    this.y = y;
    this.radius = Math.random() * 2 + 1;
    this.color = color;
    this.alpha = 1;
    this.life = 0;
    // Tính toán góc & tốc độ theo dạng pháo hoa đặc biệt
    let angle, speed;
    if (shape === 'heart') {
        // Đường trái tim bằng công thức toán học
        let t = (index / total) * 2 * Math.PI;
        this.vx = 12 * Math.pow(Math.sin(t), 3);
        this.vy = -10 * (13 * Math.cos(t) - 5 * Math.cos(2 * t)
            - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    } else if (shape === 'text') {
        // Dạng chữ: bắn thành từng cột nhỏ
        angle = (index / total) * Math.PI * 2;
        speed = Math.random() * 4 + 3;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        if (index % 10 < 2) { this.vx = 0; } // tạo đường nét chữ
    } else {
        // Dạng pháo hoa tròn truyền thống
        angle = (index / total) * Math.PI * 2;
        speed = Math.random() * 5 + 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
    }
}

Particle.prototype.update = function () {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.03; // gravity
    this.alpha -= 0.012;
    this.life++;
};

Particle.prototype.draw = function (ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.restore();
};

let fireworks = [];

// Bắn pháo hoa ở vị trí, hoặc ngẫu nhiên nếu không truyền vị trí
function launchFirework(x, y, shape) {
    if (typeof x === "string") {
        // Gọi từ setInterval: truyền shape đầu tiên
        shape = x;
        x = Math.random() * W * 0.8 + W * 0.1;
        y = Math.random() * H * 0.5 + H * 0.1;
    } else if (typeof x !== "number" || typeof y !== "number") {
        // Không đủ tham số: random vị trí
        x = Math.random() * W * 0.8 + W * 0.1;
        y = Math.random() * H * 0.5 + H * 0.1;
    }
    fireworks.push(new Firework(x, y, shape));
}

function animate() {
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";

    for (let i = fireworks.length - 1; i >= 0; i--) {
        let firework = fireworks[i];
        let allDone = true;
        for (let j = firework.particles.length - 1; j >= 0; j--) {
            let p = firework.particles[j];
            p.update();
            p.draw(ctx);
            if (p.alpha > 0) allDone = false;
        }
        if (allDone) fireworks.splice(i, 1);
    }
    requestAnimationFrame(animate);
}

animate();

// Cho phép gọi từ index.html
window.launchFirework = launchFirework;