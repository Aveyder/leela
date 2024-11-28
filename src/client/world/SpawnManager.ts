import { ModelDescriptor } from "../../resource/Model";
import GameObject from "../../core/GameObject";
import { ComponentId } from "../../protocol/codec/ComponentId";
import ModelComponent from "../core/ModelComponent";
import Player from "../core/Player";
import Char from "../core/Char";
import WorldScene from "./WorldScene";
import { GameObjectState } from "../../entity/GameObjectState";
import WorldSession from "../WorldSession";
import ServerGameObjectManager from "../core/ServerGameObjectManager";
import WorldSessionScope from "../WorldSessionScope";
import MovementComponent from "../../core/MovementComponent";
import MovementSpec from "../../entity/component/MovementSpec";
import ServerComponent from "../core/ServerComponent";
import WorldClientConfig from "../WorldClientConfig";

export default class SpawnManager {

  private readonly scope: WorldSessionScope;
  private readonly session: WorldSession;
  private readonly config: WorldClientConfig;
  private readonly scene: WorldScene;

  private readonly objects: ServerGameObjectManager;

  constructor(scope: WorldSessionScope) {
    this.scope = scope;
    this.session = scope.session;
    this.config = scope.session.config;
    this.scene = scope.scene;
    this.objects = scope.objects;
  }

  public gameObject(timestamp: number, state: GameObjectState): void {
    const serverGuid = state.gameObject.guid;

    if (this.objects.get(serverGuid)) return;

    let gameObject;
    if (serverGuid === this.scope.playerGuid) {
      gameObject = new Player(this.scene, this.session);

      this.scope.player = gameObject;
    } else {
      gameObject = new Char(this.scene);
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
