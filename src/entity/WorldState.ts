import { GameObjectStateDelta, GameObjectState } from "./GameObjectState";

export interface WorldState {
  timestamp: number;
  objects: Map<number, GameObjectState>;
}

export interface WorldStateDelta {
  timestamp: number;
  objects: Map<number, GameObjectStateDelta>;
}
