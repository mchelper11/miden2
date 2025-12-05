// ... (початок коду без змін до collectibleSpritePaths)

// ✅ ВИПРАВЛЕНИЙ МАСИВ (13 картинок, але правильно)
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
    'enemy/enemy13.png'  // ✅ 13 картинок
];

// ✅ ВИПРАВЛЕНІ ВИБУХИ (більш помітні та довші)
const explosions = [];

function createExplosion(x, y, size) {
    console.log('💥 ВИБУХ СТВОРЕНО!', x, y, size); // ✅ ДЕБАГ
    
    const explosion = {
        x: x,
        y: y,
        maxRadius: Math.max(size * 1.2, 40), // ✅ Мінімум 40px
        radius: 0,
        life: 1.0,
        maxLife: 1.0,
        particles: []
    };

    // ✅ БІЛЬШЕ ЧАСТИНОК (16 замість 12)
    for (let i = 0; i < 16; i++) {
        explosion.particles.push({
            x: 0,
            y: 0,
            vx: (Math.random() - 0.5) * 16,  // ✅ ШВИДШІ
            vy: (Math.random() - 0.5) * 16,
            life: 1.0,
            size: Math.random() * 8 + 4,     // ✅ БІЛЬШІ
            color: `hsl(${20 + Math.random() * 40}, 100%, ${50 + Math.random() * 30}%)`
        });
    }

    explosions.push(explosion);
}

function updateExplosions() {
    for (let i = explosions.length - 1; i >= 0; i--) {
        const exp = explosions[i];
        
        // ✅ Повільніше розширення
        exp.radius += (exp.maxRadius - exp.radius) * 0.12;
        exp.life -= 0.025; // ✅ Повільніше згасання (було 0.04)
        
        // Оновлюємо частинки
        exp.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.97;  // ✅ Повільніше гальмування
            p.vy *= 0.97;
            p.life -= 0.03; // ✅ Повільніше згасання частинок
        });

        if (exp.life <= 0) {
            explosions.splice(i, 1);
        }
    }
}

function drawExplosions() {
    if (explosions.length > 0) {
        console.log(`🔥 ВИБУХІВ НА ЕКРАНІ: ${explosions.length}`); // ✅ ДЕБАГ
    }
    
    ctx.save();
    explosions.forEach(exp => {
        const alpha = exp.life * 0.9; // ✅ ЯСКРАВІШЕ
        
        // ✅ ПОКРАЩЕНИЙ ГРАДІЄНТ
        const gradient = ctx.createRadialGradient(
            exp.x, exp.y, 0,
            exp.x, exp.y, exp.radius
        );
        gradient.addColorStop(0, `rgba(255, 255, 0, ${alpha})`);      // ✅ ЖОВТИЙ центр
        gradient.addColorStop(0.3, `rgba(255, 200, 0, ${alpha * 0.8})`);
        gradient.addColorStop(0.7, `rgba(255, 100, 0, ${alpha * 0.4})`);
        gradient.addColorStop(1, `rgba(255, 0, 0, 0)`);
        
        // ✅ ПОТужНА ТІНЬ
        ctx.shadowColor = '#ffaa00';
        ctx.shadowBlur = 30 * exp.life;
        
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // ✅ ПОКРАЩЕНІ ЧАСТИНКИ
        exp.particles.forEach(p => {
            ctx.globalAlpha = p.life * alpha * 0.8;
            ctx.shadowBlur = 15 * p.life;
            ctx.shadowColor = p.color;
            
            ctx.beginPath();
            ctx.arc(exp.x + p.x, exp.y + p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        });
    });
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    ctx.restore();
}

// ---- ВИПРАВЛЕНА ФУНКЦІЯ ПОПАДАННЯ ----
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
                console.log('🎯 ПОПАДАННЯ!', c.spriteIndex); // ✅ ДЕБАГ
                
                game.score += c.points;
                const hitX = c.x + c.width / 2;
                const hitY = c.y + c.height / 2;
                
                game.collectibles.splice(j, 1);
                game.boomerangs.splice(i, 1);
                
                playSound(hitSound);
                createExplosion(hitX, hitY, c.width); // ✅ ТУТ ВИБУХ
                break;
            }
        }
    }
}

// ---- МАЛЮВАННЯ (виправлений порядок) ----
function draw() {
    ctx.fillStyle = '#05051a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ЗІРКИ
    ctx.fillStyle = '#ffffff';
    game.stars.forEach(star => {
        ctx.globalAlpha = 0.3 + star.size / 3;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;

    // ✅ ПЕРЕД БУМЕРАНГАМИ - ВИБУХИ
    drawCollectibles();
    drawExplosions(); // ✅ ПРЯМО ПІСЛЯ КОЛЛЕКТИБЛІВ

    // БУМЕРАНГИ
    ctx.fillStyle = '#2ecc71';
    ctx.shadowColor = '#2ecc71';
    ctx.shadowBlur = 8;
    game.boomerangs.forEach(b => {
        ctx.fillRect(b.x, b.y - 4, 22, 8);
    });
    ctx.shadowBlur = 0;

    // ГРАВЕЦЬ
    if (astronautImg.complete && astronautImg.naturalWidth > 0) {
        ctx.drawImage(astronautImg, game.player.x, game.player.y, game.player.width, game.player.height);
    } else {
        drawFallbackAstronaut();
    }

    scoreEl.textContent = game.score;
}

// ---- РЕСЕТ (додаємо дебаг) ----
function resetGame() {
    console.log('🔄 РЕСЕТ ГРИ'); // ✅ ДЕБАГ
    game.score = 0;
    game.player.y = canvas.height / 2;
    game.player.velY = 0;
    game.boomerangs = [];
    game.collectibles = [];
    explosions.length = 0;
    game.isRunning = true;
}

// ... (решта коду без змін)
