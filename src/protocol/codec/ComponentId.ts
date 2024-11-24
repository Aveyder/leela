import ModelComponent from "../../server/core/ModelComponent";
import Component from "../../core/Component";
import MovementComponent from "../../core/MovementComponent";

export enum ComponentId {
  MODEL,
  MOVEMENT
}

export class ComponentIdMapping {
  private static readonly mapping: Map<Function, ComponentId> = new Map();

  static {
    this.mapping.set(ModelComponent, ComponentId.MODEL);
    this.mapping.set(MovementComponent, ComponentId.MOVEMENT);
  }

  public static get<T extends Component>(component: T): ComponentId | undefined {
    return this.mapping.get(component.constructor);
  }
}
