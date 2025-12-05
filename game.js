const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const pointsEl = document.getElementById('points');

canvas.width = 1200;
canvas.height = 800;

const game = {
    score: 0,
    gravity: 0.5,
    jumpForce: -10,
    gameSpeed: 3,
    boomerangSpeed: 15,
    stars: [],
    collectibles: [],
    boomerangs: [],
    player: {
        x: 200,
        y: canvas.height / 2,
        width: 60,
        height: 60,
        velY: 0,
        isAlive: true,
        image: new Image(),
        src: 'pepe.png'
    },
    collectibleImg: new Image(),
    collectibleImgSrc: 'collectible.png'
};

// Зірки фон
function initStars() {
    for (let i = 0; i < 200; i++) {
        game.stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 3,
            speed: Math.random() * (game.gameSpeed + 1) + 1
        });
    }
}

// Завантаження картинок
game.collectibleImg.onload = () => {
    requestAnimationFrame(gameLoop);
};
game.collectibleImg.src = 'collectible.png';

// Головний цикл гри після натискання
function gameLoop() {
    // Очищення canvas
    ctx.fillStyle = '#0A0A23';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    updateStars();
    updatePlayer();
    updateBoomerangs();
    spawnCollectible();
    updateCollectibles();
    render();

    requestAnimationFrame(gameLoop);
}

// Flappy механіка: падає ⬇️, стрибає ⬆️ при пробілу/кліку
function updatePlayer() {
    game.player.y += game.player.velY;
    game.player.velY += game.gravity;

    // Обмеження падіння та верхньої межі
    if (game.player.y > canvas.height) game.player.isAlive = false; // Падіння вниз → смерть

    // Стрибок при пробілу або кліку
    const controls = () => {
        game.player.velY = game.jumpForce;
        if (game.player.isAlive) shootBoomerang();
    };

    document.addEventListener('keydown', e => e.code === 'Space' && controls());
    canvas.addEventListener('click', controls);

    // Смерть
    if (!game.player.isAlive) {
        alert(`Game Over! Score: ${game.score}`);
        resetGame();
    }
}

// Бумеранг постріл коротший
function shootBoomerang() {
    const clickY = game.player.y + game.player.height / 2;
    game.boomerangs.push({
        x: game.player.x + game.player.width,
        y: clickY,
        phase: 'out', // out → вперед, back → назад
        maxDistance: 350,
        speed: game.boomerangSpeed,
        angle: 0
    });
}

function updateBoomerangs() {
    game.boomerangs.forEach((boomerang, bIndex) => {
        if (boomerang.phase === 'out') {
            // Летить вперед (по дузі)
            boomerang.x += boomerang.speed;
            boomerang.y += Math.sin(boomerang.angle) * 2;
            boomerang.angle += 0.05;

            // Дистанція
            if (boomerang.x > boomerang.startX + boomerang.maxDistance) {
                boomerang.phase = 'back';
            }
        } else {
            // Летить назад (прямо)
            boomerang.speed -= 0.2; // сповільнюється
            boomerang.x -= boomerang.speed;

            if (boomerang.x < 0) game.boomerangs.splice(bIndex, 1);
        }
    });
}

// Предмети збиваємо бумерангами
function spawnCollectible() {
    const { collectibles, isAlive } = game;
    if (!isAlive) return;

    if (Math.random() < 0.01) {
        collectibles.push({
            x: canvas.width,
            y: Math.random() * (canvas.height - 200) + 50,
            width: 50,
            height: 50,
            speed: game.gameSpeed + 3,
            points: 100
        });
    }
}

function updateCollectibles() {
    const { collectibles, boomerangs, gameSpeed, player } = game;

    collectibles.forEach((collectible, cIndex) => {
        collectible.x -= collectible.speed; // летить вліво

        // Перевірка на збивання бумерангом
        boomerangs.forEach((boomerang, bIndex) => {
            if (checkCollision(boomerang, collectible)) {
                game.collectibles.splice(cIndex, 1);
                game.boomerangs.splice(bIndex, 1);
                game.score += collectible.points;
            }
        });

        // Пропустили предмет → переміщення на новий
        if (collectible.x < 0) game.collectibles.splice(cIndex, 1);
    });

    // Стреляємо автоматично, щоб не врізатися в предмети
    if (Math.random() < 0.004 && player.isAlive) spawnCollectible();
}

// Колізія об'єктів (прямокутник-прямокутник: спрощено)
function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + 30 > obj2.x &&
           obj1.y < obj2.y + obj.height &&
           obj1.y + 10 > obj2.y;
}

// Зірковий фон анімумвання
function updateStars() {
    game.stars.forEach(star => {
        star.x -= star.speed;
        if (star.x < 0) star.x = canvas.width;
    });
}

// Рендеринг всіх об'єктів
function render() {
    const { stars, collectibles, boomerangs, player } = game;

    // Зірки фон
    ctx.fillStyle = 'white';
    stars.forEach(star => {
        ctx.globalAlpha = 0.8;
        ctx.fillRect(star.x, star.y, star.size, star.size);
    });

    // Бумеранги
    ctx.fillStyle = '#2ECC71';
    ctx.globalAlpha = 1;
    boomerangs.forEach(boomerang => {
        ctx.fillRect(boomerang.x, boomerang.y - 5, 30, 10);
    });

    // Предмети (круглі монетки або твоя картинка)
    collectibles.forEach(collectible => {
        ctx.drawImage(game.collectibleImg, collectible.x, collectible.y, collectible.width, collectible.height);
    });

    // Гравця зображення або примітивний Пепе
    if (!player.image.complete) {
        ctx.fillStyle = '#9B59B6';
        ctx.fillRect(player.x, player.y, player.width, player.height);
    } else {
        ctx.drawImage(player.image, player.x, player.y, player.width, player.height);
    }

    // Відображення очок
    ctx.globalAlpha = 1;
    pointsEl.textContent = game.score;
}

// Скидання гри
function resetGame() {
    game.player.y = canvas.height / 2;
    game.player.velY = 0;
    game.player.isAlive = true;
    game.score = 0;
    game.boomerangs = [];
    game.collectibles = [];
}

initStars();
