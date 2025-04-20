import { Keys } from "../resource/Keys";
import { Vec2 } from "../../utils/math";
import ContextAwareComponent from "./phaser/ContextAwareComponent";
import WorldSession from "../WorldSession";
import { Opcode } from "../../protocol/Opcode";
import Move from "../../entity/Move";
import ModelComponent from "./ModelComponent";
import PredictPositionComponent from "./PredictPositionComponent";

export default class ControlComponent extends ContextAwareComponent {

  private session: WorldSession;

  private keys: Keys;
  private model: ModelComponent;
  private predictPosition: PredictPositionComponent;

  private prevControl: Vec2;

  constructor() {
    super();

    this.prevControl = {x: 0, y: 0};
  }

  public start(): void {
    this.session = this.context.session;
    this.keys = this.context.scene.keys;
    this.model = this.gameObject.getComponent(ModelComponent);
    this.predictPosition = this.gameObject.getComponent(PredictPositionComponent);
  }

  public applyControl(): void {
    const dir = this.getVec2Keys();

    if (dir.x != 0 || dir.y != 0) {
      this.predictPosition.predict(dir);
    }

    this.model.setDirection(dir.x, dir.y);

    if (this.prevControl.x === 0 && this.prevControl.y === 0 && dir.x === 0 && dir.y === 0) return;

    this.prevControl = dir;

    this.session.sendObject<Move>(Opcode.CMSG_MOVE, {
      tick: this.session.tick, dir
    });
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
