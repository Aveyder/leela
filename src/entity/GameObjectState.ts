import GameObjectSpec from "./GameObjectSpec";
import { ComponentSpec, ComponentSpecDelta } from "./ComponentSpec";

export interface GameObjectState {
  gameObject: GameObjectSpec;
  components: ComponentSpec;
}

export interface GameObjectStateDelta extends Partial<GameObjectSpec> {
  gameObject: Partial<GameObjectSpec>;
  components: ComponentSpecDelta;
}
