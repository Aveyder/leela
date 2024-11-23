import Component from "./Component";
import { Constructor } from "../utils/Constructor";
import GameObjectSpec from "../entity/GameObjectSpec";

export default class GameObject implements GameObjectSpec {
  public guid: number;
  public x: number;
  public y: number;
  public isStatic: boolean;
  public visible: boolean;
  public active: boolean;

  private components: Map<Function, Component> = new Map();

  constructor(guid: number = -1) {
    this.guid = guid;
    this.x = 0;
    this.y = 0;
    this.isStatic = true;
    this.visible = true;
    this.active = true;
  };

  public addComponents<T extends Component>(components: T[]): void {
    components.forEach(component => this.addComponent(component));
  }

  public addComponent<T extends Component>(component: T): void {
    const componentClass = component.constructor;

    if (this.components.has(componentClass)) {
      throw new Error(`Component of type ${componentClass.name} already exists.`);
    }

    component.gameObject = this;

    this.components.set(componentClass, component);
  }

  public getComponent<T extends Component>(componentClass: Constructor<T>): T {
    return this.components.get(componentClass) as T;
  }

  public getComponents(){
    return this.components.values();
  }

  public removeComponent<T extends Component>(componentClass: Constructor<T>): void {
    const component = this.getComponent(componentClass);

    if (component) {
      component.destroy();

      this.components.delete(componentClass);
    }
  }

  public init(): void {
    this.forEachComponent(component => component.init());
    this.forEachComponent(component => component.start());
  }

  public update(delta: number): void {
    if (!this.active) return;

    this.forEachComponent(component => component.update(delta));
    this.forEachComponent(component => component.lateUpdate(delta));
  }

  public destroy(): void {
    this.forEachComponent(component => component.destroy());
  }

  private forEachComponent(callback: (component: Component) => void): void {
    for(const component of this.components.values()) {
      callback(component);
    }
  }
}
