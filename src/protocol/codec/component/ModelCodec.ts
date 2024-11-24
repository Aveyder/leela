import { _ComponentCodec } from "../../ComponentCodec";
import ModelComponent from "../../../server/core/ModelComponent";
import { ComponentData } from "../../ComponentSegment";
import { ModelDescriptor, MODELS_BY_ID } from "../../../resource/Model";

export default class ModelCodec implements _ComponentCodec<ModelComponent, ModelDescriptor> {
    map(component: ModelComponent): ModelDescriptor {
        return component.model;
    }
    encode(spec: ModelDescriptor): ComponentData {
        return [spec.id];
    }
    decode(data: ComponentData): ModelDescriptor {
        return MODELS_BY_ID.get(data[0] as number)!;
    }
}
