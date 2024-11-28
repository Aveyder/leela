import { DeltaGameObjectState, GameObjectState } from "./GameObjectState";

export interface WorldState {
  timestamp: number;
  objects: Map<number, GameObjectState>;
}

export interface DeltaWorldState {
  timestamp: number;
  objects: Map<number, DeltaGameObjectState>;
}
