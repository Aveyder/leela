import { WorldPacketData } from "../WorldPacket";
import { SymmetricCodec } from "../Codec";
import { ComponentId, ComponentIdMapping } from "../ComponentId";
import ComponentCodec from "../ComponentCodec";
import { ComponentSegment } from "../ComponentSegment";
import { ComponentSpec } from "../../entity/ComponentSpec";
import Component from "../../core/Component";

export default class ComponentSpecCodec implements SymmetricCodec<ComponentSpec> {

  public static readonly INSTANCE: ComponentSpecCodec = new ComponentSpecCodec();

  map(components: MapIterator<Component>): ComponentSpec {
    const componentSpec = {} as ComponentSpec;

    for(let component of components) {
      const componentId = ComponentIdMapping.get(component);

      if (componentId !== undefined) {
        componentSpec[componentId] = ComponentCodec.map(componentId, component) as object;
      }
    }

    return componentSpec;
  }
  encode(componentSpec: ComponentSpec): WorldPacketData {
    const data = [] as WorldPacketData;

    for (const key in componentSpec) {
      const componentId = Number(key) as ComponentId;
      if (componentId !== undefined) {
        const componentSegment = ComponentCodec.encode(
          componentId as unknown as ComponentId, componentSpec[componentId]
        );

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
