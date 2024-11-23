import { _ComponentCodec } from "../../ComponentCodec";
import ModelComponent from "../../../server/core/ModelComponent";
import { ComponentData } from "../../ComponentSegment";
import { ModelDescriptor, MODELS_BY_ID } from "../../../resource/Model";

export default class ModelCodec implements _ComponentCodec<ModelComponent> {
    encode(component: ModelComponent): ComponentData {
        return [component.model.id];
    }
    decode(packet: ComponentData): ModelDescriptor {
        return MODELS_BY_ID.get(packet[0] as number)!;
    }
}
