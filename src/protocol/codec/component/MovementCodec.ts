import { _ComponentCodec } from "../ComponentCodec";
import { ComponentData } from "../ComponentSegment";
import MovementComponent from "../../../core/MovementComponent";
import MovementSpec from "../../../entity/component/MovementSpec";
import ModelComponent from "../../../server/core/ModelComponent";

export default class MovementCodec implements _ComponentCodec<MovementComponent, MovementSpec, object> {
  map(component: MovementComponent): MovementSpec {
    return {
      dx: component.dx,
      dy: component.dy,
      vx: component.vx,
      vy: component.vy,
    };
  }
  delta(componentA: MovementComponent, componentB: MovementComponent): object {
    throw new Error("Method not implemented.");
  }
  encode(spec: MovementComponent): ComponentData {
    return [
      spec.dx,
      spec.dy,
      spec.vx,
      spec.vy,
    ];
  }
  encodeDelta(delta: object): ComponentData {
    throw new Error("Method not implemented.");
  }
  decode(packet: ComponentData): MovementSpec {
    return {
      dx: packet[0] as number,
      dy: packet[1] as number,
      vx: packet[2] as number,
      vy: packet[3] as number,
    };
  }
  decodeDelta(delta: ComponentData): object {
    throw new Error("Method not implemented.");
  }
}
