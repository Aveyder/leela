import { Keys } from "../world/Keys";
import { Vec2 } from "../../utils/math";
import WorldSceneComponent from "./WorldSceneComponent";
import MovementComponent from "./MovementComponent";

export default class ControlComponent extends WorldSceneComponent {
  private keys!: Keys;
  private movement!: MovementComponent;

  public start(): void {
    this.keys = this.scene.keys;
    this.movement = this.gameObject.getComponent(MovementComponent);
  }

  public control(): void {
    const dir = this.getVec2Keys();

    this.movement.vx = dir.x;
    this.movement.vy = dir.y;
  }

  public getVec2Keys(): Vec2 {
    const result = {x: 0, y: 0};

    result.x = 0;
    result.y = 0;

    if (this.keys.A.isDown || this.keys.left.isDown) {
      result.x -= 1;
    }
    if (this.keys.D.isDown || this.keys.right.isDown) {
      result.x += 1;
    }
    if (this.keys.W.isDown || this.keys.up.isDown) {
      result.y -= 1;
    }
    if (this.keys.S.isDown || this.keys.down.isDown) {
      result.y += 1;
    }

    return result;
  }
}
