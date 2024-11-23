import { ComponentSpec } from "./ComponentSpec";
import GameObjectSpec from "./GameObjectSpec";

export default interface GameObjectState extends GameObjectSpec {
  components: ComponentSpec;
}
