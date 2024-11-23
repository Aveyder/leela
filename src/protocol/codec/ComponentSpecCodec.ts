import { WorldPacketData } from "../WorldPacket";
import { _Codec } from "../Codec";
import GameObject from "../../core/GameObject";
import { ComponentIdMapping } from "../ComponentId";
import ComponentCodec from "../ComponentCodec";
import { ComponentSegment } from "../ComponentSegment";
import { ComponentSpec } from "../../entity/ComponentSpec";

export default class ComponentSpecCodec implements _Codec<GameObject, ComponentSpec> {
  encode(gameObject: GameObject): WorldPacketData {
    const data = [] as WorldPacketData;

    for (let component of gameObject.getComponents()) {
      const componentId = ComponentIdMapping.get(component);

      if (componentId !== undefined) {
        const componentSegment = ComponentCodec.encode(componentId, component);

        data.push(componentSegment);
      }
    }

    return data;
  }
  decode(componentSegments: ComponentSegment[]): ComponentSpec {
    return componentSegments.reduce((components, segment: ComponentSegment) => {
      const componentId = segment[0];

      components[componentId] = ComponentCodec.decode(segment);

      return components;
    }, {} as ComponentSpec);
  }
}
