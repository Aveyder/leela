import { ObjectHandler } from "../WorldPacketHandler";
import { GameObjectNew } from "../../entity/GameObjectNew";
import { ComponentId } from "../../protocol/codec/ComponentId";
import InventorySpec from "../../entity/component/InventorySpec";
import { GameObjectState } from "../../entity/GameObjectState";

export default class GameObjectNewHandler extends ObjectHandler<GameObjectNew> {
  public handleObject(gameObjectNew: GameObjectNew): void {
    const scope = this.context.scope;

    scope.resolveTimestamp(gameObjectNew);

    const state = gameObjectNew.state;

    scope.spawn.gameObject(gameObjectNew.timestamp, state);

    if (scope.isPlayer(state)) {
      this.initInventory(state);
    }
  }

  private initInventory(state: GameObjectState): void {
    const inventory = this.context.ui.inventory;
    const inventoryState = state.components.get(ComponentId.INVENTORY) as InventorySpec;

    inventory.setMoney(inventoryState.money);

    inventoryState.slots.forEach((slot, index) => {
      inventory.setSlotContent(index, {
        item: slot.item,
        count: slot.count,
        confirmed: true
      });
    });
  }
}
