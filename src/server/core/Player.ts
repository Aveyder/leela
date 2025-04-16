import WorldGameObject from "./WorldGameObject";
import World from "../world/World";
import ModelComponent from "./ModelComponent";
import MovementComponent from "./MovementComponent";
import PhysicsBodyComponent from "./PhysicsBodyComponent";

export default class Player extends WorldGameObject {

  constructor(world: World, guid: number) {
    super(world);

    this.guid = guid;

    this.addComponents([
      new ModelComponent(),
      new MovementComponent(world.config),
      new PhysicsBodyComponent(world),
    ]);
  }
}
