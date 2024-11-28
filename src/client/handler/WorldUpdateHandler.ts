import { ObjectHandler } from "../WorldPacketHandler";
import { WorldStateDelta } from "../../entity/WorldState";
import ServerComponent from "../core/ServerComponent";

export default class WorldUpdateHandler extends ObjectHandler<WorldStateDelta> {

  public handleObject(worldStateDelta: WorldStateDelta): void {
    this.scope.resolveTimestamp(worldStateDelta);

    for (const guid of worldStateDelta.objects.keys()) {
      const stateDelta = worldStateDelta.objects.get(guid)!;

      const gameObject = this.scope.objects.get(guid)!;

      const serverComponent = gameObject.getComponent(ServerComponent);
      serverComponent.addStateDelta(worldStateDelta.timestamp, stateDelta);
    }
  }
}
