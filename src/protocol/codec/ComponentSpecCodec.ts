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
    const componentSpec = new Map<ComponentId, object>() as ComponentSpec;

    for(const component of components) {
      const componentId = ComponentIdMapping.get(component);

      if (componentId !== undefined) {
        componentSpec.set(componentId, ComponentCodec.map(componentId, component) as object);
      }
    }

    return componentSpec;
  }
  encode(componentSpec: ComponentSpec): WorldPacketData {
    const data = [] as WorldPacketData;

    for (const componentId of componentSpec.keys()) {
      if (componentId !== undefined) {
        const componentSegment = ComponentCodec.encode(
          componentId as unknown as ComponentId, componentSpec.get(componentId)
        );

        data.push(componentSegment);
      }
    }

    return data;
  }
  decode(componentSegments: ComponentSegment[]): ComponentSpec {
    return componentSegments.reduce((componentSpec, segment: ComponentSegment) => {
      const componentId = segment[0];

      componentSpec.set(componentId, ComponentCodec.decode(segment));

      return componentSpec;
    }, new Map<ComponentId, object>() as ComponentSpec);
  }
}
