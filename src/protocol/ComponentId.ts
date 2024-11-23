import ModelComponent from "../server/core/ModelComponent";
import Component from "../core/Component";

export enum ComponentId {
  MODEL
}

export class ComponentIdMapping {
  private static readonly mapping: Map<Function, ComponentId> = new Map([
    [ModelComponent, ComponentId.MODEL]
  ]);

 public static get<T extends Component>(component: T): ComponentId | undefined {
   return this.mapping.get(component.constructor);
 }
}
