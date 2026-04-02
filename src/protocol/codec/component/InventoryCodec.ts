import { _ComponentCodec } from "../ComponentCodec";
import { ComponentData } from "../ComponentSegment";
import InventoryComponent from "../../../server/core/InventoryComponent";
import InventorySpec, { InventorySpecDelta, SlotSpec, SlotSpecDelta } from "../../../entity/component/InventorySpec";
import { ITEMS_BY_ID } from "../../../resource/Item";
import { INVENTORY_SIZE } from "../../../shared/Constants";

export default class InventoryCodec implements _ComponentCodec<InventoryComponent, InventorySpec, InventorySpecDelta> {
  map(component: InventoryComponent): InventorySpec {
    return {
      money: component.money,
      slots: this.cloneSlots(component.slots),
    };
  }

  delta(specA: InventorySpec, specB: InventorySpec): InventorySpecDelta | null {
    const deltaMoney = specA.money !== specB.money ? specB.money : null;
    const deltaSlots = [] as SlotSpecDelta[];

    for (let index = 0; index < INVENTORY_SIZE; index++) {
      const slotA = specA.slots[index];
      const slotB = specB.slots[index];

      if (
        slotA.count !== slotB.count ||
        slotA.item?.id !== slotB.item?.id
      ) {
        deltaSlots.push({
          index,
          item: slotB.item,
          count: slotB.count,
        });
      }
    }

    if (deltaSlots.length === 0 && deltaMoney === null) {
      return null;
    }

    return { money: deltaMoney, slots: deltaSlots };
  }

  encode(spec: InventorySpec): ComponentData {
    const data = [spec.money] as ComponentData;

    for (const slot of spec.slots) {
      if (slot.item) {
        data.push(slot.item.id, slot.count);
      } else {
        data.push(-1);
      }
    }

    return data;
  }

  encodeDelta(delta: InventorySpecDelta): ComponentData {
    const data = [] as ComponentData;

    if (delta.money !== null) {
      data.push(-1, delta.money)
    }

    for (let index = 0; index < delta.slots.length; index++) {
      const slot = delta.slots[index];
      const slotIndex = (slot as SlotSpecDelta).index;

      if (slot.item) {
        data.push(slotIndex, slot.item.id, slot.count);
      } else {
        data.push(slotIndex, -1);
      }
    }

    return data;
  }

  decode(segment: ComponentData): InventorySpec {
    return {
      money: segment[0] as number,
      slots: this.decodeSlotPairs(segment),
    };
  }

  decodeDelta(delta: ComponentData): InventorySpecDelta {
    let money = null;
    const slots = [] as SlotSpecDelta[];

    let cursor = 0;
    while (cursor < delta.length) {
      const index = delta[cursor++] as number;

      if (index === -1) {
        money = delta[cursor++] as number;
        continue;
      }

      const itemId = delta[cursor++] as number;

      if (itemId !== -1) {
        const count = delta[cursor++] as number;
        slots.push({
          index,
          ...this.decodeSlot(itemId, count),
        });
      } else {
        slots.push({
          index,
          item: null,
          count: 0,
        });
      }
    }

    return {
      money: money,
      slots: slots as SlotSpecDelta[],
    };
  }

  private decodeSlotPairs(data: ComponentData): SlotSpec[] {
    const slots = [] as SlotSpec[];

    let cursor = 1;
    while (cursor < data.length) {
      const itemId = data[cursor++] as number;
      if (itemId !== -1) {
        const count = data[cursor++] as number;
        slots.push(this.decodeSlot(itemId, count));
      } else {
        slots.push({ item: null, count: 0 });
      }
    }

    return slots;
  }

  private decodeSlot(itemId: number, count: number): SlotSpec {
    const item = ITEMS_BY_ID.get(itemId);

    if (!item) {
      return { item: null, count: 0 };
    }

    return {item, count};
  }

  private cloneSlots(slots: SlotSpec[]): SlotSpec[] {
    return slots.map((slot) => ({
      item: slot.item,
      count: slot.count,
    }));
  }
}
