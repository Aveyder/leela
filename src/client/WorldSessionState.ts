import WorldScene from "./world/WorldScene";
import WorldSession from "./WorldSession";
import Player from "./core/Player";

export default class WorldSessionState {
  public readonly session: WorldSession;
  public readonly scene: WorldScene;

  public player: Player | null;

  constructor(session: WorldSession) {
    this.session = session;
    this.scene = session.scene!;

    this.player = null;
  }

  public destroy(): void {
    this.scene.objects.destroy();

    this.player = null;
  }
}
