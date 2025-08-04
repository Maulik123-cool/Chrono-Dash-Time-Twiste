const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 400;

const menu = document.getElementById("menu");
const startBtn = document.getElementById("startBtn");
const instructions = document.getElementById("instructions");
const hud = document.getElementById("hud");
const slowPowerBar = document.getElementById("slowPowerBar");
const reversePowerBar = document.getElementById("reversePowerBar");
const gameOverMenu = document.getElementById("gameOverMenu");
const finalScoreDisplay = document.getElementById("finalScore");
const restartBtn = document.getElementById("restartBtn");
const scoreDisplay = document.getElementById("score");

let gravity = 1;
let speedMultiplier = 1;
let frame = 0;
let playerHistory = [];
let score = 0;
let isRunning = false;

const powers = {
  slow: 100,
  reverse: 100,
};

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

function resetGame() {
  frame = 0;
  score = 0;
  player.x = 50;
  player.y = 300;
  player.vy = 0;
  speedMultiplier = 1;
  playerHistory.length = 0;
  orbs.length = 0;
  obstacles.length = 0;
  powers.slow = 100;
  powers.reverse = 100;
  updatePowerBars();
  scoreDisplay.textContent = score;
}

function updatePowerBars() {
  slowPowerBar.style.width = powers.slow + "%";
  reversePowerBar.style.width = powers.reverse + "%";
}

function startGame() {
  menu.style.display = "none";
  gameOverMenu.style.display = "none";
  canvas.style.display = "block";
  instructions.style.display = "block";
  hud.style.display = "flex";
  resetGame();
  isRunning = true;
  requestAnimationFrame(gameLoop);
}

function gameOver() {
  isRunning = false;
  finalScoreDisplay.textContent = score;
  gameOverMenu.style.display = "block";
  canvas.style.display = "none";
  instructions.style.display = "none";
  hud.style.display = "none";
}

function gameLoop() {
  if (!isRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Save history for reverse every 2 frames
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
      gameOver();
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
      updatePowerBars();
    }
  });

  frame++;
  score = Math.floor(frame / 10);
  scoreDisplay.textContent = score;

  if (frame % 100 === 0) spawnObstacle();
  if (frame % 200 === 0) spawnOrb();
  if (frame % 500 === 0) speedMultiplier += 0.1;

  requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (e) => {
  if (!isRunning) return;

  if (e.code === "Space") player.jump();

  if (e.key === "s" && powers.slow > 0) {
    speedMultiplier = 0.4;
    powers.slow = 0;
    updatePowerBars();
    setTimeout(() => {
      speedMultiplier = 1;
    }, 1000);
  }

  if (e.key === "r" && powers.reverse > 0) {
    let state = playerHistory[playerHistory.length - 20] || playerHistory[0];
    if (state) {
      player.x = state.x;
      player.y = state.y;
      player.vy = state.vy;
      powers.reverse = 0;
      updatePowerBars();
    }
  }
});

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", () => {
  gameOverMenu.style.display = "none";
  menu.style.display = "block";
});
