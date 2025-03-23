import Component from "../../core/Component";
import { Vec2 } from "../../utils/math";
import MovementComponent from "./MovementComponent";

export default class NPCMovementComponent extends Component {

  private movement!: MovementComponent;
  private timer: number;
  private dir: Vec2;

  constructor() {
    super();

    this.timer = 0;
    this.dir = {x: 0, y: 0};
  }

  public start(): void {
    this.movement = this.gameObject.getComponent(MovementComponent)
  }

  update(delta: number) {
    this.timer += delta;

    if (this.timer > Math.random() * 3) {
      this.timer = 0;
      this.dir.x = this.getRandomDir();
      this.dir.y = this.getRandomDir();
    }
    this.movement.move(this.dir);
  }

  private getRandomDir(): number {
    const random = Math.random();

    if (random < 1 / 3) {
      return -1;
    }
    if (random < 2 / 3) {
      return 0;
    }
    return 1;
  }
}
