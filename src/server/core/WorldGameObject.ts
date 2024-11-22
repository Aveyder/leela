import GameObject from "../../core/GameObject";
import Component from "../../core/Component";
import WorldComponent from "./WorldComponent";
import World from "../world/World";

export default class WorldGameObject extends GameObject {

  private readonly world: World;

  constructor(world: World) {
    super();

    this.world = world;

    this.world.objects.add(this);
  }

  addComponent<T extends Component>(component: T) {
    if (component instanceof WorldComponent) {
      component.world = this.world;
    }

    super.addComponent(component);
  }

  destroy() {
    super.destroy();

    this.world.objects.delete(this);
  }
}
