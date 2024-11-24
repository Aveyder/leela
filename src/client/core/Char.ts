import SceneGameObject from "./phaser/SceneGameObject";
import WorldScene from "../world/WorldScene";
import ModelComponent from "./ModelComponent";
import SpriteComponent from "./phaser/SpriteComponent";
import MovementComponent from "../../core/MovementComponent";

export default class Char extends SceneGameObject<WorldScene> {

  constructor(scene: WorldScene, guid: number) {
    super(scene, guid);

    this.addComponents([
      new SpriteComponent(),
      new ModelComponent(),
      new MovementComponent(scene.config.charSpeed),
    ]);
  }
}
