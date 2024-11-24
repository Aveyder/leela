import GameObjectSpec from "./GameObjectSpec";
import { ComponentSpec, DeltaComponentSpec } from "./ComponentSpec";

export interface GameObjectState {
  gameObject: GameObjectSpec;
  components: ComponentSpec;
}

export interface DeltaGameObjectState extends Partial<GameObjectSpec> {
  gameObject: Partial<GameObjectSpec>;
  components: DeltaComponentSpec;
}
