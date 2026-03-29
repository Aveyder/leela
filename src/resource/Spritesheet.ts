import { Image } from "./Image";

export interface SpritesheetDescriptor {
  imageKey: Image,
  assetImage: string,
  assetJSON: string,
}

export class Spritesheet {
  public static readonly GENERAL = {
    imageKey: Image.GENERAL,
    assetImage: "general.png",
    assetJSON: "general.json",
  } as SpritesheetDescriptor
}

export const SPRITESHEETS: SpritesheetDescriptor[] = Object.values(Spritesheet);
