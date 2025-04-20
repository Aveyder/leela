import ContextAwareGameObject from "./phaser/ContextAwareGameObject";
import WorldScene from "../scene/WorldScene";
import ModelComponent from "./ModelComponent";
import ControlComponent from "./ControlComponent";
import SpriteComponent from "./phaser/SpriteComponent";
import WorldSession from "../WorldSession";
import ServerModelComponent from "./ServerModelComponent";
import PredictPositionComponent from "./PredictPositionComponent";
import GameContext from "../GameContext";

export default class Player extends ContextAwareGameObject {

  constructor(context: GameContext) {
    super(context);

    this.addComponents([
      new SpriteComponent(WorldScene.KEY),
      new ModelComponent(),
      new ControlComponent(context.session),
      new PredictPositionComponent(context.session),
      new ServerModelComponent(),
    ]);
  }
}
