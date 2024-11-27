import GameObjectManager from "../../core/GameObjectManager";
import GameObject from "../../core/GameObject";

export default class GameObjectManagerAdapter {

  private readonly objects: GameObjectManager;
  public readonly gameObjects: Map<number, GameObject>;

  constructor(gameObjects: GameObjectManager) {
    this.objects = gameObjects;
    this.gameObjects = new Map<number, GameObject>();
  }

  public get(serverGuid: number): GameObject | undefined {
    return this.gameObjects.get(serverGuid);
  }

  public add(serverGuid: number, gameObject: GameObject): GameObject {
    this.gameObjects.set(serverGuid, gameObject);

    return this.objects.add(gameObject);
  }

  public deleteByGuid(serverGuid: number): void {
    const gameObject = this.get(serverGuid);

    if (gameObject) {
      this.objects.delete(gameObject);
    }
  }
}
