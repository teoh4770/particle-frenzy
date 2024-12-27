import gsap from "gsap";
import "./style.css";
import { Enemy, Particle, Player, Projectile } from "./classes";
import { handleWindowClick } from "./eventListeners";
import {
  startGameModelEl,
  startGameBtn,
  scoreEl,
  bigScoreEl,
  restartGameModelEl,
  restartBtn,
} from "./elements";

const canvas = document.querySelector("canvas") as HTMLCanvasElement;
canvas.width = innerWidth;
canvas.height = innerHeight;

const c = canvas.getContext("2d") as CanvasRenderingContext2D;

if (c) {
  let frame = 0;

  const x = canvas.width / 2;
  const y = canvas.height / 2;
  let player = new Player(x, y, 10, "white", c);
  let projectiles: Projectile[] = [];
  let enemies: Enemy[] = [];
  let particles: Particle[] = [];
  let animationId: number;
  let enemiesAnimationId: number;
  let score: number;

  /***********************/
  /*** Event Listeners ***/
  /***********************/
  handleWindowClick(player, (velocity) => {
    projectiles.push(
      new Projectile(player.x, player.y, 5, "white", velocity, c),
    );
  });

  startGameBtn.addEventListener("click", () => {
    init();
    animate();
    spawnEnemies();
    startGameModelEl.style.display = "none";
  });

  restartBtn.addEventListener("click", () => {
    init();
    animate();
    spawnEnemies();
    restartGameModelEl.style.display = "none";
  });

  /***********************/
  /*** Game Functions  ***/
  /***********************/
  // Reset State whenever we start the game
  function init() {
    player = new Player(x, y, 10, "white", c);
    projectiles = [];
    enemies = [];
    particles = [];
    animationId = -1;
    enemiesAnimationId = -1;
    score = 0;
    scoreEl.textContent = String(0);
    bigScoreEl.textContent = String(0);
  }

  function spawnEnemies() {
    enemiesAnimationId = requestAnimationFrame(spawnEnemies);
    frame++;

    if (frame % 60 === 0) {
      // 0 - enemy.radius
      const radius = Math.random() * (30 - 4) + 4;

      let x;
      let y;

      if (Math.random() < 0.5) {
        x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
        y = Math.random() * canvas.height;
      } else {
        x = Math.random() * canvas.width;
        y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
      }

      const color = `hsl(${Math.random() * 360}, 50%, 50%)`;

      const angle = Math.atan2(player.y - y, player.x - x);
      const velocity = {
        x: Math.cos(angle),
        y: Math.sin(angle),
      };

      enemies.push(new Enemy(x, y, radius, color, velocity, c));
    }
  }

  function gameOver() {
    // Stop animation
    cancelAnimationFrame(animationId);
    cancelAnimationFrame(enemiesAnimationId);

    // Show and update the game over model
    restartGameModelEl.style.display = "flex";
    bigScoreEl.textContent = String(score);
  }

  // Animation loop: Allow us to call a callback continously
  // e.g. We can continously call 'animate' function itself
  function animate() {
    animationId = requestAnimationFrame(animate);

    // Clearing all objects on canvas
    // c.clearRect(0, 0, canvas.width, canvas.height);
    c.fillStyle = "rgba(0, 0, 0, 0.1)";
    c.fillRect(0, 0, canvas.width, canvas.height);

    // Render all objects on the screen, such as player, particles, projectiles, enemies
    player.draw();
    for (let particleId = particles.length - 1; particleId >= 0; particleId--) {
      const particle = particles[particleId];

      // Remove particle from screen
      if (particle.alpha <= 0) {
        particles.splice(particleId, 1);
      } else {
        particle.update();
      }
    }
    for (
      let projectileId = projectiles.length - 1;
      projectileId >= 0;
      projectileId--
    ) {
      const projectile = projectiles[projectileId];

      projectile.update();

      // Remove from edges of screen
      const xLeftBound = projectile.x + projectile.radius <= 0;
      const xRightBound = projectile.x - projectile.radius >= canvas.width;
      const yTopBound = projectile.y + projectile.radius <= 0;
      const yBottomBound = projectile.y - projectile.radius >= canvas.height;
      if (xLeftBound || xRightBound || yTopBound || yBottomBound) {
        projectiles.splice(projectileId, 1);
      }
    }
    for (let enemyId = enemies.length - 1; enemyId >= 0; enemyId--) {
      const enemy = enemies[enemyId];
      enemy.update();

      // Collision detection between enemy and projectile
      for (
        let projectileId = projectiles.length - 1;
        projectileId >= 0;
        projectileId--
      ) {
        const projectile = projectiles[projectileId];

        const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

        // When projectile touches enemy
        if (dist - enemy.radius - projectile.radius < 1) {
          // Create explosions
          for (let index = 0; index < enemy.radius * 2; index++) {
            particles.push(
              new Particle(
                projectile.x,
                projectile.y,
                Math.random() * 2,
                enemy.color,
                {
                  x: (Math.random() - 0.5) * (Math.random() * 4),
                  y: (Math.random() - 0.5) * (Math.random() * 4),
                },
                c,
              ),
            );
          }

          if (enemy.radius - 10 > 5) {
            // Increase score
            score += 100;
            scoreEl.textContent = String(score);

            // Shrink enemy on hit
            // Transition to enemy radius - 10
            gsap.to(enemy, {
              radius: enemy.radius - 10,
            });
            projectiles.splice(projectileId, 1);
          } else {
            // Remove from scene altogether
            score += 250;
            scoreEl.textContent = String(score);
            // Till the very next frame to start remove the detected objects from the arrays, to avoid flickering
            enemies.splice(enemyId, 1);
            projectiles.splice(projectileId, 1);
          }
        }
      }

      // Collision detection between enemy and player
      const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

      // Enemy hits player
      if (dist - player.radius - enemy.radius < 1) {
        gameOver();
      }
    }
  }
}
