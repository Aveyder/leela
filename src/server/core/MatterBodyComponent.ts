import Component from "../../core/Component";
import Matter, { Bodies, Body, World as MatterWorld } from "matter-js";
import World from "../world/World";
import { CollisionCategory } from "../../shared/CollisionCategory";

export default class MatterBodyComponent extends Component {

  private readonly world: World;
  public body!: Matter.Body;

  constructor(world: World) {
    super();

    this.world = world;
  }

  start() {
    this.body = Bodies.rectangle(this.gameObject.x, this.gameObject.y, 16, 32, {
      inertia: Infinity,
      collisionFilter: {
        category: CollisionCategory.PLAYER,
        mask: CollisionCategory.WALL
      }
    });
    this.body.label = 'player';

    MatterWorld.add(this.world.matterEngine.world, this.body);
  }

  update(delta: number) {
    Body.setPosition(this.body, this.gameObject);
  }

  lateUpdate(delta: number) {
    this.gameObject.x = this.body.position.x;
    this.gameObject.y = this.body.position.y;
  }
}
