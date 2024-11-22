import SceneGameObject from "./phaser/SceneGameObject";
import WorldScene from "../world/WorldScene";
import ModelComponent from "./ModelComponent";
import MovementComponent from "./MovementComponent";
import ControlComponent from "./ControlComponent";
import SpriteComponent from "./phaser/SpriteComponent";

export default class Player extends SceneGameObject<WorldScene> {

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
