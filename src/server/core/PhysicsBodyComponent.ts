import Component from "../../core/Component";
import World from "../world/World";
import { CHAR_WIDTH, CHAT_HEIGHT } from "../../shared/Constants";
import Body from "../../shared/physics/Body";

export default class PhysicsBodyComponent extends Component {

  private readonly world: World;
  public body!: Body;

  constructor(world: World) {
    super();

    this.world = world;
  }

  start() {
    this.body = new Body({
      x: this.gameObject.x,
      y: this.gameObject.y,
      width: CHAR_WIDTH,
      height: CHAT_HEIGHT
    });

    this.world.physicsWorld.add(this.body);
  }

  update() {
    this.body.setPosition(this.gameObject.x, this.gameObject.y);
  }

  syncGameObjectPosition() {
    this.gameObject.x = this.body.x;
    this.gameObject.y = this.body.y;
  }

  destroy() {
    this.world.physicsWorld.remove(this.body);
  }
}
