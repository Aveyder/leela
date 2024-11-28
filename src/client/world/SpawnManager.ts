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

  public gameObject(timestamp: number, state: GameObjectState): GameObject {
    let gameObject;
    if (state.gameObject.guid === this.scope.playerGuid) {
      gameObject = this.scope.player = new Player(this.scene, this.session);
    } else {
      gameObject = new Char(this.scene);
    }

    const serverComponent = new ServerComponent(state.gameObject.guid, this.config.clientStateBufferSize);
    serverComponent.addState(timestamp, state);
    gameObject.addComponent(serverComponent);

    gameObject = this.char(gameObject, state);

    return gameObject;
  }

  public char(char: GameObject, state: GameObjectState): GameObject {
    const model = state.components.get(ComponentId.MODEL) as ModelDescriptor;
    char.getComponent(ModelComponent).setModel(model);

    const movementState = state.components.get(ComponentId.MOVEMENT) as MovementSpec;
    const movement = char.getComponent(MovementComponent);
    movement.dx = movementState.dx;
    movement.dy = movementState.dy;

    char.x = state.gameObject.x;
    char.y = state.gameObject.y;

    return this.objects.add(state.gameObject.guid, char);
  }
}
