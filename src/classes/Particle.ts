export class Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  velocity: {
    x: number;
    y: number;
  };
  alpha: number;
  context: CanvasRenderingContext2D;

  static friction = 0.99;

  constructor(
    x: number,
    y: number,
    radius: number,
    color: string,
    velocity: {
      x: number;
      y: number;
    },
    context: CanvasRenderingContext2D,
  ) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.context = context;
    this.alpha = 1;
  }

  draw() {
    // this.context.save() allows us to apply global properties to the block contained within itself.
    this.context.save();
    this.context.globalAlpha = this.alpha; // Note: negative alpha will turn into positive
    // specify that we wanna start drawing on the screen with beginPath
    // create an arc/circle based on the given properties
    // specify the color
    this.context.beginPath();
    this.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    this.context.fillStyle = this.color;
    this.context.fill();
    this.context.restore();
  }

  update() {
    this.draw();
    this.velocity.x *= Particle.friction;
    this.velocity.y *= Particle.friction;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.alpha -= 0.01;
  }
}
