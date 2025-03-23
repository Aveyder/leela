import Component from "../../core/Component";
import Matter, { Bodies, Body, World as MatterWorld } from "matter-js";
import World from "../world/World";
import { CHAR_WIDTH, CHAT_HEIGHT, CollisionCategory } from "../../shared/Constants";

export default class MatterBodyComponent extends Component {

  private readonly world: World;
  public body!: Matter.Body;

  constructor(world: World) {
    super();

    this.world = world;
  }

  start() {
    this.body = Bodies.rectangle(this.gameObject.x, this.gameObject.y, CHAR_WIDTH, CHAT_HEIGHT, {
      inertia: Infinity,
      collisionFilter: {
        category: CollisionCategory.PLAYER,
        mask: CollisionCategory.WALL
      }
    });

    MatterWorld.add(this.world.matterEngine.world, this.body);
  }

  update(delta: number) {
    Body.setPosition(this.body, this.gameObject);
  }

  syncGameObjectPosition() {
    this.gameObject.x = this.body.position.x;
    this.gameObject.y = this.body.position.y;
  }
}
