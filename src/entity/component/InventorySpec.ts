import { ItemDescriptor } from "../../resource/Item";

export default interface InventorySpec {
  slots: SlotSpec[];
}

export interface InventorySpecDelta {
  slots: SlotSpecDelta[];
}

export interface SlotSpec {
  item: ItemDescriptor | null
  count: number
}

export interface SlotSpecDelta extends SlotSpec {
  index: number
}
