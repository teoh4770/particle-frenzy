import { Player } from "./classes";

export function handleWindowClick(
  player: Player,
  clickHandler: (velocity: { x: number; y: number }) => void,
) {
  window.addEventListener("click", (e: MouseEvent) => {
    const angle = Math.atan2(e.clientY - player.y, e.clientX - player.x);
    const speedFactor = 5;
    const velocity = {
      x: Math.cos(angle) * speedFactor,
      y: Math.sin(angle) * speedFactor,
    };

    clickHandler(velocity);
  });
}
