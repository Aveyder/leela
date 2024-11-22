import WorldSceneGameObject from "./WorldSceneGameObject";
import WorldScene from "../world/WorldScene";
import SpriteComponent from "./SpriteComponent";
import ModelComponent from "./ModelComponent";
import MovementComponent from "./MovementComponent";
import ControlComponent from "./ControlComponent";

export default class Player extends WorldSceneGameObject {

  constructor(scene: WorldScene, guid: number) {
    super(scene, guid);

    this.addComponents([
      new SpriteComponent(),
      new ModelComponent(),
      new MovementComponent(),
      new ControlComponent(),
    ]);
  }
}
