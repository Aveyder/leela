import { _ComponentCodec } from "../ComponentCodec";
import { ComponentData } from "../ComponentSegment";
import MovementComponent from "../../../core/MovementComponent";
import MovementSpec from "../../../entity/component/MovementSpec";
import diff from "../../../utils/diff";

export default class MovementCodec implements _ComponentCodec<MovementComponent, MovementSpec, Partial<MovementSpec>> {
  map(component: MovementComponent): MovementSpec {
    return {
      dx: component.dx,
      dy: component.dy,
      vx: component.vx,
      vy: component.vy,
    };
  }
  delta(specA: MovementSpec, specB: MovementSpec): Partial<MovementSpec> | null {
    return diff(specA, specB);
  }
  encode(spec: MovementComponent): ComponentData {
    return [
      spec.dx,
      spec.dy,
      spec.vx,
      spec.vy,
    ];
  }
  encodeDelta(delta: Partial<MovementSpec>): ComponentData {
    const data = [];
    if (delta.dx !== undefined) {
      data.push([0, delta.dx]);
    }
    if (delta.dy !== undefined) {
      data.push([1, delta.dy]);
    }
    if (delta.vx !== undefined) {
      data.push([2, delta.vx]);
    }
    if (delta.vy !== undefined) {
      data.push([3, delta.vy]);
    }

    return data;
  }
  decode(packet: ComponentData): MovementSpec {
    return {
      dx: packet[0] as number,
      dy: packet[1] as number,
      vx: packet[2] as number,
      vy: packet[3] as number,
    };
  }
  decodeDelta(data: ComponentData[]): Partial<MovementSpec> {
    const spec = {} as Partial<MovementSpec>;

    for (let element of data) {
      const field = element[0] as number;
      const value = element[1] as number;

      switch (field) {
        case 0:
          spec.dx = value;
          break;
        case 1:
          spec.dy = value;
          break;
        case 2:
          spec.vx = value;
          break;
        case 3:
          spec.vy = value;
          break;
      }
    }

    return spec;
  }
}
