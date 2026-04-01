import { ObjectHandler } from "../WorldPacketHandler";
import { WorldStateDelta } from "../../entity/WorldState";
import ServerComponent from "../core/ServerComponent";
import { GameObjectStateDelta } from "../../entity/GameObjectState";
import { ComponentId } from "../../protocol/codec/ComponentId";
import { InventorySpecDelta } from "../../entity/component/InventorySpec";

export default class WorldUpdateHandler extends ObjectHandler<WorldStateDelta> {

  public handleObject(worldStateDelta: WorldStateDelta): void {
    const scope = this.context.scope;

    scope.resolveTimestamp(worldStateDelta);
    scope.lastProcessedTick = worldStateDelta.lastProcessedTick;

    for (const guid of worldStateDelta.objects.keys()) {
      const stateDelta = worldStateDelta.objects.get(guid);

      const gameObject = scope.objects.get(guid);

      if (!gameObject) {
        console.warn(`Received an update for a game object with GUID ${guid}, but this game object does not exist in the world.`);
        return;
      }

      const serverComponent = gameObject.getComponent(ServerComponent);
      serverComponent.addStateDelta(worldStateDelta.timestamp, stateDelta);

      if (scope.isPlayerGuid(guid)) {
        this.updateInventory(stateDelta);
      }
    }
  }

  private updateInventory(state: GameObjectStateDelta): void {
    const inventory = this.context.ui.inventory;
    const inventoryStateDelta = state.components.get(ComponentId.INVENTORY) as InventorySpecDelta;

    if (!inventoryStateDelta) return;

    console.log(inventoryStateDelta.slots);

    inventoryStateDelta.slots.forEach((slotDelta) => {
      inventory.setSlotContent(slotDelta.index, {
        item: slotDelta.item,
        count: slotDelta.count,
        confirmed: true
      });
    });
  }
}
