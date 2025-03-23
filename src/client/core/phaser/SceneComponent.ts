import Component from "../../../core/Component";
import { Scene } from "phaser";

export default class SceneComponent<S extends Scene> extends Component {
  public scene!: S;
}
