import { ModelDescriptor } from "../../resource/Model";
import GameObject from "../../core/GameObject";
import { ComponentId } from "../../protocol/codec/ComponentId";
import ModelComponent from "../core/ModelComponent";
import Player from "../core/Player";
import Char from "../core/Char";
import WorldScene from "./WorldScene";
import { GameObjectState } from "../../entity/GameObjectState";
import WorldSession from "../WorldSession";
import GameObjectManagerAdapter from "../core/GameObjectManagerAdapter";
import WorldSessionScope from "../WorldSessionScope";

export default class SpawnManager {

  private readonly scope: WorldSessionScope;
  private readonly session: WorldSession;
  private readonly scene: WorldScene;

  private readonly objects: GameObjectManagerAdapter;

  constructor(scope: WorldSessionScope) {
    this.scope = scope;
    this.session = scope.session;
    this.scene = scope.scene;
    this.objects = scope.objects;
  }

  public gameObject(state: GameObjectState): GameObject {
    let char;
    if (state.gameObject.guid === this.scope.playerGuid) {
      char = this.scope.player = new Player(this.scene, this.session);
    } else {
      char = new Char(this.scene);
    }

    return this.char(char, state);
  }

  public char(char: GameObject, state: GameObjectState): GameObject {
    const model = state.components.get(ComponentId.MODEL) as ModelDescriptor;
    char.getComponent(ModelComponent).setModel(model);

    char.x = state.gameObject.x;
    char.y = state.gameObject.y;

    return this.objects.add(state.gameObject.guid, char);
  }
}
