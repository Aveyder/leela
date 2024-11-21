import WorldSceneComponent from "./WorldSceneComponent";
import SpriteComponent from "./SpriteComponent";
import Sprite = Phaser.GameObjects.Sprite;
import ModelComponent from "./ModelComponent";

export default class MovementComponent extends WorldSceneComponent {

  public dx!: number;
  public dy!: number;

  public vx!: number;
  public vy!: number;

  public speed: number = 150;

  private sprite!: Sprite;
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

    this.sprite = this.gameObject.getComponent(SpriteComponent).sprite;
    this.modelComponent = this.gameObject.getComponent(ModelComponent);
  }

  public update(delta: number): void {
    // maybe assing vx/vy & dx/dy in Control... cause vx/vy & dx/dy will be assigned by server
    this.vx = this.dx * this.speed;
    this.vy = this.dy * this.speed;

    this.gameObject.x = this.sprite.x += this.vx * delta / 1000;
    this.gameObject.y = this.sprite.y += this.vy * delta / 1000;

    if (!this.modelComponent) return;

    if (this.dx === 0 && this.dy === 0) {
      this.modelComponent.stay();
    } else {
      this.modelComponent.walk(this.dx, this.dy);
    }
  }
}
