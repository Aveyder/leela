import GameObject from "../../../core/GameObject";
import Component from "../../../core/Component";
import PhaserAwareComponent from "./PhaserAwareComponent";
import { Game } from "phaser";

export default class PhaserAwareGameObject extends GameObject {

  private readonly game: Game;

  constructor(game: Game, guid?: number) {
    super(guid);

    this.game = game;
  }

  addComponent<T extends Component>(component: T) {
    if (component instanceof PhaserAwareComponent) {
      component.game = this.game;
    }

    super.addComponent(component);
  }
}
