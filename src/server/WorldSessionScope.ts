import WorldSession from "./WorldSession";
import World from "./world/World";
import Player from "./core/Player";
import { Opcode } from "../protocol/Opcode";
import GameObject from "../core/GameObject";

export default class WorldSessionScope {

  public readonly session: WorldSession;
  public readonly world: World;

  public player: Player | null;

  private envInit: boolean;

  constructor(session: WorldSession) {
    this.session = session;
    this.world = session.server.world;

    this.player = null;

    this.envInit = false;
  }

  public collectUpdate(delta: number): void {
    if (this.envInit) {

    } else {
      const gameObjects = Array.from(this.world.objects.gameObjects.values());

      this.session.sendObject<GameObject[]>(Opcode.SMSG_ENV_INIT, gameObjects);

      this.envInit = true;
    }
  }

  public destroy(): void {
    if (this.player) {
      this.world.objects.delete(this.player);
    }
  }
}
