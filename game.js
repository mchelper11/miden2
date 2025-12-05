const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const pointsEl = document.getElementById('points');

// Налаштування canvas
canvas.width = 1200;
canvas.height = 800;

let game = {
    score: 0,
    gameSpeed: 2,
    stars: [],
    enemies: [],
    boomerangs: [],
    player: {
        x: 100,
        y: canvas.height / 2,
        width: 60,
        height: 60,
        speed: 5
    }
};

// Створення зірок фону
function createStars() {
    for(let i = 0; i < 100; i++) {
        game.stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speed: Math.random() * 2 + 1,
            size: Math.random() * 2 + 1
        });
    }
}

// Pepe гравець (проста графіка)
function drawPlayer() {
    ctx.fillStyle = '#9B59B6'; // фіолетовий Pepe
    ctx.fillRect(game.player.x, game.player.y, game.player.width, game.player.height);
    
    // Очі Pepe
    ctx.fillStyle = 'white';
    ctx.fillRect(game.player.x + 10, game.player.y + 10, 15, 15);
    ctx.fillRect(game.player.x + 35, game.player.y + 10, 15, 15);
    ctx.fillStyle = 'black';
    ctx.fillRect(game.player.x + 15, game.player.y + 15, 5, 5);
    ctx.fillRect(game.player.x + 40, game.player.y + 15, 5, 5);
    
    // Усмішка
    ctx.strokeStyle = '#2ECC71';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(game.player.x + 30, game.player.y + 40, 12, 0, Math.PI);
    ctx.stroke();
}

// Бумеранги
function updateBoomerangs() {
    game.boomerangs.forEach((boomerang, index) => {
        // Летить вперед
        if(boomerang.phase === 'out') {
            boomerang.x += 15;
            if(boomerang.x > canvas.width) {
                boomerang.phase = 'back';
            }
        } else {
            // Повертається назад
            boomerang.x -= 12;
            if(boomerang.x < game.player.x + game.player.width) {
                game.boomerangs.splice(index, 1);
            }
        }
        
        // Малюємо бумеранг
        ctx.fillStyle = '#2ECC71';
        ctx.fillRect(boomerang.x, boomerang.y - 5, 30, 10);
    });
}

// Вороги (зелені мішені)
function spawnEnemy() {
    if(Math.random() < 0.02) {
        game.enemies.push({
            x: canvas.width,
            y: Math.random() * (canvas.height - 100) + 50,
            width: 40,
            height: 40,
            speed: game.gameSpeed + Math.random() * 2
        });
    }
}

function updateEnemies() {
    game.enemies.forEach((enemy, eIndex) => {
        enemy.x -= enemy.speed;
        
        // Колізія з бумерангами
        game.boomerangs.forEach((boomerang, bIndex) => {
            if(boomerang.x < enemy.x + enemy.width &&
               boomerang.x + 30 > enemy.x &&
               boomerang.y - 5 < enemy.y + enemy.height &&
               boomerang.y + 5 > enemy.y) {
                game.enemies.splice(eIndex, 1);
                game.boomerangs.splice(bIndex, 1);
                game.score += 100;
                return;
            }
        });
        
        // Колізія з гравцем
        if(enemy.x < game.player.x + game.player.width &&
           enemy.x + enemy.width > game.player.x &&
           enemy.y < game.player.y + game.player.height &&
           enemy.y + enemy.height > game.player.y) {
            alert('Game Over! Score: ' + game.score);
            location.reload();
        }
        
        if(enemy.x < -50) game.enemies.splice(eIndex, 1);
    });
}

// Зірковий фон
function updateStars() {
    game.stars.forEach(star => {
        star.x -= star.speed;
        if(star.x < 0) {
            star.x = canvas.width;
            star.y = Math.random() * canvas.height;
        }
    });
}

// Керування
let keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if(e.code === 'Space') {
        e.preventDefault();
        game.boomerangs.push({
            x: game.player.x + game.player.width,
            y: game.player.y + game.player.height / 2,
            phase: 'out'
        });
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// Оновлення гравця
function updatePlayer() {
    if(keys['ArrowUp'] || keys['KeyW']) game.player.y = Math.max(0, game.player.y - game.player.speed);
    if(keys['ArrowDown'] || keys['KeyS']) game.player.y = Math.min(canvas.height - game.player.height, game.player.y + game.player.speed);
    if(keys['ArrowLeft'] || keys['KeyA']) game.player.x = Math.max(0, game.player.x - game.player.speed);
    if(keys['ArrowRight'] || keys['KeyD']) game.player.x = Math.min(canvas.width - game.player.width, game.player.x + game.player.speed);
}

// Малювання зірок
function drawStars() {
    ctx.fillStyle = 'white';
    game.stars.forEach(star => {
        ctx.globalAlpha = star.size / 3;
        ctx.fillRect(star.x, star.y, star.size, star.size);
    });
    ctx.globalAlpha = 1;
}

// Червоний STOP бар'єр
function drawBarrier() {
    if(game.score > 1000 && Math.random() < 0.005) {
        ctx.fillStyle = '#E74C3C';
        ctx.fillRect(canvas.width - 100, 200, 80, 400);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('STOP', canvas.width - 60, 280);
    }
}

// Головний цикл гри
function gameLoop() {
    // Очищення
    ctx.fillStyle = '#0A0A23';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Оновлення
    updateStars();
    updatePlayer();
    spawnEnemy();
    updateEnemies();
    updateBoomerangs();
    
    // Малювання
    drawStars();
    drawPlayer();
    drawBarrier();
    
    // UI
    pointsEl.textContent = game.score;
    game.gameSpeed += 0.001;
    
    requestAnimationFrame(gameLoop);
}

// Старт гри
createStars();
gameLoop();
