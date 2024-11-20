import GameObject from "../../core/GameObject";
import Component from "../../core/Component";
import WorldSceneComponent from "./WorldSceneComponent";
import WorldScene from "../world/WorldScene";

export default class WorldSceneGameObject extends GameObject {

  private readonly scene: WorldScene;

  constructor(scene: WorldScene, guid: number) {
    super(guid);

    this.scene = scene;
  }

  addComponent<T extends Component>(component: T) {
    if (component instanceof WorldSceneComponent) {
      component.scene = this.scene;
    }

    super.addComponent(component);
  }
}
