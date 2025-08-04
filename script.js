const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 400;

let gravity = 1;
let speedMultiplier = 1;
let frame = 0;
let powerCooldown = 0;
let playerHistory = [];

const player = {
  x: 50,
  y: 300,
  vy: 0,
  width: 30,
  height: 30,
  color: "#00ffcc",
  jump() {
    if (this.y >= canvas.height - this.height) {
      this.vy = -18;
    }
  },
  update() {
    this.vy += gravity * speedMultiplier;
    this.y += this.vy * speedMultiplier;
    if (this.y > canvas.height - this.height) {
      this.y = canvas.height - this.height;
      this.vy = 0;
    }
  },
  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  },
};

const orbs = [];
const obstacles = [];

function spawnOrb() {
  orbs.push({ x: canvas.width, y: Math.random() * 300 + 50, size: 15 });
}

function spawnObstacle() {
  obstacles.push({ x: canvas.width, y: canvas.height - 30, width: 20, height: 30 });
}

let powers = {
  slow: 100,
  reverse: 100,
};

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Save history for reverse
  if (frame % 2 === 0) playerHistory.push({ x: player.x, y: player.y, vy: player.vy });
  if (playerHistory.length > 150) playerHistory.shift();

  player.update();
  player.draw();

  // Obstacles
  obstacles.forEach((obs, i) => {
    obs.x -= 6 * speedMultiplier;
    ctx.fillStyle = "red";
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

    if (
      player.x < obs.x + obs.width &&
      player.x + player.width > obs.x &&
      player.y < obs.y + obs.height &&
      player.y + player.height > obs.y
    ) {
      alert("💀 Game Over!");
      location.reload();
    }
  });

  // Orbs
  orbs.forEach((orb, i) => {
    orb.x -= 4 * speedMultiplier;
    ctx.fillStyle = "lime";
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, orb.size, 0, Math.PI * 2);
    ctx.fill();

    if (
      player.x < orb.x + orb.size &&
      player.x + player.width > orb.x - orb.size &&
      player.y < orb.y + orb.size &&
      player.y + player.height > orb.y - orb.size
    ) {
      powers.slow = 100;
      powers.reverse = 100;
      orbs.splice(i, 1);
    }
  });

  frame++;
  if (frame % 100 === 0) spawnObstacle();
  if (frame % 200 === 0) spawnOrb();
  if (frame % 500 === 0) speedMultiplier += 0.1;

  requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") player.jump();
  if (e.key === "s" && powers.slow > 0) {
    speedMultiplier = 0.4;
    powers.slow = 0;
    setTimeout(() => (speedMultiplier = 1), 1000);
  }
  if (e.key === "r" && powers.reverse > 0) {
    let state = playerHistory[playerHistory.length - 20] || playerHistory[0];
    if (state) {
      player.x = state.x;
      player.y = state.y;
      player.vy = state.vy;
      powers.reverse = 0;
    }
  }
});

requestAnimationFrame(gameLoop);
```
