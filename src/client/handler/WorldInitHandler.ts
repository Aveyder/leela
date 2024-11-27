import { ObjectHandler } from "../WorldPacketHandler";
import { WorldState } from "../../entity/WorldState";

export default class WorldInitHandler extends ObjectHandler<WorldState> {

  public handleObject(worldState: WorldState): void {
    for (let gameObject of worldState.gameObjects.values()) {
      if (this.scope.isPlayer(gameObject)) {
        this.scope.spawn.gameObject(gameObject);
      }
    }
  }
}
