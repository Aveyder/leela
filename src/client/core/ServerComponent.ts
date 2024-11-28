import Component from "../../core/Component";
import { GameObjectState, GameObjectStateDelta } from "../../entity/GameObjectState";
import { ComponentId } from "../../protocol/codec/ComponentId";
import MovementSpec from "../../entity/component/MovementSpec";
import { ModelDescriptor } from "../../resource/Model";

export interface ServerGameObjectSnapshot {
  timestamp: number;
  state: GameObjectState;
}

export default class ServerComponent extends Component {

  public guid: number;

  private readonly snapshotBufferSize: number;
  public readonly snapshots: ServerGameObjectSnapshot[];

  constructor(guid: number = -1, stateBufferSize: number) {
    super();

    this.guid = guid;

    this.snapshotBufferSize = stateBufferSize;
    this.snapshots = [];
  }

  public getLastState(): GameObjectState {
    return this.snapshots[this.snapshots.length - 1].state;
  }

  public addState(timestamp: number, state: GameObjectState): void {
    this.snapshots.push({timestamp, state});

    if (this.snapshots.length > this.snapshotBufferSize) {
      this.snapshots.splice(0, 1);
    }
  }

  public addStateDelta(timestamp: number, stateDelta: GameObjectStateDelta): void {
    const state = this.cloneState(this.getLastState());

    if (stateDelta.gameObject.x !== undefined) {
      state.gameObject.x = stateDelta.gameObject.x;
    }
    if (stateDelta.gameObject.y !== undefined) {
      state.gameObject.y = stateDelta.gameObject.y;
    }
    if (stateDelta.gameObject.isStatic !== undefined) {
      state.gameObject.isStatic = stateDelta.gameObject.isStatic;
    }
    if (stateDelta.gameObject.visible !== undefined) {
      state.gameObject.visible = stateDelta.gameObject.visible;
    }
    if (stateDelta.gameObject.active !== undefined) {
      state.gameObject.active = stateDelta.gameObject.active;
    }

    const movementSpecDelta = stateDelta.components.get(ComponentId.MOVEMENT) as MovementSpec;
    if (movementSpecDelta) {
      const movementSpec = {
        ...state.components.get(ComponentId.MOVEMENT)
      } as MovementSpec;
      if (movementSpecDelta.dx !== undefined) {
        movementSpec.dx = movementSpecDelta.dx;
      }
      if (movementSpecDelta.dy !== undefined) {
        movementSpec.dy = movementSpecDelta.dy;
      }
      if (movementSpecDelta.vx !== undefined) {
        movementSpec.vx = movementSpecDelta.vx;
      }
      if (movementSpecDelta.vy !== undefined) {
        movementSpec.vy = movementSpecDelta.vy;
      }
      state.components.set(ComponentId.MOVEMENT, movementSpec);
    }

    const modelSpecDelta = stateDelta.components.get(ComponentId.MODEL) as ModelDescriptor;
    if (modelSpecDelta) {
      state.components.set(ComponentId.MODEL, modelSpecDelta);
    }

    this.addState(timestamp, state);
  }

  private cloneState(state: GameObjectState): GameObjectState {
    const clone = {
      gameObject: {
        ...state.gameObject
      },
      components: new Map()
    };

    for (const componentId of state.components.keys()) {
      clone.components.set(componentId, state.components.get(componentId));
    }

    return clone;
  }
}
