import Component from "../../../core/Component";
import { Game } from "phaser";
import GameContext from "../../GameContext";

export default class ContextAwareComponent extends Component {
  public context!: GameContext;
}
