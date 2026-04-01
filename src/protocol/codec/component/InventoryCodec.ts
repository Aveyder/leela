import { _ComponentCodec } from "../ComponentCodec";
import { ComponentData } from "../ComponentSegment";
import InventoryComponent from "../../../server/core/InventoryComponent";
import InventorySpec, { InventorySpecDelta, SlotSpec, SlotSpecDelta } from "../../../entity/component/InventorySpec";
import { ITEMS_BY_ID } from "../../../resource/Item";
import { INVENTORY_SIZE } from "../../../shared/Constants";

export default class InventoryCodec implements _ComponentCodec<InventoryComponent, InventorySpec, InventorySpecDelta> {
  map(component: InventoryComponent): InventorySpec {
    return {
      slots: this.cloneSlots(component.slots),
    };
  }

  delta(specA: InventorySpec, specB: InventorySpec): InventorySpecDelta | null {
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

    if (deltaSlots.length === 0) {
      return null;
    }

    return { slots: deltaSlots };
  }

  encode(spec: InventorySpec): ComponentData {
    const data = [] as ComponentData;

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
      slots: this.decodeSlotPairs(segment),
    };
  }

  decodeDelta(delta: ComponentData): InventorySpecDelta {
    const slots = [] as SlotSpecDelta[];

    let cursor = 0;
    while (cursor < delta.length) {
      const index = delta[cursor++] as number;
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
      slots: slots as SlotSpecDelta[],
    };
  }

  private decodeSlotPairs(data: ComponentData): SlotSpec[] {
    const slots = [] as SlotSpec[];

    let cursor = 0;
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
