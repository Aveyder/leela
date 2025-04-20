import { ObjectHandler } from "../WorldPacketHandler";
import { WorldState } from "../../entity/WorldState";

export default class WorldInitHandler extends ObjectHandler<WorldState> {

  public handleObject(worldState: WorldState): void {
    this.context.scope.resolveTimestamp(worldState);
    this.context.scope.lastProcessedTick = worldState.lastProcessedTick;

    for (const state of worldState.objects.values()) {
      this.context.scope.spawn.gameObject(worldState.timestamp, state);
    }
  }
}
