import { GameObjectStateDelta, GameObjectState } from "./GameObjectState";

export interface WorldState {
  timestamp: number;
  lastProcessedTick: number;
  objects: Map<number, GameObjectState>;
}

export interface WorldStateDelta {
  timestamp: number;
  lastProcessedTick: number;
  objects: Map<number, GameObjectStateDelta>;
}
