import { ObjectHandler } from "../WorldPacketHandler";
import { DeltaWorldState } from "../../entity/WorldState";
import { ComponentId } from "../../protocol/codec/ComponentId";
import MovementSpec from "../../entity/component/MovementSpec";
import MovementComponent from "../../core/MovementComponent";

export default class WorldUpdateHandler extends ObjectHandler<DeltaWorldState> {

  public handleObject(deltaWorldState: DeltaWorldState): void {
    for (const guid of deltaWorldState.gameObjects.keys()) {
      const deltaState = deltaWorldState.gameObjects.get(guid)!;

      const gameObject = this.scope.objects.get(guid);

      if (gameObject && guid !== this.scope.playerGuid) {
        if (deltaState.gameObject.x !== undefined) {
          gameObject.x = deltaState.gameObject.x;
        }
        if (deltaState.gameObject.y !== undefined) {
          gameObject.y = deltaState.gameObject.y;
        }

        const movementState = deltaState.components.get(ComponentId.MOVEMENT) as MovementSpec;

        if (movementState) {
          const movement = gameObject.getComponent(MovementComponent);
          if (movementState.dx !== undefined) {
            movement.dx = movementState.dx;
          }
          if (movementState.dy !== undefined) {
            movement.dy = movementState.dy;
          }
        }
      }
    }
  }
}
