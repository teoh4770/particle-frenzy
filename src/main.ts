import gsap from "gsap";
import "./style.css";

const canvas = document.querySelector("canvas") as HTMLCanvasElement;
const c = canvas.getContext("2d") as CanvasRenderingContext2D;

canvas.width = innerWidth;
canvas.height = innerHeight;

class Player {
  x: number;
  y: number;
  radius: number;
  color: string;

  constructor(x: number, y: number, radius: number, color: string) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }

  draw() {
    // specify that we wanna start drawing on the screen with beginPath
    // create an arc based on the given properties
    // specify the color with fill
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }
}

// Projectile is a circle that shoot from the player position to where the mouse at
class Projectile {
  x: number;
  y: number;
  radius: number;
  color: string;
  velocity: {
    x: number;
    y: number;
  };

  constructor(
    x: number,
    y: number,
    radius: number,
    color: string,
    velocity: {
      x: number;
      y: number;
    },
  ) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    // specify that we wanna start drawing on the screen with beginPath
    // create an arc/circle based on the given properties
    // specify the color
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }

  update() {
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

class Enemy {
  x: number;
  y: number;
  radius: number;
  color: string;
  velocity: {
    x: number;
    y: number;
  };

  constructor(
    x: number,
    y: number,
    radius: number,
    color: string,
    velocity: {
      x: number;
      y: number;
    },
  ) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    // specify that we wanna start drawing on the screen with beginPath
    // create an arc/circle based on the given properties
    // specify the color
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }

  update() {
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

const friction = 0.99;
class Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  velocity: {
    x: number;
    y: number;
  };
  alpha: number;

  constructor(
    x: number,
    y: number,
    radius: number,
    color: string,
    velocity: {
      x: number;
      y: number;
    },
  ) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
  }

  draw() {
    // c.save() allows us to apply global properties to the block contained within itself.
    c.save();
    c.globalAlpha = this.alpha; // Note: negative alpha will turn into positive
    // specify that we wanna start drawing on the screen with beginPath
    // create an arc/circle based on the given properties
    // specify the color
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
    c.restore();
  }

  update() {
    this.draw();
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.alpha -= 0.01;
  }
}

if (c) {
  let frame = 0;

  const x = canvas.width / 2;
  const y = canvas.height / 2;

  const player = new Player(x, y, 10, "white");
  const projectiles: Projectile[] = [];
  const enemies: Enemy[] = [];
  const particles: Particle[] = [];

  // Enemies should move towards the player
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

      enemies.push(new Enemy(x, y, radius, color, velocity));
    }
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
              ),
            );
          }

          if (enemy.radius - 10 > 5) {
            // Shrink enemy on hit
            // Transition to enemy radius - 10
            gsap.to(enemy, {
              radius: enemy.radius - 10,
            });
            setTimeout(() => {
              projectiles.splice(projectileId, 1);
            }, 0);
          } else {
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

      if (dist - player.radius - enemy.radius < 1) {
        // stop animation
        cancelAnimationFrame(animationId);
      }
    });
  }

  window.addEventListener("click", (e: MouseEvent) => {
    const angle = Math.atan2(e.clientY - player.y, e.clientX - player.x);
    const speedFactor = 5;
    const velocity = {
      x: Math.cos(angle) * speedFactor,
      y: Math.sin(angle) * speedFactor,
    };

    projectiles.push(new Projectile(x, y, 5, "white", velocity));
  });

  animate();
  spawnEnemies();
}
