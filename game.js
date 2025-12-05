const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('points');

canvas.width = 1200;
canvas.height = 700;

// ---- Завантаження спрайтів ----
const pepeImg = new Image();
pepeImg.src = 'pepe.png';

const collectibleImg = new Image();
collectibleImg.src = 'collectible.png';

// ---- Стан гри ----
const game = {
    score: 0,
    gravity: 0.45,
    jumpForce: -9,
    player: {
        x: 220,
        y: canvas.height / 2,
        width: 64,
        height: 64,
        velY: 0
    },
    boomerangs: [],
    collectibles: [],
    stars: []
};

// ---- Допоміжні генератори ----
function initStars() {
    for (let i = 0; i < 160; i++) {
        game.stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1,
            speed: Math.random() * 1.5 + 0.5
        });
    }
}
initStars();

// ---- Управління ----
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        flapAndShoot();
    }
});

function flapAndShoot() {
    game.player.velY = game.jumpForce;
    shootBoomerang();
}

function shootBoomerang() {
    game.boomerangs.push({
        x: game.player.x + game.player.width,
        y: game.player.y + game.player.height / 2,
        phase: 'out',
        distance: 0,
        range: 300,          // удвічі коротше ніж раніше
        speed: 14,
        wave: 0
    });
}

// ---- Оновлення ----
function updatePlayer() {
    game.player.velY += game.gravity;
    game.player.y += game.player.velY;

    if (game.player.y < 20) {
        game.player.y = 20;
        game.player.velY = 0;
    }

    if (game.player.y + game.player.height > canvas.height - 20) {
        game.player.y = canvas.height - 20 - game.player.height;
        game.player.velY = 0;
        gameOver();
    }
}

function updateBoomerangs() {
    for (let i = game.boomerangs.length - 1; i >= 0; i--) {
        const b = game.boomerangs[i];

        if (b.phase === 'out') {
            b.x += b.speed;
            b.distance += b.speed;
            b.y += Math.sin(b.wave) * 1.2;
            b.wave += 0.25;

            if (b.distance >= b.range) b.phase = 'back';
        } else {
            b.x -= b.speed * 0.9;
            b.y -= Math.sin(b.wave) * 1.2;
            b.wave += 0.25;

            if (b.x <= game.player.x + 10) {
                game.boomerangs.splice(i, 1);
                continue;
            }
        }

        // Перевірка на зіткнення з предметом
        for (let j = game.collectibles.length - 1; j >= 0; j--) {
            if (rectIntersect(b.x, b.y - 4, 24, 8, game.collectibles[j])) {
                game.score += game.collectibles[j].points;
                game.collectibles.splice(j, 1);
                game.boomerangs.splice(i, 1);
                break;
            }
        }
    }
}

function spawnCollectibles() {
    if (game.collectibles.length >= 3) return;
    if (Math.random() > 0.015) return;

    const size = 90;
    game.collectibles.push({
        x: canvas.width + 20,
        y: Math.random() * (canvas.height - size - 120) + 60,
        width: size,
        height: size,
        speed: 4,
        points: 150
    });
}

function updateCollectibles() {
    for (let i = game.collectibles.length - 1; i >= 0; i--) {
        const c = game.collectibles[i];
        c.x -= c.speed;

        if (c.x + c.width < 0) {
            game.collectibles.splice(i, 1);
        }
    }
}

function updateStars() {
    game.stars.forEach(star => {
        star.x -= star.speed;
        if (star.x < 0) {
            star.x = canvas.width;
            star.y = Math.random() * canvas.height;
            star.speed = Math.random() * 1.5 + 0.5;
        }
    });
}

// ---- Малювання ----
function drawStars() {
    ctx.fillStyle = '#fff';
    game.stars.forEach(star => {
        ctx.globalAlpha = 0.4 + star.size / 3;
        ctx.fillRect(star.x, star.y, star.size, star.size);
    });
    ctx.globalAlpha = 1;
}

function drawPlayer() {
    if (pepeImg.complete) {
        ctx.drawImage(pepeImg, game.player.x, game.player.y, game
