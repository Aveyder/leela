import Component from "./Component";

export default class MovementComponent extends Component {

  public dx!: number;
  public dy!: number;

  public vx!: number;
  public vy!: number;

  public speed: number;

  constructor(speed: number) {
    super();

    this.speed = speed;
  }

  public init(): void {
    this.dx = 0;
    this.dy = 0;

    this.vx = 0;
    this.vy = 0;
  }

  public update(delta: number): void {
    this.vx = this.dx * this.speed;
    this.vy = this.dy * this.speed;

    this.gameObject.x += this.vx * delta;
    this.gameObject.y += this.vy * delta;
  }
}
