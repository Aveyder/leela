import WorldGameObject from "./core/WorldGameObject";
import WorldSession from "./WorldSession";
import World from "./world/World";

export default class WorldSessionState {

  public readonly session: WorldSession;
  public readonly world: World;

  public player: WorldGameObject | null;

  constructor(session: WorldSession) {
    this.session = session;
    this.world = session.server.world;

    this.player = null;
  }

  public destroy(): void {
    this.player?.destroy();
  }
}
