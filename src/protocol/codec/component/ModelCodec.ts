import { _ComponentCodec } from "../ComponentCodec";
import ModelComponent from "../../../server/core/ModelComponent";
import { ComponentData } from "../ComponentSegment";
import { ModelDescriptor, MODELS_BY_ID } from "../../../resource/Model";

export default class ModelCodec implements _ComponentCodec<ModelComponent, ModelDescriptor, object> {
    map(component: ModelComponent): ModelDescriptor {
        return component.model;
    }
    delta(specA: ModelDescriptor, specB: ModelDescriptor): ModelDescriptor | null {
        return specA !== specB ? specB : null;
    }
    encode(spec: ModelDescriptor): ComponentData {
        return [spec.id];
    }
    encodeDelta(delta: ModelDescriptor): ComponentData {
        return this.encode(delta);
    }
    decode(data: ComponentData): ModelDescriptor {
        return MODELS_BY_ID.get(data[0] as number)!;
    }
    decodeDelta(delta: ComponentData): ModelDescriptor {
        return this.decode(delta);
    }
}
