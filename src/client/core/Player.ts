import SceneGameObject from "./phaser/SceneGameObject";
import WorldScene from "../world/WorldScene";
import ModelComponent from "./ModelComponent";
import MovementComponent from "../../core/MovementComponent";
import ControlComponent from "./ControlComponent";
import SpriteComponent from "./phaser/SpriteComponent";
import WorldSession from "../WorldSession";
import ServerComponent from "./ServerComponent";

export default class Player extends SceneGameObject<WorldScene> {

  constructor(scene: WorldScene, session: WorldSession) {
    super(scene);

    this.addComponents([
      new SpriteComponent(),
      new ModelComponent(),
      new MovementComponent(scene.config.charSpeed),
      new ControlComponent(session),
      new ServerComponent()
    ]);
  }
}
