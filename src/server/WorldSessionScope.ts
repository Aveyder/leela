import WorldSession from "./WorldSession";
import World from "./world/World";
import Player from "./core/Player";
import { Opcode } from "../protocol/Opcode";
import { DeltaWorldState, WorldState } from "../entity/WorldState";
import { DeltaWorldStateCodec } from "../protocol/codec/WorldStateCodec";

export default class WorldSessionScope {

  public readonly session: WorldSession;
  public readonly world: World;

  public player: Player | null;
  private worldState: WorldState | null;

  constructor(session: WorldSession) {
    this.session = session;
    this.world = session.server.world;

    this.player = null;
    this.worldState = null;
  }

  public collectUpdate(delta: number): void {
    const lastWorldState = this.worldState;

    this.worldState = {
      timestamp: this.world.server.getTimestamp(),
      objects: this.world.objects.state,
    };

    if (lastWorldState === null) {
      this.session.sendObject<WorldState>(Opcode.SMSG_WORLD_INIT, this.worldState);
    } else {
      const deltaWorldState = DeltaWorldStateCodec.INSTANCE.delta(lastWorldState, this.worldState);

      this.session.sendObject<DeltaWorldState>(Opcode.SMSG_WORLD_UPDATE, deltaWorldState);
    }
  }

  public destroy(): void {
    if (this.player) {
      this.world.objects.delete(this.player);
    }
  }
}
