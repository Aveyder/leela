import WorldSession from "./WorldSession";
import Player from "./core/Player";
import ControlComponent from "./core/ControlComponent";
import SpawnManager from "./service/SpawnManager";
import ServerGameObjectManager from "./core/ServerGameObjectManager";
import { GameObjectState, GameObjectStateDelta } from "../entity/GameObjectState";
import { Game } from "phaser";
import GameContext from "./GameContext";

export default class WorldSessionScope {
  public readonly context: GameContext;
  public readonly session: WorldSession;

  public playerGuid: number;
  public player: Player | null;
  public lastProcessedTick: number;

  public readonly objects: ServerGameObjectManager;
  public readonly spawn: SpawnManager;

  constructor(context: GameContext) {
    context.scope = this;

    this.context = context;
    this.session = context.session;

    this.playerGuid = -1;
    this.player = null;
    this.lastProcessedTick = -1;

    this.objects = new ServerGameObjectManager(this.context.objects);
    this.spawn = new SpawnManager(this.context);
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
    return this.context.game;
  }
}
