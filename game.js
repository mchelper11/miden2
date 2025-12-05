const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('points');
const finalScoreEl = document.getElementById('finalScore');
const gameOverScreen = document.getElementById('gameOverScreen');
const startScreen = document.getElementById('startScreen');
const restartBtn = document.getElementById('restartBtn');
const startBtn = document.getElementById('startBtn');

canvas.width = 1200;
canvas.height = 700;

// ---- Стан гри ----
const game = {
    score: 0,
    gravity: 0.4,
    jumpForce: -8,
    isRunning: false,
    isStarted: false,
    player: {
        x: 150,
        y: canvas.height / 2,
        width: 60,
        height: 60,
        velY: 0
    },
    boomerangs: [],
    collectibles: [],
    stars: []
};

// ---- Завантаження спрайтів ----
const astronautImg = new Image();
astronautImg.src = 'astronaut.png';

// 13 різних картинок для ворогів/предметів
const collectibleSpritePaths = [
    'enemy/enemy01.png',
    'enemy/enemy02.png',
    'enemy/enemy03.png',
    'enemy/enemy04.png',
    'enemy/enemy05.png',
    'enemy/enemy06.png',
    'enemy/enemy07.png',
    'enemy/enemy08.png',
    'enemy/enemy09.png',
    'enemy/enemy10.png',
    'enemy/enemy11.png',
    'enemy/enemy12.png',
    'enemy/enemy13.png'
];

const collectibleSprites = collectibleSpritePaths.map(path => {
    const img = new Image();
    img.src = path;
    img.onerror = () => console.error(`❌ Не завантажено: ${path}`);
    return img;
});

// ---- Ініціалізація зірок ----
function initStars() {
    game.stars = [];
    for (let i = 0; i < 150; i++) {
        game.stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 0.5,
            speed: Math.random() * 1.5 + 0.5
        });
    }
}

// ---- Кнопки ----
startBtn.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    game.isStarted = true;
    game.isRunning = true;
});

restartBtn.addEventListener('click', () => {
    resetGame();
    gameOverScreen.classList.add('hidden');
});

// ---- Керування ----
function handleInput() {
    if (!game.isRunning || !game.isStarted) return;
    game.player.velY = game.jumpForce;
    shootBoomerang();
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();

        if (!game.isStarted) {
            startScreen.classList.add('hidden');
            game.isStarted = true;
            game.isRunning = true;
        }

        handleInput();
    }
});

canvas.addEventListener('click', () => {
    handleInput();
});

// ---- Постріл бумеранга ----
function shootBoomerang() {
    game.boomerangs.push({
        x: game.player.x + game.player.width,
        y: game.player.y + game.player.height / 2,
        phase: 'out',
        startX: game.player.x + game.player.width,
        maxRange: 280,
        speed: 12
    });
}

// ---- Оновлення гравця ----
function updatePlayer() {
    game.player.velY += game.gravity;
    game.player.y += game.player.velY;

    if (game.player.y < 0) {
        game.player.y = 0;
        game.player.velY = 0;
    }

    if (game.player.y + game.player.height > canvas.height) {
        game.player.y = canvas.height - game.player.height;
        game.player.velY = 0;
        gameOver();
    }

    checkPlayerCollectibleCollision();
}

// ---- Перевірка колізії гравця з картинками ----
function checkPlayerCollectibleCollision() {
    for (let i = game.collectibles.length - 1; i >= 0; i--) {
        const c = game.collectibles[i];
        if (isColliding(
            game.player.x, game.player.y, game.player.width, game.player.height,
            c.x, c.y, c.width, c.height
        )) {
            gameOver();
            return;
        }
    }
}

// ---- Оновлення бумерангів ----
function updateBoomerangs() {
    for (let i = game.boomerangs.length - 1; i >= 0; i--) {
        const b = game.boomerangs[i];

        if (b.phase === 'out') {
            b.x += b.speed;
            if (b.x - b.startX >= b.maxRange) {
                b.phase = 'back';
            }
        } else {
            b.x -= b.speed * 0.85;
            if (b.x <= game.player.x) {
                game.boomerangs.splice(i, 1);
                continue;
            }
        }

        for (let j = game.collectibles.length - 1; j >= 0; j--) {
            const c = game.collectibles[j];
            if (isColliding(b.x, b.y - 5, 25, 10, c.x, c.y, c.width, c.height)) {
                game.score += c.points;
                game.collectibles.splice(j, 1);
                game.boomerangs.splice(i, 1);
                break;
            }
        }
    }
}

// ---- Спавн предметів ----
function spawnCollectibles() {
    if (game.collectibles.length >= 4) return;
    if (Math.random() > 0.012) return;

    const baseSize = 80;
    const scale = 1 + Math.random() * 2;
    const size = baseSize * scale;
    const spriteIndex = Math.floor(Math.random() * collectibleSprites.length);

    game.collectibles.push({
        x: canvas.width + 10,
        y: Math.random() * (canvas.height - size - 100) + 50,
        width: size,
        height: size,
        speed: 3.5,
        points: 100,
        spriteIndex,
        scale
    });
}

// ---- Оновлення предметів ----
function updateCollectibles() {
    for (let i = game.collectibles.length - 1; i >= 0; i--) {
        const c = game.collectibles[i];
        c.x -= c.speed;

        if (c.x + c.width < 0) {
            game.collectibles.splice(i, 1);
        }
    }
}

// ---- Оновлення зірок ----
function updateStars() {
    game.stars.forEach(star => {
        star.x -= star.speed;
        if (star.x < 0) {
            star.x = canvas.width;
            star.y = Math.random() * canvas.height;
        }
    });
}

// ---- Малювання ----
function draw() {
    ctx.fillStyle = '#05051a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ffffff';
    game.stars.forEach(star => {
        ctx.globalAlpha = 0.3 + star.size / 3;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;

    drawCollectibles();

    ctx.fillStyle = '#2ecc71';
    ctx.shadowColor = '#2ecc71';
    ctx.shadowBlur = 8;
    game.boomerangs.forEach(b => {
        ctx.fillRect(b.x, b.y - 4, 22, 8);
    });
    ctx.shadowBlur = 0;

    if (astronautImg.complete && astronautImg.naturalWidth > 0) {
        ctx.drawImage(astronautImg, game.player.x, game.player.y, game.player.width, game.player.height);
    } else {
        drawFallbackAstronaut();
    }

    scoreEl.textContent = game.score;
}

// ---- Малювання предметів ----
function drawCollectibles() {
    game.collectibles.forEach(c => {
        const sprite = collectibleSprites[c.spriteIndex];

        if (sprite && sprite.complete && sprite.naturalWidth > 0) {
            ctx.drawImage(sprite, c.x, c.y, c.width, c.height);
        } else {
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(c.x, c.y, c.width, c.height);
            ctx.fillStyle = '#fff';
            ctx.font = `bold ${Math.min(16 * c.scale, 24)}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`E${c.spriteIndex + 1}`, c.x + c.width / 2, c.y + c.height / 2);
        }
    });
}

// ---- Фолбек астронавта ----
function drawFallbackAstronaut() {
    const p = game.player;

    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.ellipse(p.x + p.width / 2, p.y + p.height / 2, p.width / 2, p.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.ellipse(p.x + p.width / 2, p.y + p.height * 0.3, p.width * 0.45, p.height * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1abc9c';
    ctx.beginPath();
    ctx.ellipse(p.x + p.width / 2, p.y + p.height * 0.3, p.width * 0.35, p.height * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(p.x + p.width * 0.25, p.y + p.height * 0.72, p.width * 0.5, p.height * 0.14);
}

// ---- Колізія ----
function isColliding(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x1 < x2 + w2 &&
           x1 + w1 > x2 &&
           y1 < y2 + h2 &&
           y1 + h1 > y2;
}

// ---- Game Over ----
function gameOver() {
    game.isRunning = false;
    finalScoreEl.textContent = game.score;
    gameOverScreen.classList.remove('hidden');
}

// ---- Скидання гри ----
function resetGame() {
    game.score = 0;
    game.player.y = canvas.height / 2;
    game.player.velY = 0;
    game.boomerangs = [];
    game.collectibles = [];
    game.isRunning = true;
}

// ---- Головний цикл ----
function gameLoop() {
    if (game.isRunning && game.isStarted) {
        updatePlayer();
        updateBoomerangs();
        spawnCollectibles();
        updateCollectibles();
    }

    updateStars();
    draw();
    requestAnimationFrame(gameLoop);
}

// ---- Старт ----
initStars();
gameLoop();
