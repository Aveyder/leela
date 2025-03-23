import { deltaVec2, interpolate, TMP_VEC2, Vec2 } from "../../utils/math";
import WorldSession from "../WorldSession";
import SceneComponent from "./phaser/SceneComponent";
import WorldScene from "../world/WorldScene";
import { CHAR_WIDTH, CHAT_HEIGHT, CollisionCategory } from "../../shared/Constants";
import WorldClientConfig from "../WorldClientConfig";
import ServerComponent from "./ServerComponent";
import BodyFactory = MatterJS.BodyFactory;

type Input = {dir: Vec2, tick: number};

export default class PredictPositionComponent extends SceneComponent<WorldScene> {

  private bodyFactory!: BodyFactory;

  private readonly session: WorldSession;
  private readonly config: WorldClientConfig;
  private readonly simulationDelta: number;

  private server!: ServerComponent;

  private predictedBody!: MatterJS.BodyType;
  private reconciledBody!: MatterJS.BodyType;

  private readonly inputs: Input[];

  private lerpStartTime: number;
  private lerpDuration: number;
  private initPosition: Vec2;
  private targetPosition: Vec2;

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
    this.bodyFactory = this.scene.matter.body;

    this.server = this.gameObject.getComponent(ServerComponent);

    this.predictedBody = this.createBody();

    this.reconciledBody = this.createBody();
    this.reset();
    // this.model = this.gameObject.getComponent(ModelComponent);
  }

  public predict(dir: Vec2): void {
    this.inputs.push(
      {tick: this.session.tick, dir}
    );

    this.initPosition.x = this.gameObject.x;
    this.initPosition.y = this.gameObject.y;

    this.bodyFactory.setPosition(
      this.predictedBody,
      this.calcNextPosition(this.predictedBody.position, dir)
    );

    this.bodyFactory.setPosition(
      this.reconciledBody,
      this.calcNextPosition(this.reconciledBody.position, dir)
    );

    this.scene.matter.world.step(this.simulationDelta);

    this.targetPosition.x = this.predictedBody.position.x;
    this.targetPosition.y = this.predictedBody.position.y;

    const now = Date.now();

    const lastLerpDuration = now - this.lerpStartTime;

    if (lastLerpDuration > this.lerpDuration) {
      this.lerpDuration = this.simulationDelta;
    } else {
      this.lerpDuration = 2 * this.simulationDelta - lastLerpDuration;
    }

    this.lerpStartTime = now;
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
      this.errorTimer += delta;

      const progress = Math.min(this.errorTimer / this.config.clientSmoothPosMs, 1);

      interpolate(this.predictedBody.position, this.reconciledBody.position, progress, this.targetPosition);

      const error = deltaVec2(this.targetPosition, this.reconciledBody.position);

      if (this.withinSmoothPosErrorPrecision(error)) {
        this.bodyFactory.setPosition(this.predictedBody, this.targetPosition);

        this.errorTimer = -1;
      }
    }
  }

  public reconcile(): void {
    const lastProcessedTick = this.session.scope.lastProcessedTick;

    if (this.lastAckTick === lastProcessedTick) return;

    let ackIndex = -1;
    for (let i = 0; i < this.inputs.length; i++) {
      if (this.inputs[i].tick === lastProcessedTick) {
        ackIndex = i;
        break;
      }
    }

    this.inputs.splice(0, ackIndex + 1);

    this.bodyFactory.setPosition(
      this.reconciledBody,
      this.server.getLastState().gameObject
    );

    this.scene.matter.world.step(this.simulationDelta);

    for (let i = 0; i < this.inputs.length; i++) {
      const input = this.inputs[i];

      this.bodyFactory.setPosition(
        this.reconciledBody,
        this.calcNextPosition(this.reconciledBody.position, input.dir)
      );

      // TODO: step by real lerpDuration?
      this.scene.matter.world.step(this.simulationDelta);
    }

    this.refreshError();

    this.lastAckTick = lastProcessedTick;
  }

  private refreshError() {
    const error = deltaVec2(this.predictedBody.position, this.reconciledBody.position, TMP_VEC2);

    if (this.withinSmoothPosErrorPrecision(error)) {
      this.errorTimer = -1;
    } else {
      if (this.withinSmoothPosErrorThreshold(error)) {
        if (this.errorTimer == -1) {
          this.errorTimer = 0;
        }
      } else {
        this.gameObject.x = this.reconciledBody.position.x;
        this.gameObject.y = this.reconciledBody.position.y;

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

    this.bodyFactory.setPosition(
      this.predictedBody,
      this.gameObject
    );

    this.bodyFactory.setPosition(
      this.reconciledBody,
      this.gameObject
    );

    this.errorTimer = -1;
  }

  private createBody(): MatterJS.BodyType {
    const body = this.scene.matter.add.rectangle(0, 0, CHAR_WIDTH, CHAT_HEIGHT, {
      collisionFilter: {
        category: CollisionCategory.PLAYER,
        mask: CollisionCategory.WALL
      }
    });

    body.inertia = Infinity;

    return body;
  }

  private calcNextPosition(pos: Vec2, dir: Vec2): Vec2 {
    TMP_VEC2.x = pos.x + dir.x * this.config.charSpeed * this.simulationDelta / 1000;
    TMP_VEC2.y = pos.y + dir.y * this.config.charSpeed * this.simulationDelta / 1000;

    return TMP_VEC2;
  }
}
