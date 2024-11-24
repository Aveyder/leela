import GameObjectState from "./GameObjectState";

export default interface WorldState {
  gameObjects: Map<number, GameObjectState>;
}
