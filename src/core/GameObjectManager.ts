import GameObject from "./GameObject";

export default class GameObjectManager {

  private guid: number;

  public readonly gameObjects: Map<number, GameObject>;

  constructor() {
    this.guid = 0;
    this.gameObjects = new Map<number, GameObject>();
  }

  public add(gameObject: GameObject): void {
    if (gameObject.guid === -1) {
      gameObject.guid = this.guid++;
    }

    gameObject.init();
    gameObject.start();

    this.gameObjects.set(gameObject.guid, gameObject);
  }

  public update(delta: number): void {
    for(const gameObject of this.gameObjects.values()) {
      gameObject.update(delta);
    }
  }

  public destroy(): void {
    for(const gameObject of this.gameObjects.values()) {
      this.delete(gameObject);
    }
  }

  public delete(gameObject: GameObject): void {
    gameObject.destroy();

    this.gameObjects.delete(gameObject.guid);
  }
}
