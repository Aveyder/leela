import { ObjectHandler } from "../WorldPacketHandler";
import { WorldStateDelta } from "../../entity/WorldState";
import ServerComponent from "../core/ServerComponent";

export default class WorldUpdateHandler extends ObjectHandler<WorldStateDelta> {

  public handleObject(worldStateDelta: WorldStateDelta): void {
    this.context.scope.resolveTimestamp(worldStateDelta);
    this.context.scope.lastProcessedTick = worldStateDelta.lastProcessedTick;

    for (const guid of worldStateDelta.objects.keys()) {
      const stateDelta = worldStateDelta.objects.get(guid)!;

      const gameObject = this.context.scope.objects.get(guid)!;

      if (!gameObject) {
        console.warn(`Received an update for a game object with GUID ${guid}, but this game object does not exist in the world.`);
        return;
      }

      const serverComponent = gameObject.getComponent(ServerComponent);
      serverComponent.addStateDelta(worldStateDelta.timestamp, stateDelta);
    }
  }
}
