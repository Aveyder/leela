import { Image } from "./Image";

export interface SpritesheetDescriptor {
  imageKey: Image,
  assetImage: string,
  assetJSON: string,
}

export const SPRITESHEETS = [
  {
    imageKey: Image.UNIT,
    assetImage: "unit.png",
    assetJSON: "unit.json",
  },
  {
    imageKey: Image.ITEM,
    assetImage: "item.png",
    assetJSON: "item.json",
  }
] as SpritesheetDescriptor[];
