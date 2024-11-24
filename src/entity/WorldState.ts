import { DeltaGameObjectState, GameObjectState } from "./GameObjectState";

export interface WorldState {
  gameObjects: Map<number, GameObjectState>;
}

export interface DeltaWorldState {
  gameObjects: Map<number, DeltaGameObjectState>;
}
