import Player from "../core/Player";
import Char from "../core/Char";
import { GameObjectState } from "../../entity/GameObjectState";
import WorldSession from "../WorldSession";
import ServerGameObjectManager from "../core/ServerGameObjectManager";
import WorldSessionScope from "../WorldSessionScope";
import ServerComponent from "../core/ServerComponent";
import WorldClientConfig from "../WorldClientConfig";
import GameContext from "../GameContext";

export default class SpawnManager {

  private readonly context: GameContext;

  private readonly scope: WorldSessionScope;
  private readonly config: WorldClientConfig;
  private readonly objects: ServerGameObjectManager;

  constructor(context: GameContext) {
    this.context = context;

    this.scope = context.scope;
    this.config = context.config;
    this.objects = this.scope.objects;
  }

  public gameObject(timestamp: number, state: GameObjectState): void {
    const serverGuid = state.gameObject.guid;

    if (this.objects.get(serverGuid)) return;

    let gameObject;
    if (serverGuid === this.scope.playerGuid) {
      gameObject = new Player(this.context);

      this.scope.player = gameObject;
    } else {
      gameObject = new Char(this.context);
    }

    gameObject.x = state.gameObject.x;
    gameObject.y = state.gameObject.y;

    gameObject.addComponent(new ServerComponent(
      serverGuid, this.config.clientStateBufferSize
    ));
    gameObject.getComponent(ServerComponent).addState(timestamp, state);

    this.objects.add(serverGuid, gameObject);
  }
}
