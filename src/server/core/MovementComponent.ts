import Component from "../../core/Component";
import WorldServerConfig from "../WorldServerConfig";
import { Vec2 } from "../../utils/math";

export default class MovementComponent extends Component {

  public dx!: number;
  public dy!: number;

  public simulationRate: number;
  public speed: number;

  constructor(config: WorldServerConfig) {
    super();

    this.simulationRate = config.simulationRate;
    this.speed = config.charSpeed;
  }

  public init(): void {
    this.dx = 0;
    this.dy = 0;
  }

  public move(dir: Vec2): void {
    this.dx = dir.x;
    this.dy = dir.y;

    const mag = (dir.x != 0 && dir.y != 0) ? Math.sqrt(2) : 1;

    this.gameObject.x += this.dx * this.speed / this.simulationRate / mag;
    this.gameObject.y += this.dy * this.speed / this.simulationRate / mag;
  }
}
