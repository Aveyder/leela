import WorldScene from "./world/WorldScene";
import WorldSession from "./WorldSession";
import Player from "./core/Player";
import ControlComponent from "./core/ControlComponent";
import SpawnManager from "./world/SpawnManager";
import ServerGameObjectManager from "./core/ServerGameObjectManager";
import { GameObjectStateDelta, GameObjectState } from "../entity/GameObjectState";
import { WorldStateDelta, WorldState } from "../entity/WorldState";

export default class WorldSessionScope {
  public readonly session: WorldSession;
  public readonly scene: WorldScene;

  public playerGuid: number;
  public player: Player | null;

  public readonly objects: ServerGameObjectManager;
  public readonly spawn: SpawnManager;

  constructor(session: WorldSession) {
    this.session = session;
    this.scene = session.scene!;

    this.playerGuid = -1;
    this.player = null;

    this.objects = new ServerGameObjectManager(this);
    this.spawn = new SpawnManager(this);
  }

  public simulate(delta: number) {
    this.player?.getComponent(ControlComponent).applyControl();
  }

  public destroy(): void {
    this.objects.destroy();

    this.player = null;
  }

  public isPlayer(state: GameObjectState | GameObjectStateDelta) {
    return state.gameObject.guid === this.playerGuid;
  }

  public resolveTimestamp(state: { timestamp: number }) {
    state.timestamp = this.session.getServerTimestamp(state.timestamp);
  }
}
