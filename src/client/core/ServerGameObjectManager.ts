import GameObjectManager from "../../core/GameObjectManager";
import GameObject from "../../core/GameObject";
import WorldSessionScope from "../WorldSessionScope";

export default class ServerGameObjectManager {

  private readonly objects: GameObjectManager;

  public readonly gameObjects: Map<number, GameObject>;

  constructor(objects: GameObjectManager) {
    this.objects = objects;

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

    this.gameObjects.delete(serverGuid);
  }

  public destroy(): void {
    this.gameObjects.clear();

    this.objects.destroy();
  }
}
