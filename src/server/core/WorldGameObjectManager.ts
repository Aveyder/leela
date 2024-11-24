import GameObjectManager from "../../core/GameObjectManager";
import GameObject from "../../core/GameObject";
import World from "../world/World";
import { Opcode } from "../../protocol/Opcode";
import { GameObjectStateCodec } from "../../protocol/codec/GameObjectStateCodec";
import { GameObjectState } from "../../entity/GameObjectState";

export default class WorldGameObjectManager extends GameObjectManager {

  private readonly world: World;
  private _state: Map<number, GameObjectState>;

  constructor(world: World) {
    super();
    this.world = world;
    this._state = new Map();
  }

  public add(gameObject: GameObject): void {
    super.add(gameObject);

    this.world.broadcastObject<GameObjectState>(Opcode.SMSG_OBJECT, GameObjectStateCodec.INSTANCE.map(gameObject));
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
