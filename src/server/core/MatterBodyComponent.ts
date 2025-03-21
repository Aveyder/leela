import Component from "../../core/Component";
import Matter, { Bodies, Body } from "matter-js";
import World from "../world/World";

export default class MatterBodyComponent extends Component {

  public body!: Matter.Body;

  constructor(world: World) {
    super();
  }

  start() {
    this.body = Bodies.rectangle(this.gameObject.x, this.gameObject.y, 16, 32, {
      inertia: Infinity
    });
  }

  update(delta: number) {
    Body.setPosition(this.body, this.gameObject);
  }

  lateUpdate(delta: number) {
    this.gameObject.x = this.body.position.x;
    this.gameObject.y = this.body.position.y;
  }
}
