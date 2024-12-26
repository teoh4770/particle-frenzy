import gsap from "gsap";
import "./style.css";
import { Enemy, Particle, Player, Projectile } from "./classes";
import { handleWindowClick } from "./eventListeners";
import { scoreEl, bigScoreEl, modelEl, startGameBtn } from "./elements";

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
  let score: number;

  /***********************/
  /*** Event Listeners ***/
  /***********************/
  handleWindowClick(player, projectiles, c);

  startGameBtn.addEventListener("click", () => {
    init();
    animate();
    spawnEnemies();
    modelEl.style.display = "none";
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
    score = 0;
    scoreEl.textContent = String(0);
    bigScoreEl.textContent = String(0);
  }

  function spawnEnemies() {
    requestAnimationFrame(spawnEnemies);
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

    // Show and update the game over model
    modelEl.style.display = "flex";
    bigScoreEl.textContent = String(score);
    startGameBtn.textContent = "Restart";
  }

  // Animation loop: Allow us to call a callback continously
  // e.g. We can continously call 'animate' function itself
  let animationId: number;
  function animate() {
    animationId = requestAnimationFrame(animate);

    // Clearing all objects on canvas
    // c.clearRect(0, 0, canvas.width, canvas.height);
    c.fillStyle = "rgba(0, 0, 0, 0.1)";
    c.fillRect(0, 0, canvas.width, canvas.height);

    player.draw();
    particles.forEach((particle, id) => {
      // Remove particle from screen
      if (particle.alpha <= 0) {
        particles.splice(id, 1);
      } else {
        particle.update();
      }
    });
    projectiles.forEach((projectile, id) => {
      projectile.update();

      // Remove from edges of screen
      const xLeftBound = projectile.x + projectile.radius <= 0;
      const xRightBound = projectile.x - projectile.radius >= canvas.width;
      const yTopBound = projectile.y + projectile.radius <= 0;
      const yBottomBound = projectile.y - projectile.radius >= canvas.height;
      if (xLeftBound || xRightBound || yTopBound || yBottomBound) {
        setTimeout(() => {
          projectiles.splice(id, 1);
        }, 0);
      }
    });
    enemies.forEach((enemy, enemyId) => {
      enemy.update();

      // Collision detection between enemy and projectile
      projectiles.forEach((projectile, projectileId) => {
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
            setTimeout(() => {
              projectiles.splice(projectileId, 1);
            }, 0);
          } else {
            // Remove from scene altogether
            score += 250;
            scoreEl.textContent = String(score);
            // Till the very next frame to start remove the detected objects from the arrays, to avoid flickering
            setTimeout(() => {
              enemies.splice(enemyId, 1);
              projectiles.splice(projectileId, 1);
            }, 0);
          }
        }
      });

      // Collision detection between enemy and player
      const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

      // Enemy hits player
      if (dist - player.radius - enemy.radius < 1) {
        gameOver();
      }
    });
  }
}
