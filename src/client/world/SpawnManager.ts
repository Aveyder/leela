import { ModelDescriptor } from "../../resource/Model";
import GameObject from "../../core/GameObject";
import { ComponentId } from "../../protocol/codec/ComponentId";
import ModelComponent from "../core/ModelComponent";
import Player from "../core/Player";
import Char from "../core/Char";
import WorldScene from "./WorldScene";
import { GameObjectState } from "../../entity/GameObjectState";

export default class SpawnManager {

  private readonly scene: WorldScene;

  constructor(scene: WorldScene) {
    this.scene = scene;
  }

  public gameObject(state: GameObjectState): void {
    const session = this.scene.session;

    let char;
    if (state.gameObject.guid === session?.scope.playerGuid) {
      char = session.scope.player = new Player(this.scene, session, state.gameObject.guid);
    } else {
      char = new Char(this.scene, state.gameObject.guid);
    }
    this.char(char, state);
  }

  public char(char: GameObject, state: GameObjectState): void {
    const model = state.components.get(ComponentId.MODEL) as ModelDescriptor;
    char.getComponent(ModelComponent).setModel(model);

    char.x = state.gameObject.x;
    char.y = state.gameObject.y;

    this.scene.objects.add(char);
  }
}
