import WorldScene from "./scene/WorldScene";
import WorldSession from "./WorldSession";
import Player from "./core/Player";
import ControlComponent from "./core/ControlComponent";
import SpawnManager from "./service/SpawnManager";
import ServerGameObjectManager from "./core/ServerGameObjectManager";
import { GameObjectState, GameObjectStateDelta } from "../entity/GameObjectState";
import { Game } from "phaser";
import DataUtils from "./utils/DataUtils";

export default class WorldSessionScope {
  public readonly session: WorldSession;

  public playerGuid: number;
  public player: Player | null;
  public lastProcessedTick: number;

  public readonly objects: ServerGameObjectManager;
  public readonly spawn: SpawnManager;

  constructor(session: WorldSession) {
    this.session = session;

    this.playerGuid = -1;
    this.player = null;
    this.lastProcessedTick = -1;

    this.objects = new ServerGameObjectManager(DataUtils.getObjects(session.game));
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

  public get game(): Game {
    return this.session.game;
  }
}
