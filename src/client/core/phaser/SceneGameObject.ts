import GameObject from "../../../core/GameObject";
import Component from "../../../core/Component";
import SceneComponent from "./SceneComponent";
import { Scene } from "phaser";

export default class SceneGameObject<T extends Scene> extends GameObject {

  private readonly scene: T;

  constructor(scene: T, guid?: number) {
    super(guid);

    this.scene = scene;
  }

  addComponent<T extends Component>(component: T) {
    if (component instanceof SceneComponent) {
      component.scene = this.scene;
    }

    super.addComponent(component);
  }
}
