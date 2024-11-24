import Component from "../../core/Component";
import { ComponentId } from "./ComponentId";
import { ComponentData, ComponentSegment } from "./ComponentSegment";
import ModelCodec from "./component/ModelCodec";
import MovementCodec from "./component/MovementCodec";

export interface _ComponentCodec<C extends Component, S, D> {
  map(component: C): S;
  delta(componentA: C, componentB: C): D;
  encode(spec: S): ComponentData;
  encodeDelta(delta: D): ComponentData;
  decode(segment: ComponentData): S;
  decodeDelta(delta: ComponentData): D;
}

type ComponentCodecMapping = {
  [key in ComponentId]?: _ComponentCodec<Component, object, object>;
}

export default class ComponentCodec {
  private static readonly _codecs: ComponentCodecMapping = {
    [ComponentId.MODEL]: new ModelCodec(),
    [ComponentId.MOVEMENT]: new MovementCodec(),
  }

  public static map<C extends Component, S, D>(id: ComponentId, component: C): S {
    const codec = this.getCodec<C, S, D>(id);

    return codec.map(component);
  }

  public static delta<C extends Component, S, D>(id: ComponentId, componentA: C, componentB: C): D {
    const codec = this.getCodec<C, S, D>(id);

    return codec.delta(componentA, componentB);
  }

  public static encode<S>(id: ComponentId, spec: S): ComponentSegment {
    const codec = this.getCodec(id);

    return [id, ...codec.encode(spec)];
  }

  public static encodeDelta<S>(id: ComponentId, spec: S): ComponentSegment {
    const codec = this.getCodec(id);

    return [id, ...codec.encodeDelta(spec)];
  }

  public static decode<C extends Component, S, D>(segment: ComponentSegment): S {
    const id = segment[0];
    const codec = this.getCodec<C, S, D>(id);

    return codec.decode(segment.slice(1));
  }

  public static decodeDelta<C extends Component, S, D>(segment: ComponentSegment): D {
    const id = segment[0];
    const codec = this.getCodec<C, S, D>(id);

    return codec.decodeDelta(segment.slice(1));
  }

  public static getCodec<C extends Component, S, D>(id: ComponentId): _ComponentCodec<C, S, D> {
    return this._codecs[id] as _ComponentCodec<C, S, D>;
  }
}
