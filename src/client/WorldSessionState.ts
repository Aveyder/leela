import WorldSceneGameObject from "./core/WorldSceneGameObject";
import WorldScene from "./world/WorldScene";
import WorldSession from "./WorldSession";

export default class WorldSessionState {
  public readonly session: WorldSession;
  public readonly scene: WorldScene;

  public player: WorldSceneGameObject | null;

  constructor(session: WorldSession) {
    this.session = session;
    this.scene = session.scene!;

    this.player = null;
  }

  public destroy(): void {
    this.player?.destroy();
  }
}
