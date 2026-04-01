import Component from "../../core/Component";
import { SlotSpec } from "../../entity/component/InventorySpec";
import { INVENTORY_SIZE } from "../../shared/Constants";
import { clamp } from "../utils/math";
import Inventory from "../../shared/Inventory";
import { ITEMS } from "../../resource/Item";

export default class InventoryComponent extends Component {

  private _slots: SlotSpec[];

  constructor() {
    super();
  }

  public get slots(): SlotSpec[] {
    return this._slots;
  }

  public init(): void {
    this._slots = Array.from(
      { length: INVENTORY_SIZE },
      () => ({ item: null, count: 0 } as SlotSpec),
    );

    this.createTestItems();
  }

  public setSlotContent(index: number, content: Partial<SlotSpec>): void {
    const slot = this._slots[index];

    const { count = 0, item = null } = content;

    if (count > 0 && item) {
      slot.item = item;
      slot.count = clamp(count, 0, item.stackSize);
    } else {
      this.clearSlot(index);
    }
  }

  public swapSlots(srcIndex: number, destIndex: number): boolean {
    console.log(`Swap ${srcIndex} -> ${destIndex}`);
    if (srcIndex === destIndex) {
      return false;
    }

    const srcSlot = this._slots[srcIndex];
    const destSlot = this._slots[destIndex];

    const { src, dest } = Inventory.swapSlots(srcSlot, destSlot);

    this.setSlotContent(srcIndex, src);
    this.setSlotContent(destIndex, dest);

    return true;
  }

  public clearSlot(index: number): void {
    const slot = this._slots[index];

    slot.item = null;
    slot.count = 0;
  }

  private createTestItems(): void {
    const EMPTY_SLOT_CHANCE = 0.35;

    for (let slot = 0; slot < INVENTORY_SIZE; slot++) {
      if (Math.random() < EMPTY_SLOT_CHANCE) {
        continue;
      }

      const item = ITEMS[Math.floor(Math.random() * ITEMS.length)];

      this.setSlotContent(slot, {
        item,
        count: Math.floor(Math.random() * item.stackSize),
      });
    }
  }
}
