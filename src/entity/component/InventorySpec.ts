import { ItemDescriptor } from "../../resource/Item";

export default interface InventorySpec {
  money: number;
  slots: SlotSpec[];
}

export interface InventorySpecDelta {
  money: number | null;
  slots: SlotSpecDelta[];
}

export interface SlotSpec {
  item: ItemDescriptor | null
  count: number
}

export interface SlotSpecDelta extends SlotSpec {
  index: number
}
