import GameObject from "../../core/GameObject";

export default class GameObjectManager {

  public readonly gameObjects: Map<number, GameObject>;

  constructor() {
    this.gameObjects = new Map<number, GameObject>();
  }
}
