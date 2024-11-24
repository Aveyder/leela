import { _ComponentCodec } from "../ComponentCodec";
import ModelComponent from "../../../server/core/ModelComponent";
import { ComponentData } from "../ComponentSegment";
import { ModelDescriptor, MODELS_BY_ID } from "../../../resource/Model";

export default class ModelCodec implements _ComponentCodec<ModelComponent, ModelDescriptor, object> {
    map(component: ModelComponent): ModelDescriptor {
        return component.model;
    }
    delta(componentA: ModelComponent, componentB: ModelComponent): object {
        throw new Error("Method not implemented.");
    }
    encode(spec: ModelDescriptor): ComponentData {
        return [spec.id];
    }
    encodeDelta(delta: object): ComponentData {
        throw new Error("Method not implemented.");
    }
    decode(data: ComponentData): ModelDescriptor {
        return MODELS_BY_ID.get(data[0] as number)!;
    }
    decodeDelta(delta: ComponentData): object {
        throw new Error("Method not implemented.");
    }
}
