import GameObjectSpec from "./GameObjectSpec";
import { ComponentSpec } from "./ComponentSpec";

export default interface GameObjectState extends GameObjectSpec {
  components: ComponentSpec;
}
