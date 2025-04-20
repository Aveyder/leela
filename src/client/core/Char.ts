import ContextAwareGameObject from "./phaser/ContextAwareGameObject";
import WorldScene from "../scene/WorldScene";
import ModelComponent from "./ModelComponent";
import SpriteComponent from "./phaser/SpriteComponent";
import ServerModelComponent from "./ServerModelComponent";
import InterpolateComponent from "./InterpolateComponent";
import WorldSession from "../WorldSession";
import GameContext from "../GameContext";

export default class Char extends ContextAwareGameObject {

  constructor(context: GameContext) {
    super(context);

    this.addComponents([
      new SpriteComponent(WorldScene.KEY),
      new ModelComponent(),
      new ServerModelComponent(),
      new InterpolateComponent(context.client.socket!.ts, context.config)
    ]);
  }
}
