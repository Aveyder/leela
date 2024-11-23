import Component from "../core/Component";
import { ComponentId } from "./ComponentId";
import { ComponentData, ComponentSegment } from "./ComponentSegment";
import ModelCodec from "./codec/component/ModelCodec";

export interface _ComponentCodec<T extends Component> {
  encode(component: T): ComponentData;
  decode(segment: ComponentData): object
}

type ComponentCodecMapping = {
  [key in ComponentId]?: _ComponentCodec<Component>;
}

export default class ComponentCodec {
  private static readonly _codecs: ComponentCodecMapping = {
    [ComponentId.MODEL]: new ModelCodec()
  }

  public static encode<T extends Component>(id: ComponentId, component: T): ComponentSegment {
    const codec = this.getCodec(id);

    return [id, ...codec.encode(component)];
  }

  public static decode<T extends Component>(segment: ComponentSegment): object {
    const id = segment[0];
    const codec = this.getCodec<T>(id);

    return codec.decode(segment.slice(1));
  }

  public static getCodec<T extends Component>(id: ComponentId): _ComponentCodec<T> {
    return this._codecs[id] as _ComponentCodec<T>;
  }
}
