import ModelComponent from "./ModelComponent";
import SceneComponent from "./phaser/SceneComponent";
import WorldScene from "../world/WorldScene";

export default class MovementComponent extends SceneComponent<WorldScene> {

  public dx!: number;
  public dy!: number;

  public vx!: number;
  public vy!: number;

  public speed: number = 150;

  private modelComponent: null | ModelComponent;

  constructor() {
    super();

    this.modelComponent = null;
  }

  public start(): void {
    this.dx = 0;
    this.dy = 0;

    this.vx = 0;
    this.vy = 0;

    this.modelComponent = this.gameObject.getComponent(ModelComponent);
  }

  public update(delta: number): void {
    this.vx = this.dx * this.speed;
    this.vy = this.dy * this.speed;

    this.gameObject.x += this.vx * delta / 1000;
    this.gameObject.y += this.vy * delta / 1000;
  }
}
