import WorldGameObject from "./WorldGameObject";
import World from "../world/World";
import ModelComponent from "./ModelComponent";
import MovementComponent from "./MovementComponent";
import PhysicsBodyComponent from "./PhysicsBodyComponent";
import NPCMovementComponent from "./NPCMovementComponent";

export default class NPC extends WorldGameObject {

  constructor(world: World, guid: number) {
    super(world);

    this.guid = guid;

    this.addComponents([
      new ModelComponent(),
      new NPCMovementComponent(),
      new MovementComponent(world.config),
      new PhysicsBodyComponent(world),
    ]);
  }
}
