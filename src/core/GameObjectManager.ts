import GameObject from "./GameObject";

export default class GameObjectManager {

  private guid: number;

  public readonly gameObjects: Map<number, GameObject>;

  constructor() {
    this.guid = 0;
    this.gameObjects = new Map<number, GameObject>();
  }

  public update(delta: number): void {
    for(const gameObject of this.gameObjects.values()) {
      gameObject.update(delta);
    }
  }

  public destroy(): void {
    for(const gameObject of this.gameObjects.values()) {
      gameObject.destroy();
    }
  }

  public add(gameObject: GameObject): void {
    if (gameObject.guid === -1) {
      gameObject.guid = this.guid++;
    }

    this.gameObjects.set(gameObject.guid, gameObject);
  }

  public delete(gameObject: GameObject): void {
    this.gameObjects.delete(gameObject.guid);
  }
}
