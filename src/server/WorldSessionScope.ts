import WorldSession from "./WorldSession";
import World from "./world/World";
import Player from "./core/Player";
import { Opcode } from "../protocol/Opcode";
import WorldState from "../entity/WorldState";
import DeltaWorldState from "../entity/DeltaWorldState";

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
    if (this.worldState === null) {
      this.worldState = { gameObjects: this.world.objects.state };

      this.session.sendObject<WorldState>(Opcode.SMSG_WORLD_INIT, this.worldState);
    } else {
      const deltaWorldState = {} as DeltaWorldState;

      // this.session.sendObject<DeltaWorldState>(Opcode.SMSG_WORLD_UPDATE, deltaWorldState);
    }
  }

  public destroy(): void {
    if (this.player) {
      this.world.objects.delete(this.player);
    }
  }
}
