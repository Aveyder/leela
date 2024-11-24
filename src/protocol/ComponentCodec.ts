import Component from "../core/Component";
import { ComponentId } from "./ComponentId";
import { ComponentData, ComponentSegment } from "./ComponentSegment";
import ModelCodec from "./codec/component/ModelCodec";
import MovementCodec from "./codec/component/MovementCodec";

export interface _ComponentCodec<C extends Component, S> {
  map(component: C): S;
  encode(spec: S): ComponentData;
  decode(segment: ComponentData): S;
}

type ComponentCodecMapping = {
  [key in ComponentId]?: _ComponentCodec<Component, object>;
}

export default class ComponentCodec {
  private static readonly _codecs: ComponentCodecMapping = {
    [ComponentId.MODEL]: new ModelCodec(),
    [ComponentId.MOVEMENT]: new MovementCodec(),
  }

  public static map<C extends Component, S>(id: ComponentId, component: C): S {
    const codec = this.getCodec<C, S>(id);

    return codec.map(component);
  }

  public static encode<S>(id: ComponentId, spec: S): ComponentSegment {
    const codec = this.getCodec(id);

    return [id, ...codec.encode(spec)];
  }

  public static decode<C extends Component, S>(segment: ComponentSegment): S {
    const id = segment[0];
    const codec = this.getCodec<C, S>(id);

    return codec.decode(segment.slice(1));
  }

  public static getCodec<C extends Component, S>(id: ComponentId): _ComponentCodec<C, S> {
    return this._codecs[id] as _ComponentCodec<C, S>;
  }
}
