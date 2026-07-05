/* ==========================================
   SPACE INVADERS - GAME.JS
   PHASE 1
   - Responsive Canvas
   - Selected Ship
   - Countdown
   - Player Movement
========================================== */

// =============================
// CANVAS
// =============================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");
const fireBtn = document.getElementById("fireBtn");

function bindTouchButton(button, action){

    if(!button) return;

    button.addEventListener("touchstart",(e)=>{

        e.preventDefault();

        action(true);

    });

    button.addEventListener("touchend",(e)=>{

        e.preventDefault();

        action(false);

    });

    button.addEventListener("touchcancel",(e)=>{

        e.preventDefault();

        action(false);

    });

}

bindTouchButton(leftBtn, value => touchLeft = value);

bindTouchButton(rightBtn, value => touchRight = value);

bindTouchButton(fireBtn, value => touchFire = value);

// =============================
// UI
// =============================

const countdown = document.getElementById("countdown");

const livesDisplay = document.getElementById("lives");

// =============================
// GAME STATE
// =============================

let gameStarted = false;

let gameOver = false;

// =============================
// GAME OVER ANIMATION
// =============================

let gameOverStartTime = 0;

let overlayAlpha = 0;

let gameOverAlpha = 0;

let scoreAlpha = 0;

// =============================
// GAME SETTINGS
// =============================

const gameSettings = {

    // Player
    playerLives: 3,
    playerSpeed: 8,
    playerFireCooldown: 200,

    // Fleet
    fleetBaseSpeed: 2,
    fleetDropDistance: 18,

    // Enemy
    enemyFireCooldown: 1500,

    // UFO
    bonusUfoChance: 0.10,
    bonusUfoMinPoints: 100,
    bonusUfoMaxPoints: 300

};

// =============================
// RESPONSIVE CANVAS
// =============================

function resizeCanvas() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    player.y = canvas.height - player.height - 20;

    if (player.x > canvas.width - player.width) {
        player.x = canvas.width - player.width;
    }
    updateEnemyScale();

    fleetLimit.y = player.y - 40;
}

window.addEventListener("resize", () => {

    resizeCanvas();

    createEnemies();

});

// =============================
// PLAYER SHIP
// =============================

const playerShip = new Image();

// =============================
// PLAYER DAMAGE SPRITES
// =============================

const playerDamageImages = {

    ship1: [],

    ship2: [],

    ship3: []

};

for (let i = 1; i <= 3; i++) {

    const img = new Image();

    img.src =
        `assets/effects/Damage/playerShip1_damage${i}.png`;

    playerDamageImages.ship1.push(img);

}

for (let i = 1; i <= 3; i++) {

    const img = new Image();

    img.src =
        `assets/effects/Damage/playerShip2_damage${i}.png`;

    playerDamageImages.ship2.push(img);

}

for (let i = 1; i <= 3; i++) {

    const img = new Image();

    img.src =
        `assets/effects/Damage/playerShip3_damage${i}.png`;

    playerDamageImages.ship3.push(img);

}

playerShip.src = localStorage.getItem("selectedShip");

// =============================
// CURRENT PLAYER SPRITE
// =============================

let currentPlayerSprite = playerShip;

let playerDamageSet;

if (playerShip.src.includes("playerShip1")) {

    playerDamageSet = playerDamageImages.ship1;

}

else if (playerShip.src.includes("playerShip2")) {

    playerDamageSet = playerDamageImages.ship2;

}

else {

    playerDamageSet = playerDamageImages.ship3;

}

// =============================
// ENEMY IMAGES
// =============================

const enemyImages = {

    green: new Image(),
    blue: new Image(),
    red: new Image(),
    black: new Image()

};

enemyImages.green.src = "assets/enemies/enemyGreen1.png";
enemyImages.blue.src = "assets/enemies/enemyBlue2.png";
enemyImages.red.src = "assets/enemies/enemyRed3.png";
enemyImages.black.src = "assets/enemies/enemyBlack4.png";


// =============================
// SCORE
// =============================

let score = 0;

// =============================
// PLAYER
// =============================

const player = {

    width: 64,
    height: 64,

    x: 0,
    y: 0,

    speed: 0

};

// =============================
// PLAYER STATE
// =============================

const playerState = {

    lives: gameSettings.playerLives,

    invincible: false,

    invincibleDuration: 1000,

    lastHitTime: 0

};

// =============================
// PLAYER HIT EFFECT
// =============================

let blinkTimer = 0;

const blinkDuration = 1000;

const blinkInterval = 100;

// =============================
// IMPACT FLASH
// =============================

let impactFlashTimer = 0;

const impactFlashDuration = 80;

// =============================
// IMPACT POSITION
// =============================

let impactX = 0;

let impactY = 0;

function setPlayerStart() {

    player.x = canvas.width / 2 - player.width / 2;

    player.y = canvas.height - player.height - 40;

}

// =============================
// PLAYER FINAL EXPLOSION
// =============================

let playerExploding = false;

let explosionTimer = 0;

const explosionDuration = 800;

// =============================
// SHOCKWAVE
// =============================

let shockwave = {

    active: false,

    x: 0,

    y: 0,

    radius: 0,

    maxRadius: 140,

    alpha: 1

};

let touchLeft = false;
let touchRight = false;
let touchFire = false;

let playerExplosionAlpha = 1;

// =============================
// BULLETS
// =============================

const bullets = [];

const bullet = {

    width: 6,
    height: 18,

    speed: 12

};

// =============================
// ENEMY EXPLOSIONS
// =============================

const enemyExplosions = [];

// =============================
// ENEMY LASER
// =============================

const enemyLaser = new Image();

enemyLaser.src =
    "assets/bullets/Lasers/laserRed02.png";

// =============================
// ENEMY BULLETS
// =============================

const enemyBullets = [];

// =============================
// ENEMIES
// =============================

const enemies = [];

const enemySettings = {

    rows: 5,

    cols: 10, // Default (Desktop)

    width: 60, 

    height: 60,

    spacingX: 20,

    spacingY: 20,

    startY: 80,

    speed: 2,

    direction: 1,

    dropDistance: 25

};

// =============================
// ENEMY FLEET
// =============================

const fleet = {

    x: 0,

    y: -400,

    speed: gameSettings.fleetBaseSpeed,

    direction: 1,

    dropDistance: gameSettings.fleetDropDistance,

    entered: false,

    width: 0,

    height: 0

};

// =============================
// DAMAGE DEBRIS
// =============================

const damageDebris = [];

// =============================
// DAMAGE SPRITE PIECES
// =============================

const debrisGrid = {

    rows: 3,

    cols: 3

};

// =============================
// GLOWING SPARKS
// =============================

const sparks = [];

// =============================
// DIFFICULTY
// =============================

const difficulty = {

    fleetSpeedMultiplier: 1,

    enemyFireMultiplier: 1

};

// =============================
// ENEMY FIRING
// =============================

const enemyFire = {

    cooldown:  gameSettings.enemyFireCooldown

};

function updateLivesUI() {

    livesDisplay.textContent =
        "LIVES: " + playerState.lives;

}

function updateScoreUI() {

    document.getElementById("score").textContent =
        "Score: " + score;

}

// =============================
// FLEET LIMIT
// =============================

const fleetLimit = {

    y: 0

};

// =============================
// RESPONSIVE ENEMY SIZE
// =============================

function updateEnemyScale() {

    if (canvas.width >= 1400) {

        player.speed = gameSettings.playerSpeed;


        player.width = 64;
        player.height = 64;

        enemySettings.width = 48;
        enemySettings.height = 48;

        enemySettings.spacingX = 16;
        enemySettings.spacingY = 16;

        enemySettings.cols = 10;

        difficulty.fleetSpeedMultiplier = 1.00;
        difficulty.enemyFireMultiplier = 1.00;

        fleet.dropDistance =
            gameSettings.fleetDropDistance;

        enemyFire.cooldown =
            gameSettings.enemyFireCooldown;

    }

    else if (canvas.width >= 1000) {

        player.speed = gameSettings.playerSpeed;


        player.width = 56;
        player.height = 56;

        enemySettings.width = 42;
        enemySettings.height = 42;

        enemySettings.spacingX = 14;
        enemySettings.spacingY = 14;

        enemySettings.cols = 9;

        difficulty.fleetSpeedMultiplier = 1.05;
        difficulty.enemyFireMultiplier = 1.03;

        fleet.dropDistance =
            gameSettings.fleetDropDistance - 2;

        enemyFire.cooldown =
            gameSettings.enemyFireCooldown - 50;

    }

    else if (canvas.width >= 768) {

        player.speed = gameSettings.playerSpeed;


        player.width = 48;
        player.height = 48;

        enemySettings.width = 36;
        enemySettings.height = 36;

        enemySettings.spacingX = 12;
        enemySettings.spacingY = 12;

        enemySettings.cols = 8;

        difficulty.fleetSpeedMultiplier = 1.08;
        difficulty.enemyFireMultiplier = 1.05;

        fleet.dropDistance =
            gameSettings.fleetDropDistance - 4;

        enemyFire.cooldown =
            gameSettings.enemyFireCooldown - 100;

    }

    else {

        player.speed = gameSettings.playerSpeed;


        player.width = 40;
        player.height = 40;

        enemySettings.width = 30;
        enemySettings.height = 30;

        enemySettings.spacingX = 8;
        enemySettings.spacingY = 8;

        enemySettings.cols = 6;

        difficulty.fleetSpeedMultiplier = 1.10;
        difficulty.enemyFireMultiplier = 1.08;

        fleet.dropDistance =
            gameSettings.fleetDropDistance - 6;

        enemyFire.cooldown =
            gameSettings.enemyFireCooldown - 150;

    }

}

// =============================
// ENEMY SHOOT TIMER
// =============================

let lastEnemyShot = 0;


// =============================
// FIRE COOLDOWN
// =============================

let lastShotTime = 0;

// =============================
// KEYBOARD CONTROLS
// =============================

const keys = {};

window.addEventListener("keydown", (e) => {

    keys[e.key] = true;

    if (e.code === "Space") {

        e.preventDefault();

        shoot();

    }

});

window.addEventListener("keyup", (e) => {

    keys[e.key] = false;

});

window.addEventListener(

    "keydown",

    function(e){

        if(

            gameOver &&

            e.key === "Enter"

        ){

            window.location.href =

                "ships.html";

        }

    }

);

// =============================
// SHOOT
// =============================

function shoot() {

    if (!gameStarted) return;

    const currentTime = Date.now();

    if (currentTime - lastShotTime < gameSettings.playerFireCooldown) {

        return;

    }

    lastShotTime = currentTime;

    bullets.push({

        x: player.x + player.width / 2 - bullet.width / 2,

        y: player.y,

        width: bullet.width,

        height: bullet.height

    });

}

// =============================
// UPDATE PLAYER BULLETS
// =============================

function updateBullets() {

    for (

        let i = bullets.length - 1;

        i >= 0;

        i--

    ) {

        bullets[i].y -= bullet.speed;

        if (

            bullets[i].y + bullets[i].height < 0

        ) {

            bullets.splice(i, 1);

        }

    }

}

// =============================
// DRAW PLAYER BULLETS
// =============================

function drawBullets() {

    ctx.fillStyle = "#00FFFF";

    for (const b of bullets) {

        ctx.fillRect(

            b.x,

            b.y,

            b.width,

            b.height

        );

    }

}

function enemyShoot() {

    if (!fleet.entered) return;

    const currentTime = Date.now();

    if (
        currentTime - lastEnemyShot <
        enemyFire.cooldown
    ) {
        return;
    }

    lastEnemyShot = currentTime;

    if (enemies.length === 0) return;

    // Pick a random living enemy
    const shooter =
        enemies[
            Math.floor(
                Math.random() * enemies.length
            )
        ];

    enemyBullets.push({

        x:
            fleet.x +
            shooter.offsetX +
            shooter.width / 2 - 4,

        y:
            fleet.y +
            shooter.offsetY +
            shooter.height,

        width: 8,

        height: 24,

        speed: 6

    });

}

function updateEnemyBullets() {

    for (

        let i = enemyBullets.length - 1;

        i >= 0;

        i--

    ) {

        enemyBullets[i].y +=

            enemyBullets[i].speed;

        if (

            enemyBullets[i].y >

            canvas.height

        ) {

            enemyBullets.splice(i, 1);

        }

    }

}

// =============================
// PLAYER COLLISION
// =============================

function checkPlayerHit() {

    if (playerState.invincible) {

        if (

            Date.now() - playerState.lastHitTime >

            playerState.invincibleDuration

        ) {

            playerState.invincible = false;

        }

        return;

    }

    for (

        let i = enemyBullets.length - 1;

        i >= 0;

        i--

    ) {

        const bullet = enemyBullets[i];

        if (

            bullet.x < player.x + player.width &&

            bullet.x + bullet.width > player.x &&

            bullet.y < player.y + player.height &&

            bullet.y + bullet.height > player.y

        ) {

            enemyBullets.splice(i, 1);

            impactX =
                bullet.x +
                bullet.width / 2;

            impactY =
                bullet.y +
                bullet.height / 2;

            playerState.lives--;

            if (

                playerState.lives === 2

            ) {

                createDamageDebris(

                    playerDamageSet[0],

                    impactX,

                    impactY

                );

            }

            else if (

                playerState.lives === 1

            ) {

                createDamageDebris(

                    playerDamageSet[1],

                    impactX,

                    impactY

                );

            }

            updateLivesUI();

            playerState.invincible = true;

            playerState.lastHitTime = Date.now();

            blinkTimer = blinkDuration;

            impactFlashTimer = impactFlashDuration;

            if (

                playerState.lives <= 0

            ) {

                enemyBullets.length = 0;

                startPlayerExplosion();

            }
            else {

                playerState.invincible = true;

                playerState.lastHitTime = Date.now();

                blinkTimer = blinkDuration;

                impactFlashTimer = impactFlashDuration;

            }

            console.log(

                "Lives:",

                playerState.lives

            );

            break;

        }

    }

}

// =============================
// PLAYER BULLET VS ENEMIES
// =============================

function checkBulletHits() {

    for (

        let b = bullets.length - 1;

        b >= 0;

        b--

    ) {

        const bullet = bullets[b];

        for (

            let e = enemies.length - 1;

            e >= 0;

            e--

        ) {

            const enemy = enemies[e];

            const enemyX =

                fleet.x +

                enemy.offsetX;

            const enemyY =

                fleet.y +

                enemy.offsetY;

            if (

                bullet.x < enemyX + enemy.width &&

                bullet.x + bullet.width > enemyX &&

                bullet.y < enemyY + enemy.height &&

                bullet.y + bullet.height > enemyY

            ) {

                bullets.splice(b, 1);

                score += enemy.points;

                updateScoreUI();

                createEnemyExplosion(

                    enemyX + enemy.width / 2,

                    enemyY + enemy.height / 2

                );

                enemies.splice(e, 1);

                return;

            }

        }

    }

}

// =============================
// CREATE DAMAGE DEBRIS
// =============================

function createDamageDebris(image, hitX, hitY, power = 1) {

    const pieceWidth =
        player.width / debrisGrid.cols;

    const pieceHeight =
        player.height / debrisGrid.rows;

    // Center of the player ship

    const centerX =
        player.x + player.width / 2;

    const centerY =
        player.y + player.height / 2;

    for (

        let row = 0;

        row < debrisGrid.rows;

        row++

    ) {

        for (

            let col = 0;

            col < debrisGrid.cols;

            col++

        ) {

            // Center of this fragment

            const pieceCenterX =
                player.x +
                col * pieceWidth +
                pieceWidth / 2;

            const pieceCenterY =
                player.y +
                row * pieceHeight +
                pieceHeight / 2;

            // Distance from impact point

            const impactDX =
                pieceCenterX - hitX;

            const impactDY =
                pieceCenterY - hitY;

            const impactDistance =
                Math.sqrt(

                    impactDX * impactDX +

                    impactDY * impactDY

                );

            // Direction from ship center

            let dirX =
                pieceCenterX - centerX;

            let dirY =
                pieceCenterY - centerY;

            // Normalize

            const length =
                Math.sqrt(
                    dirX * dirX +
                    dirY * dirY
                ) || 1;

            dirX /= length;
            dirY /= length;

            const maxDistance =
                Math.sqrt(

                    player.width * player.width +

                    player.height * player.height

                );

            const force =

                1 -

                Math.min(

                    impactDistance /

                    maxDistance,

                    1

                );

            const speed =

                (

                    2 +

                    force * 6 +

                    Math.random() * 2

                ) * power;

            // Create sparks from this piece

            createSparks(

                pieceCenterX,

                pieceCenterY,

                3 + Math.floor(Math.random() * 3)

            );

            damageDebris.push({

                image: image,

                sx: col * pieceWidth,

                sy: row * pieceHeight,

                sw: pieceWidth,

                sh: pieceHeight,

                x:
                    pieceCenterX - pieceWidth / 2,

                y:
                    pieceCenterY - pieceHeight / 2,

                width: pieceWidth,

                height: pieceHeight,

                speedX:
                    dirX * speed,

                speedY:
                    dirY * speed,

                rotation:
                    Math.random() * 360,

                rotationSpeed:

                    (

                        (Math.random() - 0.5) *

                        (6 + force * 12)

                    ) * power,

                life: 40

            });

        }

    }

}

// =============================
// START PLAYER EXPLOSION
// =============================

function startPlayerExplosion() {

    playerExploding = true;

    explosionTimer = explosionDuration;

    playerExplosionAlpha = 1;

    impactFlashTimer = 0;

    // Massive debris explosion

    createFinalExplosion();

    shockwave.active = true;

    shockwave.x =
        player.x + player.width / 2;

    shockwave.y =
        player.y + player.height / 2;

    shockwave.radius = 0;

    shockwave.alpha = 1;

}

// =============================
// FINAL PLAYER EXPLOSION
// =============================

function createFinalExplosion() {

    const oldCols = debrisGrid.cols;

    const oldRows = debrisGrid.rows;

    debrisGrid.cols = 6;

    debrisGrid.rows = 6;

    createDamageDebris(

        currentPlayerSprite,

        player.x + player.width / 2,

        player.y + player.height / 2,

        2.5

    );

    createSparks(

        player.x + player.width / 2,

        player.y + player.height / 2,

        120

    );

    debrisGrid.cols = oldCols;

    debrisGrid.rows = oldRows;

}

// =============================
// CREATE SPARKS
// =============================

function createSparks(x, y, count, directionX = 0, directionY = 0) {

    for (let i = 0; i < count; i++) {

        const angle = Math.random() * Math.PI * 2;

        const speed = 4 + Math.random() * 4;

        sparks.push({

            x: x,

            y: y,

            vx: Math.cos(angle) * speed,

            vy: Math.sin(angle) * speed,

            life: 20 + Math.random() * 10,

            maxLife: 30,

            size: 1 + Math.random() * 2

        });

    }

}

// =============================
// UPDATE SPARKS
// =============================

function updateSparks() {

    for (

        let i = sparks.length - 1;

        i >= 0;

        i--

    ) {

        const s = sparks[i];

        s.x += s.vx;

        s.y += s.vy;

        // Slight gravity

        s.vy += 0.1;

        // Air resistance

        s.vx *= 0.98;

        s.vy *= 0.98;

        s.life--;

        if (s.life <= 0) {

            sparks.splice(i, 1);

        }

    }

}

// =============================
// CREATE ENEMY EXPLOSION
// =============================

function createEnemyExplosion(x, y) {

    enemyExplosions.push({

        x: x,

        y: y,

        radius: 8,

        alpha: 1

    });

}

// =============================
// UPDATE ENEMY EXPLOSIONS
// =============================

function updateEnemyExplosions() {

    for (

        let i = enemyExplosions.length - 1;

        i >= 0;

        i--

    ) {

        const explosion = enemyExplosions[i];

        explosion.radius += 2;

        explosion.alpha -= 0.06;

        if (

            explosion.alpha <= 0

        ) {

            enemyExplosions.splice(i, 1);

        }

    }

}

// =============================
// DRAW ENEMY EXPLOSIONS
// =============================

function drawEnemyExplosions() {

    for (

        const explosion of enemyExplosions

    ) {

        ctx.save();

        ctx.globalAlpha = explosion.alpha;

        ctx.fillStyle = "#FFD54A";

        ctx.beginPath();

        ctx.arc(

            explosion.x,

            explosion.y,

            explosion.radius,

            0,

            Math.PI * 2

        );

        ctx.fill();

        ctx.restore();

    }

}

// =============================
// UPDATE PLAYER EXPLOSION
// =============================

function updatePlayerExplosion() {

    if (!playerExploding) {

        return;

    }

    explosionTimer -= 16;

    playerExplosionAlpha =

        explosionTimer /

        explosionDuration;

    if (explosionTimer <= 0) {

        playerExploding = false;

        gameStarted = false;

        gameOver = true;

        gameOverStartTime = Date.now();

    }

}

// =============================
// UPDATE SHOCKWAVE
// =============================

function updateShockwave() {

    if (!shockwave.active) {

        return;

    }

    shockwave.radius += 8;

    shockwave.alpha -= 0.04;

    if (

        shockwave.radius >= shockwave.maxRadius ||

        shockwave.alpha <= 0

    ) {

        shockwave.active = false;

    }

}

// =============================
// DRAW SPARKS
// =============================

function drawSparks() {

    for (const s of sparks) {

        const alpha =

            s.life / s.maxLife;

        const size =

            s.size * alpha;

        const gradient =

            ctx.createRadialGradient(

                s.x,

                s.y,

                0,

                s.x,

                s.y,

                size * 3

            );

        gradient.addColorStop(

            0,

            `rgba(255,255,180,${alpha})`

        );

        gradient.addColorStop(

            0.4,

            `rgba(255,180,0,${alpha})`

        );

        gradient.addColorStop(

            1,

            "rgba(255,120,0,0)"

        );

        ctx.fillStyle = gradient;

        ctx.beginPath();

        ctx.arc(

            s.x,

            s.y,

            size,

            0,

            Math.PI * 2

        );

        ctx.fill();

    }

}

// =============================
// DRAW SHOCKWAVE
// =============================

function drawShockwave() {

    if (!shockwave.active) {

        return;

    }

    ctx.save();

    ctx.strokeStyle =

        `rgba(255,255,255,${shockwave.alpha})`;

    ctx.lineWidth = 5;

    ctx.beginPath();

    ctx.arc(

        shockwave.x,

        shockwave.y,

        shockwave.radius,

        0,

        Math.PI * 2

    );

    ctx.stroke();

    ctx.restore();

}

// =============================
// UPDATE DAMAGE DEBRIS
// =============================

function updateDamageDebris() {

    for (

        let i = damageDebris.length - 1;

        i >= 0;

        i--

    ) {

        const d = damageDebris[i];

        d.x += d.speedX;

        d.y += d.speedY;

        d.speedY += 0.15;

        d.rotation += d.rotationSpeed;

        d.life--;

        if (d.life <= 0) {

            damageDebris.splice(i, 1);

        }

    }

}

// =============================
// DRAW DAMAGE DEBRIS
// =============================

function drawDamageDebris() {

    for (

        const piece of damageDebris

    ) {

        ctx.save();

        ctx.translate(

            piece.x +

            piece.width / 2,

            piece.y +

            piece.height / 2

        );

        ctx.rotate(

            piece.rotation *

            Math.PI / 180

        );

        ctx.drawImage(

            piece.image,

            piece.sx,

            piece.sy,

            piece.sw,

            piece.sh,

            -piece.width / 2,

            -piece.height / 2,

            piece.width,

            piece.height

        );

        ctx.restore();

    }

}

function drawEnemyBullets() {

    for (

        const bullet of enemyBullets

    ) {

        ctx.drawImage(

            enemyLaser,

            bullet.x,

            bullet.y,

            bullet.width,

            bullet.height

        );

    }

}

// =============================
// COUNTDOWN
// =============================

let count = 3;

function startCountdown() {

    countdown.textContent = count;

    const timer = setInterval(() => {

        count--;

        if (count > 0) {

            countdown.textContent = count;

        }

        else if (count === 0) {

            countdown.textContent = "GO!";

        }

        else {

            clearInterval(timer);

            countdown.style.display = "none";

            gameStarted = true;

        }

    }, 1000);

}

// =============================
// UPDATE
// =============================

function update() {

    if (

        !gameStarted ||

        gameOver

    ){

        return;

    }

    if (playerExploding) {

        updatePlayerExplosion();

        updateDamageDebris();

        updateSparks();

        updateShockwave();

        return;

    }

    if (keys["ArrowLeft"] || keys["a"] || touchLeft) {

        player.x -= player.speed;

    }

    if (keys["ArrowRight"] || keys["d"] || touchRight) {

        player.x += player.speed;

    }

    if (player.x < 0) {

        player.x = 0;

    }

    if (player.x > canvas.width - player.width) {

        player.x = canvas.width - player.width;

    }

    // =============================
    // ENEMY ENTRY
    // =============================

    if(!fleet.entered){

        if(fleet.y < enemySettings.startY){

            fleet.y += 2;

        }

        else{

            fleet.entered = true;

        }

    }

    // =============================
    // FLEET MOVEMENT
    // =============================

    if (fleet.entered) {

        fleet.x +=
            fleet.speed * 
            difficulty.fleetSpeedMultiplier *
            fleet.direction;

        if (

            fleet.direction === 1 &&

            fleet.x + fleet.width >= canvas.width

        ) {

            fleet.direction = -1;

            if (fleet.y + fleet.height + fleet.dropDistance < fleetLimit.y) {

                fleet.y += fleet.dropDistance;

            }

        }

        else if (

            fleet.direction === -1 &&

            fleet.x <= 0

        ) {

            fleet.direction = 1;

            if (fleet.y + fleet.height + fleet.dropDistance < fleetLimit.y) {

                fleet.y += fleet.dropDistance;

            }

        }

    }

    // =============================
    // PLAYER BULLETS
    // =============================

    updateBullets();

    checkBulletHits();

    // =============================
    // ENEMY SHOOTING
    // =============================

    enemyShoot();

    updateEnemyBullets();

    updateDamageDebris();

    updateSparks();

    updateEnemyExplosions();

    updatePlayerExplosion();

    updateShockwave();

    if (impactFlashTimer > 0) {

        impactFlashTimer -= 16;

        if (impactFlashTimer < 0) {

            impactFlashTimer = 0;

        }

    }

    if (blinkTimer > 0) {

        blinkTimer -= 16;

        if (blinkTimer < 0) {

            blinkTimer = 0;

        }

    }

    checkPlayerHit();

    // Continuous firing

    if (keys[" "] || touchFire) {

        shoot();

    }

}

// =============================
// DRAW
// =============================

function draw() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for(const enemy of enemies){

        if(enemy.image.complete){

            ctx.drawImage(

                enemy.image,

                fleet.x + enemy.offsetX,

                fleet.y + enemy.offsetY,

                enemy.width,

                enemy.height

            );

        }

    }

    // =============================
    // ENEMY BULLETS
    // =============================

    drawEnemyBullets();

    const visible =

        blinkTimer <= 0 ||

        Math.floor(

            blinkTimer /

            blinkInterval

        ) % 2 === 0;

    if (

        visible &&

        currentPlayerSprite.complete

    ) {

        ctx.save();

        ctx.globalAlpha =

            playerExploding

                ? playerExplosionAlpha

                : 1;

        ctx.drawImage(

            currentPlayerSprite,

            player.x,

            player.y,

            player.width,

            player.height

        );

        ctx.restore();

    }

    // =============================
    // IMPACT FLASH
    // =============================

    console.log(
        "Flash:",
        impactFlashTimer,
        "Exploding:",
        playerExploding,
        "GameOver:",
        gameOver
    );

    if (
        
        impactFlashTimer > 0  && 
        
        !playerExploding
    ) {

        const alpha =

            impactFlashTimer /

            impactFlashDuration;

        ctx.fillStyle =

            `rgba(255,255,255,${alpha * 0.8})`;

        ctx.beginPath();

        ctx.arc(

            player.x + player.width / 2,

            player.y + player.height / 2,

            player.width * 0.8,

            0,

            Math.PI * 2

        );

        ctx.fill();

    }

    drawShockwave();

    drawSparks();

    drawEnemyExplosions();

    drawDamageDebris();

    // =============================
    // PLAYER BULLETS
    // =============================

    drawBullets();
    
    // =============================
    // GAME OVER SCREEN
    // =============================

    if (gameOver) {

        const elapsed =

            Date.now() -

            gameOverStartTime;

        // Fade background

        overlayAlpha =

            Math.min(

                elapsed / 500,

                0.75

            );

        ctx.fillStyle =

            `rgba(0,0,0,${overlayAlpha})`;

        ctx.fillRect(

            0,

            0,

            canvas.width,

            canvas.height

        );

        // Fade GAME OVER

        gameOverAlpha =

            Math.min(

                Math.max(

                    (elapsed - 300) / 400,

                    0

                ),

                1

            );

        ctx.fillStyle =

            `rgba(255,255,255,${gameOverAlpha})`;

        ctx.textAlign = "center";

        ctx.font =

            "bold 90px Arial";

        ctx.fillText(

            "GAME OVER",

            canvas.width / 2,

            canvas.height / 2 - 80

        );

        // Fade SCORE

        scoreAlpha =

            Math.min(

                Math.max(

                    (elapsed - 700) / 400,

                    0

                ),

                1

            );

        ctx.fillStyle =

            `rgba(255,255,255,${scoreAlpha})`;

        ctx.font =

            "42px Arial";

        ctx.fillText(

            "SCORE : " + score,

            canvas.width / 2,

            canvas.height / 2

        );

        // Blinking ENTER

        if (

            elapsed > 1200

        ) {

            if (

                Math.floor(

                    elapsed / 500

                ) % 2 === 0

            ) {

                ctx.fillStyle = "white";

                ctx.font =

                    "28px Arial";

                ctx.fillText(

                    "Press ENTER to Return",

                    canvas.width / 2,

                    canvas.height / 2 + 80

                );

            }

        }

        ctx.textAlign = "left";

    }

}

function createEnemies() {

    enemies.length = 0;

    updateEnemyScale();

    const fleetWidth =

        enemySettings.cols * enemySettings.width +

        (enemySettings.cols - 1) * enemySettings.spacingX;

    fleet.width = fleetWidth;

    fleet.height =
        enemySettings.rows * enemySettings.height +
        (enemySettings.rows - 1) * enemySettings.spacingY;    

    fleet.x =

        (canvas.width - fleetWidth) / 2;

    fleet.y = -450;

    fleet.entered = false;

    for (let row = 0; row < enemySettings.rows; row++) {

        for (let col = 0; col < enemySettings.cols; col++) {

            let image;

            if(row === 0){

                image = enemyImages.green;

            }

            else if(row === 1){

                image = enemyImages.blue;

            }

            else if(row === 2){

                image = enemyImages.red;

            }

            else{

                image = enemyImages.black;

            }

            enemies.push({

                offsetX:

                    col *

                    (enemySettings.width +

                     enemySettings.spacingX),

                offsetY:

                    row *

                    (enemySettings.height +

                     enemySettings.spacingY),

                width:

                    enemySettings.width,

                height:

                    enemySettings.height,

                image:

                    image,

                points: 10

            });

        }

    }

}

// =============================
// GAME LOOP
// =============================

function gameLoop() {

    update();

    draw();

    requestAnimationFrame(gameLoop);

}

// =============================
// START GAME
// =============================

resizeCanvas();

setPlayerStart();

createEnemies();

updateLivesUI();

startCountdown();

gameLoop();