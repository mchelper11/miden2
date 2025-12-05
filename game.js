const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const pointsEl = document.getElementById('points');

// Налаштування canvas
canvas.width = 1200;
canvas.height = 800;

let game = {
    score: 0,
    gameSpeed: 3,
    stars: [],
    collectibles: [], // Предмети з правої сторони
    boomerangs: [],
    player: {
        x: 100,
        y: canvas.height / 2 - 30,
        width: 60,
        height: 60,
        speed: 8,
        targetY: canvas.height / 2 - 30 // Цільова позиція для плавного руху
    },
    autoMove: true // Автоматичний рух вправо
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

// Pepe гравець
function drawPlayer() {
    ctx.fillStyle = '#9B59B6';
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

// Короткі бумеранги (довжина в 2 рази коротша)
function shootBoomerang() {
    game.boomerangs.push({
        x: game.player.x + game.player.width,
        y: game.player.y + game.player.height / 2,
        phase: 'out',
        maxDistance: 300 // Коротша дистанція (було ~600)
    });
}

function updateBoomerangs() {
    game.boomerangs.forEach((boomerang, index) => {
        if(boomerang.phase === 'out') {
            boomerang.x += 12; // Трохи повільніше
            boomerang.distanceTraveled = (boomerang.x - (game.player.x + game.player.width));
            
            // Повертається на половині дистанції
            if(boomerang.distanceTraveled > boomerang.maxDistance) {
                boomerang.phase = 'back';
                boomerang.returnSpeed = 10;
            }
        } else {
            boomerang.x -= boomerang.returnSpeed;
            boomerang.returnSpeed += 0.2; // Прискорюється назад
            
            if(boomerang.x < game.player.x + game.player.width) {
                game.boomerangs.splice(index, 1);
            }
        }
        
        // Малюємо короткий бумеранг
        ctx.fillStyle = '#2ECC71';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#2ECC71';
        ctx.fillRect(boomerang.x, boomerang.y - 4, 20, 8); // Коротший!
        ctx.shadowBlur = 0;
    });
}

// Предмети з правої сторони (твоя картинка)
function spawnCollectible() {
    if(Math.random() < 0.015) { // Частота спавну
        game.collectibles.push({
            x: canvas.width,
            y: Math.random() * (canvas.height - 120) + 60,
            width: 50,
            height: 50,
            speed: game.gameSpeed + Math.random() * 1.5,
            points: 200 + Math.floor(Math.random() * 300), // 200-500 очок
            bobOffset: Math.random() * Math.PI * 2 // Для анімації "плавання"
        });
    }
}

function updateCollectibles() {
    game.collectibles.forEach((collectible, cIndex) => {
        collectible.x -= collectible.speed;
        collectible.bobOffset += 0.1; // Анімація "плавання"
        collectible.y += Math.sin(collectible.bobOffset) * 0.5;
        
        // Колізія з бумерангами
        game.boomerangs.forEach((boomerang, bIndex) => {
            if(boomerang.x < collectible.x + collectible.width &&
               boomerang.x + 20 > collectible.x &&
               boomerang.y - 4 < collectible.y + collectible.height &&
               boomerang.y + 4 > collectible.y) {
                
                game.collectibles.splice(cIndex, 1);
                game.boomerangs.splice(bIndex, 1);
                game.score += collectible.points;
                
                // Ефект вибуху/зникнення
                for(let i = 0; i < 5; i++) {
                    setTimeout(() => {}, 50);
                }
                return;
            }
        });
        
        // Видаляємо якщо вилетіли зліва
        if(collectible.x < -50) {
            game.collectibles.splice(cIndex, 1);
        }
    });
}

// Малювання предметів (поки без картинки - золоті монетки)
function drawCollectibles() {
    game.collectibles.forEach(collectible => {
        // Золотий предмет (заміни на img.onload коли додаси картинку)
        ctx.save();
        ctx.translate(collectible.x + collectible.width/2, collectible.y + collectible.height/2);
        ctx.rotate(Math.sin(collectible.bobOffset * 3) * 0.1);
        ctx.translate(-collectible.width/2, -collectible.height/2);
        
        // Градієнтна монетка/предмет
        const gradient = ctx.createRadialGradient(
            collectible.width/2, collectible.height/2, 0,
            collectible.width/2, collectible.height/2, collectible.width/2
        );
        gradient.addColorStop(0, '#F1C40F');
        gradient.addColorStop(0.7, '#F39C12');
        gradient.addColorStop(1, '#E67E22');
        
        ctx.fillStyle = gradient;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#F1C40F';
        ctx.fillRect(0, 0, collectible.width, collectible.height);
        ctx.shadowBlur = 0;
        
        // Блик
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fillRect(5, 5, 15, 10);
        
        ctx.restore();
        
        // Очки (опціонально)
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(collectible.points, collectible.x + collectible.width/2, collectible.y - 10);
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

function drawStars() {
    ctx.fillStyle = 'white';
    game.stars.forEach(star => {
        ctx.globalAlpha = star.size / 3;
        ctx.fillRect(star.x, star.y, star.size, star.size);
    });
    ctx.globalAlpha = 1;
}

// Рух гравця тільки вгору/вниз при стрільбі
function updatePlayer() {
    // Автоматичний рух вправо
    game.player.x += game.gameSpeed * 0.7;
    if(game.player.x > canvas.width) {
        game.player.x = -game.player.width;
    }
    
    // Плавний рух до цільової позиції при стрільбі
    if(game.player.y < game.player.targetY) {
        game.player.y += Math.min(game.player.speed, game.player.targetY - game.player.y);
    } else if(game.player.y > game.player.targetY) {
        game.player.y -= Math.min(game.player.speed, game.player.y - game.player.targetY);
    }
}

// Керування - тільки стрільба + рух вгору/вниз
document.addEventListener('keydown', (e) => {
    if(e.code === 'Space') {
        e.preventDefault();
        shootBoomerang();
        // Рух вгору при стрільбі
        game.player.targetY = Math.max(0, game.player.y - 60);
    }
});

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    
    // Стрільба + рух до позиції миші по Y
    shootBoomerang();
    game.player.targetY = Math.max(0, Math.min(canvas.height - game.player.height, mouseY - game.player.height/2));
});

// Головний цикл
function gameLoop() {
    ctx.fillStyle = '#0A0A23';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    updateStars();
    updatePlayer();
    spawnCollectible();
    updateCollectibles();
    updateBoomerangs();
    
    drawStars();
    drawCollectibles();
    drawPlayer();
    
    pointsEl.textContent = game.score;
    game.gameSpeed += 0.0005;
    
    requestAnimationFrame(gameLoop);
}

// Старт
createStars();
gameLoop();
