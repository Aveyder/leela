import WorldSession from "./WorldSession";
import World from "./world/World";
import Player from "./core/Player";
import { Opcode } from "../protocol/Opcode";
import WorldState from "../entity/WorldState";
import GameObjectStateCodec from "../protocol/codec/GameObjectStateCodec";

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
      const gameObjects = Array.from(this.world.objects.gameObjects.values());

      // centralized serialization? and then every session pick the last one?
      this.worldState = {
        gameObjects: gameObjects.map(gameObject => GameObjectStateCodec.INSTANCE.map(gameObject))
      };

      this.session.sendObject<WorldState>(Opcode.SMSG_WORLD_INIT, this.worldState);
    } else {

    }
  }

  public destroy(): void {
    if (this.player) {
      this.world.objects.delete(this.player);
    }
  }
}
