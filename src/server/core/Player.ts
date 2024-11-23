import WorldGameObject from "./WorldGameObject";
import World from "../world/World";
import ModelComponent from "./ModelComponent";
import MovementComponent from "../../core/MovementComponent";

export default class Player extends WorldGameObject {

  constructor(world: World) {
    super(world);

    this.addComponents([
      new ModelComponent(),
      new MovementComponent(world.config.charSpeed)
    ]);
  }
}
