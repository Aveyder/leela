import SceneGameObject from "./phaser/SceneGameObject";
import WorldScene from "../world/WorldScene";
import ModelComponent from "./ModelComponent";
import SpriteComponent from "./phaser/SpriteComponent";
import MovementComponent from "../../core/MovementComponent";
import ServerControlComponent from "./ServerControlComponent";
import InterpolateComponent from "./InterpolateComponent";
import WorldSession from "../WorldSession";

export default class Char extends SceneGameObject<WorldScene> {

  constructor(session: WorldSession) {
    super(session.scene);

    this.addComponents([
      new SpriteComponent(),
      new ModelComponent(),
      new MovementComponent(session.config.charSpeed),
      new ServerControlComponent(),
      new InterpolateComponent(session.socket.ts, session.config)
    ]);
  }
}
