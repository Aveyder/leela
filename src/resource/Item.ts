import { Image } from "./Image";

export const ItemQuality = {
  POOR: 0,
  NORMAL: 1,
  UNCOMMON: 2,
  RARE: 3,
  EPIC: 4,
  LEGENDARY: 5,
} as const;

export type ItemQuality = typeof ItemQuality[keyof typeof ItemQuality];

export const ITEM_QUALITY_COLOR: Record<ItemQuality, string> = {
  [ItemQuality.POOR]: "#a0a0a0",
  [ItemQuality.NORMAL]: "#ffffff",
  [ItemQuality.UNCOMMON]: "#1eff00",
  [ItemQuality.RARE]: "#0070ff",
  [ItemQuality.EPIC]: "#a335ee",
  [ItemQuality.LEGENDARY]: "#ff8000"
};

export interface ItemDescriptor {
  id: number,
  imageKey: Image,
  asset: string,
  name: string,
  description: string,
  quality: ItemQuality,
  stackSize: number
}

export const MONEY_ITEM_ID = 0;

export const ITEMS: ItemDescriptor[] = [
  {
    id: 1,
    imageKey: Image.ITEM,
    asset: "item_1.png",
    name: "Orange Gem",
    description: "A gem that looks like an orange",
    quality: ItemQuality.LEGENDARY,
    stackSize: 20,
  },
  {
    id: 2,
    imageKey: Image.ITEM,
    asset: "item_2.png",
    name: "Green Gem",
    description: "A gem that looks green",
    quality: ItemQuality.UNCOMMON,
    stackSize: 20
  },
  {
    id: 3,
    imageKey: Image.ITEM,
    asset: "item_3.png",
    name: "Blue Gem",
    description: "A gem that looks blue",
    quality: ItemQuality.RARE,
    stackSize: 20
  },
  {
    id: 4,
    imageKey: Image.ITEM,
    asset: "item_4.png",
    name: "Pink Gem",
    description: "A gem that looks pink",
    quality: ItemQuality.EPIC,
    stackSize: 20
  },
  {
    id: 5,
    imageKey: Image.ITEM,
    asset: "item_5.png",
    name: "Amber Gem",
    description: "A gem that looks amber",
    quality: ItemQuality.LEGENDARY,
    stackSize: 20
  },
  {
    id: 6,
    imageKey: Image.ITEM,
    asset: "item_6.png",
    name: "Silver Gem",
    description: "A gem that looks silver",
    quality: ItemQuality.POOR,
    stackSize: 20
  },
  {
    id: 7,
    imageKey: Image.ITEM,
    asset: "item_7.png",
    name: "Gold Coin",
    description: "A shiny gold coin",
    quality: ItemQuality.NORMAL,
    stackSize: 1
  }
];

export const ITEMS_BY_ID: Map<number, ItemDescriptor> = ITEMS.reduce(
  (acc: Map<number, ItemDescriptor>, model: ItemDescriptor) => {
    acc.set(model.id, model);

    return acc;
  },
  new Map<number, ItemDescriptor>()
);
