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
    if (state.guid === session?.scope.playerGuid) {
      char = session.scope.player = new Player(this.scene, session, state.guid);
    } else {
      char = new Char(this.scene, state.guid);
    }
    this.char(char, state);
  }

  public char(char: GameObject, state: GameObjectState): void {
    const model = state.components.get(ComponentId.MODEL) as ModelDescriptor;
    char.getComponent(ModelComponent).setModel(model);

    char.x = state.x;
    char.y = state.y;

    this.scene.objects.add(char);
  }
}
