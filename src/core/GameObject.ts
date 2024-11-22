import { GameObjectType } from "./GameObjectType";
import { GameObjectFlag } from "./GameObjectFlag";
import Component from "./Component";
import { Constructor } from "../utils/Constructor";

export default class GameObject {
  public guid: number;
  public type: GameObjectType;
  public x: number;
  public y: number;
  public isStatic: boolean;
  public visible: boolean;
  public active: boolean;
  public flags: number;

  // optimize indexing for postUpdate
  private components: Map<Function, Component> = new Map();

  constructor(guid: number = -1) {
    this.guid = guid;
    this.type = GameObjectType.None;
    this.x = 0;
    this.y = 0;
    this.isStatic = true;
    this.visible = true;
    this.active = true;
    this.flags = GameObjectFlag.None;
  };

  public addComponent<T extends Component>(component: T): void {
    const componentClass = component.constructor;

    if (this.components.has(componentClass)) {
      throw new Error(`Component of type ${componentClass.name} already exists.`);
    }

    component.gameObject = this;

    this.components.set(componentClass, component);

    component.start();
  }

  public addComponents<T extends Component>(components: T[]): void {
    components.forEach(component => this.addComponent(component));
  }

  public getComponent<T extends Component>(componentClass: Constructor<T>): T {
    return this.components.get(componentClass) as T;
  }

  public removeComponent<T extends Component>(componentClass: Constructor<T>): void {
    const component = this.getComponent(componentClass);

    if (component) {
      component.destroy();

      this.components.delete(componentClass);
    }
  }

  public update(delta: number): void {
    if (!this.active) return;

    for(const component of this.components.values()) {
      component.update(delta);
    }
  }

  public destroy(): void {
    for(const component of this.components.values()) {
      component.destroy();
    }

    this.components.clear();
  }
}
