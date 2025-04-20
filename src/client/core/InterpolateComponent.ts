import Component from "../../core/Component";
import ServerComponent, { ServerGameObjectSnapshot } from "./ServerComponent";
import WorldClientConfig from "../WorldClientConfig";
import { TimeSync } from "timesync";
import { ComponentId } from "../../protocol/codec/ComponentId";
import MovementSpec from "../../entity/component/MovementSpec";
import { GameObjectState } from "../../entity/GameObjectState";
import ModelComponent from "./ModelComponent";
import { interpolate } from "../../utils/math";

interface LerpState {
  x: number;
  y: number;
  dx: number;
  dy: number;
}

export default class InterpolateComponent extends Component {

  private config: WorldClientConfig;
  private ts: TimeSync;
  private server: ServerComponent;
  private model: ModelComponent;

  constructor(ts: TimeSync, config: WorldClientConfig) {
    super();

    this.ts = ts;
    this.config = config;
  }

  start() {
    this.server = this.gameObject.getComponent(ServerComponent);
    this.model = this.gameObject.getComponent(ModelComponent);
  }

  update(delta: number) {
    const lerpMoment = this.ts.now() - this.config.interpolationMs;

    const snapshots = this.server.snapshots;

    const firstSnapshot = snapshots[0];

    let lerpState: LerpState;
    if (snapshots.length === 1 || lerpMoment <= firstSnapshot.timestamp) {
      lerpState = this.fromState(firstSnapshot.state);
    } else {
      const lastIndex = snapshots.length - 1;
      const lastSnapshot = snapshots[lastIndex];

      let snapshotLerpStart;
      let snapshotLerpEnd;
      if (lerpMoment >= lastSnapshot.timestamp) {
        lerpState = this.fromState(lastSnapshot.state);

        if (this.config.extrapolateEntity && lerpMoment <= lastSnapshot.timestamp + this.config.extrapolateEntityMaxMs) {
          snapshotLerpStart = snapshots[lastIndex - 1];
          snapshotLerpEnd = lastSnapshot;
        }
      } else {
        const lerpStartIndex = this.getSnapshotIndexBefore(snapshots, lerpMoment);

        snapshotLerpStart = snapshots[lerpStartIndex];
        snapshotLerpEnd = snapshots[lerpStartIndex + 1];

        if ((lerpMoment - snapshotLerpStart.timestamp) <= (snapshotLerpEnd.timestamp - lerpMoment)) {
          lerpState = this.fromState(snapshotLerpStart.state);
        } else {
          lerpState = this.fromState(snapshotLerpEnd.state);
        }
      }

      if (snapshotLerpStart && snapshotLerpEnd) {
        const progress = (lerpMoment - snapshotLerpStart.timestamp) /
          (snapshotLerpEnd.timestamp - snapshotLerpStart.timestamp);

        const lerpPos = interpolate(snapshotLerpStart.state.gameObject, snapshotLerpEnd.state.gameObject, progress);

        lerpState.x = lerpPos.x;
        lerpState.y = lerpPos.y;
      }
    }

    this.gameObject.x = lerpState.x;
    this.gameObject.y = lerpState.y;
    this.model.setDirection(lerpState.dx, lerpState.dy);
  }

  private fromState(state: GameObjectState): LerpState {
    const lerpState = {} as LerpState;
    lerpState.x = state.gameObject.x;
    lerpState.y = state.gameObject.y;

    const movementSpec = state.components.get(ComponentId.MOVEMENT) as MovementSpec;

    lerpState.dx = movementSpec.dx;
    lerpState.dy = movementSpec.dy;

    return lerpState;
  }

  private getSnapshotIndexBefore(snapshots: ServerGameObjectSnapshot[], timestamp: number): number {
    let left = 0;
    let right = snapshots.length - 1;

    let result: number = -1;
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);

      if (snapshots[mid].timestamp < timestamp) {
        result = mid;
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    return result;
  }
}
