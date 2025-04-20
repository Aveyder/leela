import GameObject from "../../../core/GameObject";
import Component from "../../../core/Component";
import ContextAwareComponent from "./ContextAwareComponent";
import GameContext from "../../GameContext";

export default class ContextAwareGameObject extends GameObject {

  private readonly context: GameContext;

  constructor(context: GameContext, guid?: number) {
    super(guid);

    this.context = context;
  }

  addComponent<T extends Component>(component: T) {
    if (component instanceof ContextAwareComponent) {
      component.context = this.context;
    }

    super.addComponent(component);
  }
}
