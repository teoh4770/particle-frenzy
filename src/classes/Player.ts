export class Player {
  x: number;
  y: number;
  radius: number;
  color: string;
  context: CanvasRenderingContext2D;

  constructor(
    x: number,
    y: number,
    radius: number,
    color: string,
    context: CanvasRenderingContext2D,
  ) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.context = context;
  }

  draw() {
    // specify that we wanna start drawing on the screen with beginPath
    // create an arc based on the given properties
    // specify the color with fill
    this.context.beginPath();
    this.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    this.context.fillStyle = this.color;
    this.context.fill();
  }
}
