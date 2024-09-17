const fxLaser = new Audio('laser.wav');
const fxExplode = new Audio('explosion.wav');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let score = 0;
let level = 0;
let leftPressed = false;
let rightPressed = false;
let upPressed = false;
let firePressed = false;
const leftButton = document.getElementById('leftButton');
const rightButton = document.getElementById('rightButton');
const upButton = document.getElementById('upButton');
const fireButton = document.getElementById('fireButton');
document.addEventListener('touchmove', function (event) {
    event.preventDefault();
}, { passive: false });


function isMobileDevice() {
    return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

if (isMobileDevice()) {
    document.getElementById('touchControls').style.display = 'flex';
}

leftButton.addEventListener('touchstart', () => leftPressed = true);
leftButton.addEventListener('touchend', () => leftPressed = false);

rightButton.addEventListener('touchstart', () => rightPressed = true);
rightButton.addEventListener('touchend', () => rightPressed = false);

upButton.addEventListener('touchstart', () => upPressed = true);
upButton.addEventListener('touchend', () => upPressed = false);

fireButton.addEventListener('touchstart', () => {
    firePressed = true;
    shootLaser();
});
fireButton.addEventListener('touchend', () => firePressed = false);

function getHighScores() {
    let highScores = JSON.parse(localStorage.getItem('highScores'));
    if (highScores === null) {
        highScores = [];
    }
    return highScores;
}

function saveHighScore(name, score) {
    let highScores = getHighScores();
    highScores.push({ name: name, score: score });
    highScores.sort((a, b) => b.score - a.score);
    highScores = highScores.slice(0, 10);
    localStorage.setItem('highScores', JSON.stringify(highScores));
}


window.addEventListener('resize', resizeCanvas, false);

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();

const ship = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 15,
    angle: 0,
    rotation: 0,
    thrusting: false,
    thrust: {
        x: 0,
        y: 0
    },
    canShoot: true,
    lasers: []
};

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

function keyDown(keyBoardEvent) {
    switch (keyBoardEvent.keyCode) {
        case 37:
            ship.rotation = -0.05;
            break;
        case 39:
            ship.rotation = 0.05;
            break;
        case 38:
            ship.thrusting = true;
            break;
        case 32:
            shootLaser();
            break;
    }
}

function keyUp(keyBoardEvent) {
    switch (keyBoardEvent.keyCode) {
        case 37:
        case 39:
            ship.rotation = 0;
            break;
        case 38:
            ship.thrusting = false;
            break;
        case 32:
            ship.canShoot = true;
            break;
    }
}

function createParticles(x, y, color) {
    const numParticles = 20;
    for (let i = 0; i < numParticles; i++) {
        particles.push({
            x: x,
            y: y,
            xv: (Math.random() * 2 - 1) * 2,
            yv: (Math.random() * 2 - 1) * 2,
            life: Math.random() * 30 + 30,
            color: color
        });
    }
}


let asteroids = [];
createAsteroidBelt();

function shootLaser() {
    fxLaser.currentTime = 0;
    fxLaser.play();
    if (ship.canShoot) {
        ship.lasers.push({
            x: ship.x + ship.radius * Math.cos(ship.angle),
            y: ship.y + ship.radius * Math.sin(ship.angle),
            xv: 5 * Math.cos(ship.angle),
            yv: 5 * Math.sin(ship.angle),
            distance: 0
        });
        ship.canShoot = false;
    }
}


function createAsteroidBelt() {
    level++;
    asteroids = [];
    let numAsteroids = 6 + level;
    for (let i = 0; i < numAsteroids; i++) {
        let asteroid = newAsteroid();
        while (distanceBetweenPoints(ship.x, ship.y, asteroid.x, asteroid.y) < 100 + asteroid.radius) {
            asteroid.x = Math.random() * canvas.width;
            asteroid.y = Math.random() * canvas.height;
        }
        asteroids.push(asteroid);
    }
}

function newAsteroid(x, y, radius) {
    let newX = x !== undefined ? x : Math.random() * canvas.width;
    let newY = y !== undefined ? y : Math.random() * canvas.height;
    let newRadius = radius !== undefined ? radius : Math.random() * 30 + 10;
    let level = Math.floor(Math.random() * 6) + 5;
    let offs = [];
    for (let i = 0; i < level; i++) {
        offs.push(Math.random() * 0.4 + 0.8);
    }
    return {
        x: newX,
        y: newY,
        xv: Math.random() * 2 - 1,
        yv: Math.random() * 2 - 1,
        radius: newRadius,
        angle: Math.random() * Math.PI * 2,
        vertices: level,
        offs: offs
    };
}

function distanceBetweenPoints(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
}

function update() {
    ship.angle += ship.rotation;

    for (let i = ship.lasers.length - 1; i >= 0; i--) {
        let laser = ship.lasers[i];

        laser.x += laser.xv;
        laser.y += laser.yv;

        laser.distance += Math.sqrt(laser.xv * laser.xv + laser.yv * laser.yv);

        if (laser.distance > 0.6 * Math.max(canvas.width, canvas.height)) {
            ship.lasers.splice(i, 1);
            continue;
        }

    }

    if (leftPressed) {
        ship.rotation = -0.05;
    } else if (rightPressed) {
        ship.rotation = 0.05;
    } else {
        ship.rotation = 0;
    }


    if (ship.thrusting) {
        ship.thrust.x += 0.1 * Math.cos(ship.angle);
        ship.thrust.y += 0.1 * Math.sin(ship.angle);
    } else {
        ship.thrust.x *= 0.99;
        ship.thrust.y *= 0.99;
    }

    ship.thrusting = upPressed;
    ship.x += ship.thrust.x;
    ship.y += ship.thrust.y;

    if (ship.x < 0 - ship.radius) ship.x = canvas.width + ship.radius;
    if (ship.x > canvas.width + ship.radius) ship.x = 0 - ship.radius;
    if (ship.y < 0 - ship.radius) ship.y = canvas.height + ship.radius;
    if (ship.y > canvas.height + ship.radius) ship.y = 0 - ship.radius;

    asteroids.forEach(asteroid => {
        asteroid.x += asteroid.xv;
        asteroid.y += asteroid.yv;
        asteroid.angle += 0.01;

        if (asteroid.x < 0 - asteroid.radius) asteroid.x = canvas.width + asteroid.radius;
        if (asteroid.x > canvas.width + asteroid.radius) asteroid.x = 0 - asteroid.radius;
        if (asteroid.y < 0 - asteroid.radius) asteroid.y = canvas.height + asteroid.radius;
        if (asteroid.y > canvas.height + asteroid.radius) asteroid.y = 0 - asteroid.radius;
    });

    for (let i = asteroids.length - 1; i >= 0; i--) {
        let asteroid = asteroids[i];
        for (let j = ship.lasers.length - 1; j >= 0; j--) {
            let laser = ship.lasers[j];
            if (distanceBetweenPoints(laser.x, laser.y, asteroid.x, asteroid.y) < asteroid.radius) {
                ship.lasers.splice(j, 1);
                createParticles(asteroid.x, asteroid.y, 'orange');
                score += Math.round(100 / asteroid.radius);

                if (asteroid.radius > 15) {
                    asteroids.push(newAsteroid(asteroid.x, asteroid.y, asteroid.radius / 2));
                    asteroids.push(newAsteroid(asteroid.x, asteroid.y, asteroid.radius / 2));
                }

                asteroids.splice(i, 1);
                break;
            }
        }
    }


    asteroids.forEach(asteroid => {
        if (distanceBetweenPoints(ship.x, ship.y, asteroid.x, asteroid.y) < ship.radius + asteroid.radius) {
            fxExplode.currentTime = 0;
            fxExplode.play();
            alert('Game Over!');
            let playerName = prompt('Digite seu nome:');
            saveHighScore(playerName, score);
            score = 0;
            level = 0;
            ship.x = canvas.width / 2;
            ship.y = canvas.height / 2;
            ship.thrust.x = 0;
            ship.thrust.y = 0;
            ship.lasers = [];
            ship.angle = 0;
            createAsteroidBelt();

        }
    });

    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.xv;
        p.y += p.yv;
        p.life--;
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
    if (asteroids.length === 0) {
        createAsteroidBelt();
    }


}

function drawShip(x, y, angle) {
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(
        x + ship.radius * Math.cos(angle),
        y + ship.radius * Math.sin(angle)
    );
    ctx.lineTo(
        x - ship.radius * Math.cos(angle + Math.PI / 2),
        y - ship.radius * Math.sin(angle + Math.PI / 2)
    );
    ctx.lineTo(
        x - ship.radius * Math.cos(angle - Math.PI / 2),
        y - ship.radius * Math.sin(angle - Math.PI / 2)
    );
    ctx.closePath();
    ctx.stroke();
}

function render() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Pontuação: ' + score, 20, 30);

    let highScores = getHighScores();
    ctx.font = '16px Arial';
    ctx.fillText('Ranking:', canvas.width - 150, 30);
    for (let i = 0; i < highScores.length; i++) {
        let hs = highScores[i];
        ctx.fillText(`${i + 1}. ${hs.name}: ${hs.score}`, canvas.width - 150, 50 + i * 20);
    }

    drawShip(ship.x, ship.y, ship.angle);
    ship.lasers.forEach(laser => {
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(laser.x, laser.y, 2, 0, Math.PI * 2);
        ctx.fill();
    });

    particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 2, 2);
    });


    asteroids.forEach(asteroid => {
        ctx.strokeStyle = 'slategray';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(
            asteroid.x + asteroid.radius * asteroid.offs[0] * Math.cos(asteroid.angle),
            asteroid.y + asteroid.radius * asteroid.offs[0] * Math.sin(asteroid.angle)
        );
        for (let j = 1; j < asteroid.vertices; j++) {
            ctx.lineTo(
                asteroid.x + asteroid.radius * asteroid.offs[j] * Math.cos(asteroid.angle + j * 2 * Math.PI / asteroid.vertices),
                asteroid.y + asteroid.radius * asteroid.offs[j] * Math.sin(asteroid.angle + j * 2 * Math.PI / asteroid.vertices)
            );
        }
        ctx.closePath();
        ctx.stroke();
    });
}

function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}
gameLoop();


