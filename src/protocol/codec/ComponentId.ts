import ModelComponent from "../../server/core/ModelComponent";
import Component from "../../core/Component";
import MovementComponent from "../../server/core/MovementComponent";
import InventoryComponent from "../../server/core/InventoryComponent";

export enum ComponentId {
  MODEL,
  MOVEMENT,
  INVENTORY
}

export enum ProjectionFlag {
  PUBLIC = 0,
  PRIVATE = 1
}

export class ComponentIdMapping {
  private static readonly mapping: Map<Function, ComponentId> = new Map();
  private static readonly projectionMapping: Map<ComponentId, ProjectionFlag> = new Map();

  static {
    this.define(ComponentId.MODEL, ModelComponent, ProjectionFlag.PUBLIC);
    this.define(ComponentId.MOVEMENT, MovementComponent, ProjectionFlag.PUBLIC);
    this.define(ComponentId.INVENTORY, InventoryComponent, ProjectionFlag.PRIVATE);
  }

  private static define(componentId: ComponentId, component: Function, projectionFlag: ProjectionFlag): void {
    this.mapping.set(component, componentId);
    this.projectionMapping.set(componentId, projectionFlag);
  }

  public static get<T extends Component>(component: T): ComponentId | undefined {
    return this.mapping.get(component.constructor);
  }

  public static getProjection(componentId: ComponentId): ProjectionFlag {
    return this.projectionMapping.get(componentId);
  }
}
