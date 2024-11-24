import { _ComponentCodec } from "../../ComponentCodec";
import ModelComponent from "../../../server/core/ModelComponent";
import { ComponentData } from "../../ComponentSegment";
import { ModelDescriptor, MODELS_BY_ID } from "../../../resource/Model";
import MovementComponent from "../../../core/MovementComponent";
import MovementSpec from "../../../entity/component/MovementSpec";

export default class MovementCodec implements _ComponentCodec<MovementComponent> {
    encode(component: MovementComponent): ComponentData {
        return [
          component.dx,
          component.dy,
          component.vx,
          component.vy,
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
