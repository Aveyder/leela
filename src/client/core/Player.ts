import SceneGameObject from "./phaser/SceneGameObject";
import WorldScene from "../world/WorldScene";
import ModelComponent from "./ModelComponent";
import ControlComponent from "./ControlComponent";
import SpriteComponent from "./phaser/SpriteComponent";
import WorldSession from "../WorldSession";
import ServerControlComponent from "./ServerControlComponent";

export default class Player extends SceneGameObject<WorldScene> {

  constructor(session: WorldSession) {
    super(session.scene);

    this.addComponents([
      new SpriteComponent(),
      new ModelComponent(),
      new ControlComponent(session),
      new ServerControlComponent(),
    ]);
  }
}
