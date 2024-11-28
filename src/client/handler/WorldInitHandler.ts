import { ObjectHandler } from "../WorldPacketHandler";
import { WorldState } from "../../entity/WorldState";
import ServerComponent from "../core/ServerComponent";

export default class WorldInitHandler extends ObjectHandler<WorldState> {

  public handleObject(worldState: WorldState): void {
    this.scope.resolveTimestamp(worldState);

    for (let state of worldState.objects.values()) {
      this.scope.spawn.gameObject(worldState.timestamp, state);
    }
  }
}
