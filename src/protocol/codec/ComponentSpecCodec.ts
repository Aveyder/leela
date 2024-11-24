import { WorldPacketData } from "../WorldPacket";
import { SymmetricCodec } from "../Codec";
import { ComponentId, ComponentIdMapping } from "./ComponentId";
import ComponentCodec from "./ComponentCodec";
import { ComponentSegment } from "./ComponentSegment";
import { ComponentSpec, DeltaComponentSpec } from "../../entity/ComponentSpec";
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
  delta(componentASpec: ComponentSpec, componentBSpec: ComponentSpec): DeltaComponentSpec {
    const deltaComponentSpec = new Map() as DeltaComponentSpec;
    for (const componentId of componentBSpec.keys()) {
      const componentSpecA = componentASpec.get(componentId);
      const componentSpecB = componentBSpec.get(componentId)!;

      if (!componentSpecA) continue;

      const delta = ComponentCodec.delta(componentId, componentSpecA, componentSpecB);

      if (delta !== null) {
        deltaComponentSpec.set(componentId, delta!);
      }
    }
    return deltaComponentSpec as DeltaComponentSpec;
  }
  encode(componentSpec: ComponentSpec): WorldPacketData {
    const data = [] as WorldPacketData;

    for (const componentId of componentSpec.keys()) {
      const componentSegment = ComponentCodec.encode(componentId, componentSpec.get(componentId));

      data.push(componentSegment);
    }

    return data;
  }
  encodeDelta(deltaComponentSpec: DeltaComponentSpec): WorldPacketData {
    const data = [] as WorldPacketData;

    for (const componentId of deltaComponentSpec.keys()) {
      const componentSegment = ComponentCodec.encodeDelta(componentId, deltaComponentSpec.get(componentId));

      data.push(componentSegment);
    }

    return data;
  }
  decode(componentSegments: ComponentSegment[]): ComponentSpec {
    return componentSegments.reduce((componentSpec, segment: ComponentSegment) => {
      const componentId = segment[0];

      componentSpec.set(componentId, ComponentCodec.decode(segment));

      return componentSpec;
    }, new Map() as ComponentSpec);
  }
  decodeDelta(deltaComponentSegments: ComponentSegment[]): DeltaComponentSpec {
    return deltaComponentSegments.reduce((deltaComponentSpec, segment: ComponentSegment) => {
      const componentId = segment[0];

      deltaComponentSpec.set(componentId, ComponentCodec.decodeDelta(segment));

      return deltaComponentSpec;
    }, new Map() as DeltaComponentSpec);
  }
}
