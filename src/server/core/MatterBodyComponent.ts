import Component from "../../core/Component";
import Matter, { Bodies, Body, World as MatterWorld } from "matter-js";
import World from "../world/World";
import { CHAR_WIDTH, CHAT_HEIGHT, CollisionCategory } from "../../shared/Constants";
import { Vec2 } from "../../utils/math";

export default class MatterBodyComponent extends Component {

  private readonly world: World;
  public body!: Matter.Body;

  private lastPos!: Vec2;

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

    this.lastPos = {
      x: this.gameObject.x,
      y: this.gameObject.y
    }
  }

  update(delta: number) {
    Body.setPosition(this.body, this.gameObject);
  }

  syncGameObjectPosition() {
    if (this.gameObject.x !== this.lastPos.x || this.gameObject.y !== this.lastPos.y) {
      this.gameObject.x = this.lastPos.x = this.body.position.x;
      this.gameObject.y = this.lastPos.y = this.body.position.y;
    }
  }
}
