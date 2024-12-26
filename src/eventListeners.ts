import { Player, Projectile } from "./classes";

export function handleWindowClick(
  player: Player,
  projectiles: Projectile[],
  context: CanvasRenderingContext2D,
) {
  window.addEventListener("click", (e: MouseEvent) => {
    const angle = Math.atan2(e.clientY - player.y, e.clientX - player.x);
    const speedFactor = 5;
    const velocity = {
      x: Math.cos(angle) * speedFactor,
      y: Math.sin(angle) * speedFactor,
    };

    projectiles.push(
      new Projectile(player.x, player.y, 5, "white", velocity, context),
    );
  });
}
