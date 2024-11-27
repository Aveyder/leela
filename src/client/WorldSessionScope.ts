import WorldScene from "./world/WorldScene";
import WorldSession from "./WorldSession";
import Player from "./core/Player";
import ControlComponent from "./core/ControlComponent";
import SpawnManager from "./world/SpawnManager";
import GameObjectManagerAdapter from "./core/GameObjectManagerAdapter";
import { GameObjectState } from "../entity/GameObjectState";

export default class WorldSessionScope {
  public readonly session: WorldSession;
  public readonly scene: WorldScene;

  public playerGuid: number;
  public player: Player | null;

  public readonly objects: GameObjectManagerAdapter;
  public readonly spawn: SpawnManager;

  constructor(session: WorldSession) {
    this.session = session;
    this.scene = session.scene!;

    this.playerGuid = -1;
    this.player = null;

    this.objects = new GameObjectManagerAdapter(this.scene.objects);
    this.spawn = new SpawnManager(this);
  }

  public simulate(delta: number) {
    this.player?.getComponent(ControlComponent).applyControl();
  }

  public destroy(): void {
    this.scene.objects.destroy();

    this.player = null;
  }

  public isPlayer(state: GameObjectState) {
    return state.gameObject.guid === this.playerGuid;
  }
}
