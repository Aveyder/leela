import GameObjectManager from "../../core/GameObjectManager";
import GameObject from "../../core/GameObject";
import World from "../world/World";
import { Opcode } from "../../protocol/Opcode";
import { GameObjectStateCodec } from "../../protocol/codec/GameObjectStateCodec";
import { GameObjectState } from "../../entity/GameObjectState";
import { GameObjectNew } from "../../entity/GameObjectNew";

export default class WorldGameObjectManager extends GameObjectManager {

  private readonly world: World;
  private _state: Map<number, GameObjectState>;

  constructor(world: World) {
    super();
    this.world = world;
    this._state = new Map();
  }

  public add(gameObject: GameObject): GameObject {
    const createdGameObject = super.add(gameObject);

    this.world.broadcastObject<GameObjectNew>(Opcode.SMSG_OBJECT, {
      timestamp: this.world.server.getTimestamp(),
      state: GameObjectStateCodec.INSTANCE.map(createdGameObject)
    });

    return createdGameObject;
  }

  update(delta: number) {
    super.update(delta);

    this._state = new Map();
    for (let gameObject of this.gameObjects.values()) {
      this._state.set(gameObject.guid, GameObjectStateCodec.INSTANCE.map(gameObject));
    }
  }

  public delete(gameObject: GameObject): void {
    this.world.broadcast([Opcode.SMGS_OBJECT_DESTROY, gameObject.guid]);

    super.delete(gameObject);
  }

  public get state(): Map<number, GameObjectState> {
    return this._state;
  }
}
