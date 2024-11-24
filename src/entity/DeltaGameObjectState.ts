import { ComponentSpec } from "./ComponentSpec";
import GameObjectSpec from "./GameObjectSpec";

export default interface DeltaGameObjectState extends Partial<GameObjectSpec> {
  components: ComponentSpec;
}
