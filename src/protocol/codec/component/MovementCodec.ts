import { _ComponentCodec } from "../../ComponentCodec";
import { ComponentData } from "../../ComponentSegment";
import MovementComponent from "../../../core/MovementComponent";
import MovementSpec from "../../../entity/component/MovementSpec";

export default class MovementCodec implements _ComponentCodec<MovementComponent, MovementSpec> {
  map(component: MovementComponent): MovementSpec {
    return {
      dx: component.dx,
      dy: component.dy,
      vx: component.vx,
      vy: component.vy,
    };
  }
  encode(spec: MovementComponent): ComponentData {
    return [
      spec.dx,
      spec.dy,
      spec.vx,
      spec.vy,
    ];
  }
  decode(packet: ComponentData): MovementSpec {
    return {
      dx: packet[0] as number,
      dy: packet[1] as number,
      vx: packet[2] as number,
      vy: packet[3] as number,
    };
  }
}
