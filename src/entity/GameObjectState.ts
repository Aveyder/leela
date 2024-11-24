import GameObjectSpec from "./GameObjectSpec";
import { ComponentSpec, DeltaComponentSpec } from "./ComponentSpec";

export interface GameObjectState extends GameObjectSpec {
  components: ComponentSpec;
}

export interface DeltaGameObjectState extends Partial<GameObjectSpec> {
  components: DeltaComponentSpec;
}
