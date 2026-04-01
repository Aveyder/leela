import { ObjectHandler } from "../WorldPacketHandler";
import SwapItem from "../../entity/SwapItem";
import InventoryComponent from "../core/InventoryComponent";

export default class SwapItemHandler extends ObjectHandler<SwapItem> {

  public handleObject(swap: SwapItem): void {
    const player = this.scope.player;

    const movement = player.getComponent(InventoryComponent);

    movement.swapSlots(swap.src, swap.dest);
  }
}
