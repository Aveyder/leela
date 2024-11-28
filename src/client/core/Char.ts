import SceneGameObject from "./phaser/SceneGameObject";
import WorldScene from "../world/WorldScene";
import ModelComponent from "./ModelComponent";
import SpriteComponent from "./phaser/SpriteComponent";
import MovementComponent from "../../core/MovementComponent";
import ServerControlComponent from "./ServerControlComponent";

export default class Char extends SceneGameObject<WorldScene> {

  constructor(scene: WorldScene) {
    super(scene);

    this.addComponents([
      new SpriteComponent(),
      new ModelComponent(),
      new MovementComponent(scene.config.charSpeed),
      new ServerControlComponent(),
    ]);
  }
}
