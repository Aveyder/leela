import GameObject from "../../core/GameObject";
import Component from "../../core/Component";
import WorldSceneComponent from "./WorldSceneComponent";
import WorldScene from "../world/WorldScene";

export default class WorldSceneGameObject extends GameObject {

  private readonly scene: WorldScene;

  constructor(scene: WorldScene) {
    super();

    this.scene = scene;

    this.scene.objects.add(this);
  }

  addComponent<T extends Component>(component: T) {
    if (component instanceof WorldSceneComponent) {
      component.scene = this.scene;
    }

    super.addComponent(component);
  }

  destroy() {
    super.destroy();

    this.scene.objects.delete(this);
  }
}
