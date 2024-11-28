import { ObjectHandler } from "../WorldPacketHandler";
import { DeltaWorldState } from "../../entity/WorldState";

export default class WorldUpdateHandler extends ObjectHandler<DeltaWorldState> {

  public handleObject(deltaWorldState: DeltaWorldState): void {
    for (const guid of deltaWorldState.gameObjects.keys()) {
      const deltaState = deltaWorldState.gameObjects.get(guid)!;

      const gameObject = this.scope.objects.get(guid)!;
    }
  }
}
