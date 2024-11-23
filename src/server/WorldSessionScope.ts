import WorldSession from "./WorldSession";
import World from "./world/World";
import Player from "./core/Player";

export default class WorldSessionScope {

  public readonly session: WorldSession;
  public readonly world: World;

  public player: Player | null;

  constructor(session: WorldSession) {
    this.session = session;
    this.world = session.server.world;

    this.player = null;
  }

  public destroy(): void {
    if (this.player) {
      this.world.objects.delete(this.player);
    }
  }
}
