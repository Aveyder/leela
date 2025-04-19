import PhaserAwareGameObject from "./phaser/PhaserAwareGameObject";
import WorldScene from "../scene/WorldScene";
import ModelComponent from "./ModelComponent";
import SpriteComponent from "./phaser/SpriteComponent";
import ServerModelComponent from "./ServerModelComponent";
import InterpolateComponent from "./InterpolateComponent";
import WorldSession from "../WorldSession";

export default class Char extends PhaserAwareGameObject {

  constructor(session: WorldSession) {
    super(session.game);

    this.addComponents([
      new SpriteComponent(WorldScene.KEY),
      new ModelComponent(),
      new ServerModelComponent(),
      new InterpolateComponent(session.socket.ts, session.config)
    ]);
  }
}
