import { Keys } from "../world/Keys";
import { Vec2 } from "../../utils/math";
import WorldSceneComponent from "./WorldSceneComponent";
import Sprite = Phaser.GameObjects.Sprite;
import SpriteComponent from "./SpriteComponent";

export default class MovementComponent extends WorldSceneComponent {

  public vx!: number;
  public vy!: number;

  private sprite!: Sprite;

  public start(): void {
    this.vx = 0;
    this.vy = 0;

    this.sprite = this.gameObject.getComponent(SpriteComponent).sprite;
  }

  public update(delta: number): void {
    this.gameObject.x = this.sprite.x += 150 * this.vx * delta / 1000;
    this.gameObject.y = this.sprite.y += 150 * this.vy * delta / 1000;
  }
}
