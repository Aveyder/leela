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

    this.gameObjects.set(gameObject.guid, gameObject);
  }

  public update(delta: number): void {
    this.forEachGameObject((gameObject: GameObject) => gameObject.update(delta));
  }

  public destroy(): void {
    this.forEachGameObject((gameObject: GameObject) => this.delete(gameObject));

    this.guid = 0;
  }

  public delete(gameObject: GameObject): void {
    gameObject.destroy();

    this.gameObjects.delete(gameObject.guid);
  }

  private forEachGameObject(callback: (gameObject: GameObject) => void): void {
    for(const gameObject of this.gameObjects.values()) {
      callback(gameObject);
    }
  }
}
