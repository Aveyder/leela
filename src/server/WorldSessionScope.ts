import WorldSession from "./WorldSession";
import World from "./world/World";
import Player from "./core/Player";
import { Opcode } from "../protocol/Opcode";
import { WorldState, WorldStateDelta } from "../entity/WorldState";
import { DeltaWorldStateCodec } from "../protocol/codec/WorldStateCodec";
import { GameObjectNew } from "../entity/GameObjectNew";
import { GameObjectState } from "../entity/GameObjectState";
import { ComponentIdMapping, ProjectionFlag } from "../protocol/codec/ComponentId";

export default class WorldSessionScope {

  public readonly session: WorldSession;
  public readonly world: World;

  public player: Player | null;
  public lastProcessedTick: number;
  private worldState: WorldState | null;

  constructor(session: WorldSession) {
    this.session = session;
    this.world = session.server.world;

    this.player = null;
    this.lastProcessedTick = -1;
    this.worldState = null;
  }

  public collectUpdate(delta: number): void {
    const lastWorldState = this.worldState;

    this.worldState = {
      timestamp: this.world.server.getTimestamp(),
      lastProcessedTick: this.lastProcessedTick,
      objects: this.projectWorldState(this.world.objects.state),
    };

    if (lastWorldState === null) {
      this.session.sendObject<WorldState>(Opcode.SMSG_WORLD_INIT, this.worldState);
    } else {
      const deltaWorldState = DeltaWorldStateCodec.INSTANCE.delta(lastWorldState, this.worldState);

      this.session.sendObject<WorldStateDelta>(Opcode.SMSG_WORLD_UPDATE, deltaWorldState);
    }
  }

  public sendObjectInit(object: GameObjectState): void {
    this.session.sendObject<GameObjectNew>(Opcode.SMSG_OBJECT, {
      timestamp: this.world.server.getTimestamp(),
      state: this.projectObjectState(object)
    });
  }

  private projectWorldState(objects: Map<number, GameObjectState>) {
    const projectedObjects = new Map<number, GameObjectState>();

    for (const [guid, object] of objects) {
      projectedObjects.set(guid, this.projectObjectState(object));
    }

    return projectedObjects;
  }

  private projectObjectState(object: GameObjectState): GameObjectState {
    const isOwner = object.gameObject.guid === this.player?.guid;

    if (isOwner) {
      return object;
    }

    const components = new Map();

    for (const [componentId, component] of object.components) {
      if (ComponentIdMapping.getProjection(componentId) === ProjectionFlag.PUBLIC) {
        components.set(componentId, component);
      }
    }

    return {
      gameObject: object.gameObject,
      components
    };
  }

  public destroy(): void {
    if (this.player) {
      this.world.objects.delete(this.player);
    }
  }
}
