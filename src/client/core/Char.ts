import SceneGameObject from "./phaser/SceneGameObject";
import WorldScene from "../scene/WorldScene";
import ModelComponent from "./ModelComponent";
import SpriteComponent from "./phaser/SpriteComponent";
import ServerModelComponent from "./ServerModelComponent";
import InterpolateComponent from "./InterpolateComponent";
import WorldSession from "../WorldSession";

export default class Char extends SceneGameObject<WorldScene> {

  constructor(session: WorldSession) {
    super(session.scene);

    this.addComponents([
      new SpriteComponent(),
      new ModelComponent(),
      new ServerModelComponent(),
      new InterpolateComponent(session.socket.ts, session.config)
    ]);
  }
}
