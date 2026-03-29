import { SlotSpec } from "../entity/component/InventorySpec";

export default class Inventory {

  public static swapSlots(srcSlot: SlotSpec, destSlot: SlotSpec): { src: SlotSpec, dest: SlotSpec} {
    const srcItem = srcSlot.item;
    const destItem = destSlot.item;

    let nextSrc = {
      item: destItem,
      count: destSlot.count
    };
    let nextDest = {
      item: srcItem,
      count: srcSlot.count
    };

    if (srcItem && srcItem.id === destItem?.id) {
      const freeDestSpace = destItem.stackSize - destSlot.count;

      if (freeDestSpace > 0) {
        const transferCount = Math.min(freeDestSpace, srcSlot.count);

        nextSrc = {
          item: srcItem,
          count: srcSlot.count - transferCount
        };
        nextDest = {
          item: destItem,
          count: destSlot.count + transferCount
        };
      }
    }

    return {
      src: nextSrc,
      dest: nextDest
    };
  }
}
