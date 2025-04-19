import PhaserAwareGameObject from "./phaser/PhaserAwareGameObject";
import WorldScene from "../scene/WorldScene";
import ModelComponent from "./ModelComponent";
import ControlComponent from "./ControlComponent";
import SpriteComponent from "./phaser/SpriteComponent";
import WorldSession from "../WorldSession";
import ServerModelComponent from "./ServerModelComponent";
import PredictPositionComponent from "./PredictPositionComponent";

export default class Player extends PhaserAwareGameObject {

  constructor(session: WorldSession) {
    super(session.game);

    this.addComponents([
      new SpriteComponent(WorldScene.KEY),
      new ModelComponent(),
      new ControlComponent(session),
      new PredictPositionComponent(session),
      new ServerModelComponent(),
    ]);
  }
}
