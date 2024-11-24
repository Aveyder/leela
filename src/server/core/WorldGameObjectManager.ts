import GameObjectManager from "../../core/GameObjectManager";
import GameObject from "../../core/GameObject";
import World from "../world/World";
import { Opcode } from "../../protocol/Opcode";

export default class WorldGameObjectManager extends GameObjectManager {

  private readonly world: World;

  constructor(world: World) {
    super();
    this.world = world;
  }

  public add(gameObject: GameObject): void {
    super.add(gameObject);

    this.world.broadcastObject<GameObject>(Opcode.SMSG_OBJECT, gameObject);
  }

  public delete(gameObject: GameObject): void {
    this.world.broadcast([Opcode.SMGS_OBJECT_DESTROY, gameObject.guid]);

    super.delete(gameObject);
  }
}
