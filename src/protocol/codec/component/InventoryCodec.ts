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
      data.push(slot.item?.id ?? -1, slot.count);
    }

    return data;
  }

  encodeDelta(delta: InventorySpecDelta): ComponentData {
    const data = [] as ComponentData;

    for (let index = 0; index < delta.slots.length; index++) {
      const slot = delta.slots[index];
      const slotIndex = (slot as SlotSpecDelta).index;

      data.push(slotIndex, slot.item?.id ?? -1, slot.count);
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

    for (let i = 0; i + 2 < delta.length; i += 3) {
      const index = delta[i] as number;
      const itemId = delta[i + 1] as number;
      const count = delta[i + 2] as number;

      slots.push({
        index,
        ...this.decodeSlot(itemId, count),
      });
    }

    return {
      slots: slots as SlotSpecDelta[],
    };
  }

  private decodeSlotPairs(data: ComponentData): SlotSpec[] {
    const slots = [] as SlotSpec[];

    for (let i = 0; i + 1 < data.length; i += 2) {
      const itemId = data[i] as number;
      const count = data[i + 1] as number;

      slots.push(this.decodeSlot(itemId, count));
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
