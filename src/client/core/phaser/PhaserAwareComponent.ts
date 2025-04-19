import Component from "../../../core/Component";
import { Game } from "phaser";

export default class PhaserAwareComponent extends Component {
  public game!: Game;
}
