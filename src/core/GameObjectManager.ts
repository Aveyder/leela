import GameObject from "./GameObject";

export default class GameObjectManager {

  private _guid: number;

  public readonly gameObjects: Map<number, GameObject>;

  constructor() {
    this._guid = 0;
    this.gameObjects = new Map<number, GameObject>();
  }

  public add(gameObject: GameObject): void {
    if (gameObject.guid === -1) {
      gameObject.guid = this.guid();
    }

    gameObject.init();

    this.gameObjects.set(gameObject.guid, gameObject);
  }

  public update(delta: number): void {
    this.forEachGameObject((gameObject: GameObject) => gameObject.update(delta));
  }

  public destroy(): void {
    this.forEachGameObject((gameObject: GameObject) => this.delete(gameObject));

    this._guid = 0;
  }

  public deleteByGuid(guid: number): void {
    const gameObject = this.gameObjects.get(guid);

    if (gameObject) {
      this.delete(gameObject);
    }
  }

  public delete(gameObject: GameObject): void {
    gameObject.destroy();

    this.gameObjects.delete(gameObject.guid);
  }

  public guid(): number {
    return this._guid++;
  }

  private forEachGameObject(callback: (gameObject: GameObject) => void): void {
    for(const gameObject of this.gameObjects.values()) {
      callback(gameObject);
    }
  }
}
