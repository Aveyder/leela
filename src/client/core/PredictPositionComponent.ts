import { deltaVec2, interpolate, TMP_VEC2, Vec2 } from "../../utils/math";
import WorldSession from "../WorldSession";
import PhaserAwareComponent from "./phaser/PhaserAwareComponent";
import WorldScene from "../scene/WorldScene";
import { CHAR_WIDTH, CHAT_HEIGHT } from "../../shared/Constants";
import WorldClientConfig from "../WorldClientConfig";
import ServerComponent from "./ServerComponent";
import Body from "../../shared/physics/Body";

type Input = {dir: Vec2, tick: number, prediction: Vec2};

export default class PredictPositionComponent extends PhaserAwareComponent {

  private readonly session: WorldSession;
  private readonly config: WorldClientConfig;
  private readonly simulationDelta: number;

  private scene!: WorldScene;
  private server!: ServerComponent;

  private predictedBody!: Body;
  private reconciledBody!: Body;

  private readonly inputs: Input[];

  private lerpStartTime: number;
  private lerpDuration: number;
  private readonly initPosition: Vec2;
  private readonly targetPosition: Vec2;

  private errorTimer: number;

  private lastAckTick: number;

  constructor(session: WorldSession) {
    super();

    this.session = session;
    this.config = session.config;

    this.simulationDelta = 1000 / this.config.simulationRate;

    this.inputs = [];
    this.lerpStartTime = -1;
    this.lerpDuration = -1;
    this.initPosition = {x: 0, y: 0};
    this.targetPosition = {x: 0, y: 0};

    this.errorTimer = -1;

    this.lastAckTick = -1;
  }

  start() {
    this.scene = WorldScene.get(this.game);
    this.server = this.gameObject.getComponent(ServerComponent);

    this.predictedBody = this.createBody();
    this.scene.phys.add(this.predictedBody);

    this.reconciledBody = this.createBody();
    this.scene.phys.add(this.reconciledBody);

    this.reset();
  }

  destroy() {
    this.scene.phys.remove(this.predictedBody);
    this.scene.phys.remove(this.reconciledBody);
  }

  public predict(dir: Vec2): void {
    this.initPosition.x = this.gameObject.x;
    this.initPosition.y = this.gameObject.y;

    const nextPredictedPos = this.calcNextPosition(this.reconciledBody, dir);
    this.predictedBody.setPosition(nextPredictedPos.x, nextPredictedPos.y);

    const nextReconciledPos = this.calcNextPosition(this.reconciledBody, dir);
    this.reconciledBody.setPosition(nextReconciledPos.x, nextReconciledPos.y);

    this.scene.phys.step();

    this.targetPosition.x = this.predictedBody.x;
    this.targetPosition.y = this.predictedBody.y;

    const now = Date.now();

    const lastLerpDuration = now - this.lerpStartTime;

    if (lastLerpDuration > this.lerpDuration) {
      this.lerpDuration = this.simulationDelta;
    } else {
      this.lerpDuration = 2 * this.simulationDelta - lastLerpDuration;
    }

    this.lerpStartTime = now;

    this.inputs.push(
      {
        tick: this.session.tick,
        dir,
        prediction: {
          x: this.predictedBody.x,
          y: this.predictedBody.y,
        }
      }
    );
  }

  update(delta: number): void {
    this.reconcile();

    this.smoothError(delta);

    const lerpProgress = Math.min(1, (Date.now() - this.lerpStartTime) / Math.abs(this.lerpDuration));

    if (this.lerpDuration != -1 || this.errorTimer != -1) interpolate(this.initPosition, this.targetPosition, lerpProgress, this.gameObject);
    if (lerpProgress == 1 && this.errorTimer == -1) this.reset();
  }

  private smoothError(delta: number): void {
    if (this.errorTimer != -1) {
      this.errorTimer += delta * 1000;

      const progress = Math.min(this.errorTimer / this.config.clientSmoothPosMs, 1);

      interpolate(this.predictedBody, this.reconciledBody, progress, this.targetPosition);

      const error = deltaVec2(this.targetPosition, this.reconciledBody);

      if (this.withinSmoothPosErrorPrecision(error)) {
        this.predictedBody.setPosition(this.targetPosition.x, this.targetPosition.y);

        this.errorTimer = -1;
      }
    }
  }

  public reconcile(): void {
    if (this.lastAckTick === -1) return;

    const lastProcessedTick = this.session.scope.lastProcessedTick;

    if (this.lastAckTick === lastProcessedTick) return;

    let ackIndex = -1;
    for (let i = 0; i < this.inputs.length; i++) {
      if (this.inputs[i].tick === lastProcessedTick) {
        ackIndex = i;
        break;
      }
    }

    if (ackIndex === -1) {
      throw new Error("Illegal state, ack input was not found!");
    }

    const ackInput = this.inputs.splice(0, ackIndex + 1).at(-1)!;
    const lastState = this.server.getLastState().gameObject;

    const error = deltaVec2(ackInput.prediction, lastState, TMP_VEC2);

    if (this.withinSmoothPosErrorThreshold(error)) {
      return;
    }

    this.reconciledBody.setPosition(lastState.x, lastState.y);

    this.scene.phys.step();

    for (let i = 0; i < this.inputs.length; i++) {
      const input = this.inputs[i];

      const nextReconciledPos = this.calcNextPosition(this.reconciledBody, input.dir)
      this.reconciledBody.setPosition(nextReconciledPos.x, nextReconciledPos.y);

      this.scene.phys.step();
    }

    this.refreshError();

    this.lastAckTick = lastProcessedTick;
  }

  private refreshError() {
    const error = deltaVec2(this.predictedBody, this.reconciledBody, TMP_VEC2);

    if (this.withinSmoothPosErrorPrecision(error)) {
      this.errorTimer = -1;
    } else {
      if (this.withinSmoothPosErrorThreshold(error)) {
        if (this.errorTimer == -1) {
          this.errorTimer = 0;
        }
      } else {
        this.gameObject.x = this.reconciledBody.x;
        this.gameObject.y = this.reconciledBody.y;

        this.reset();

        this.errorTimer = -1;
      }
    }
  }

  private withinSmoothPosErrorPrecision(error: Vec2) {
    return Math.abs(error.x) < this.config.clientSmoothPosErrorPrecision &&
      Math.abs(error.y) < this.config.clientSmoothPosErrorPrecision;
  }

  private withinSmoothPosErrorThreshold(error: Vec2) {
    return Math.abs(error.x) < this.config.clientSmoothPosErrorThreshold &&
      Math.abs(error.y) < this.config.clientSmoothPosErrorThreshold;
  }

  private reset() {
    this.lerpStartTime = -1;
    this.lerpDuration = -1;

    this.initPosition.x = this.targetPosition.x = this.gameObject.x;
    this.initPosition.y = this.targetPosition.y = this.gameObject.y;

    this.predictedBody.setPosition(this.gameObject.x, this.gameObject.y);
    this.reconciledBody.setPosition(this.gameObject.x, this.gameObject.y);

    this.errorTimer = -1;
  }

  private createBody(): Body {
    return new Body({x: this.gameObject.x, y: this.gameObject.y, width: CHAR_WIDTH, height: CHAT_HEIGHT});
  }

  private calcNextPosition(pos: Vec2, dir: Vec2): Vec2 {
    const mag = (dir.x != 0 && dir.y != 0) ? Math.sqrt(2) : 1;

    TMP_VEC2.x = pos.x + dir.x * this.config.charSpeed * this.simulationDelta / 1000 / mag;
    TMP_VEC2.y = pos.y + dir.y * this.config.charSpeed * this.simulationDelta / 1000 / mag;

    return TMP_VEC2;
  }
}
