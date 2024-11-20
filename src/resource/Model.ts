import { Image } from "./Image";

export interface Model {
  imageKey: Image,
  type: ModelType,
  asset: string,
  anim: {
    up: string,
    down: string,
    left: string,
    right: string,
  }
}

export enum ModelType {
  CHAR = 0,
}

export const MODELS: Model[] = [
  {
    imageKey: Image.UNIT_0,
    type: ModelType.CHAR,
    asset: "unit_0.png",
  },
  {
    imageKey: Image.UNIT_1,
    type: ModelType.CHAR,
    asset: "unit_1.png"
  },
  {
    imageKey: Image.UNIT_2,
    type: ModelType.CHAR,
    asset: "unit_2.png"
  },
  {
    imageKey: Image.UNIT_3,
    type: ModelType.CHAR,
    asset: "unit_3.png"
  },
  {
    imageKey: Image.UNIT_4,
    type: ModelType.CHAR,
    asset: "unit_4.png"
  },
  {
    imageKey: Image.UNIT_5,
    type: ModelType.CHAR,
    asset: "unit_5.png"
  },
  {
    imageKey: Image.UNIT_6,
    type: ModelType.CHAR,
    asset: "unit_6.png"
  }
] as Model[];

MODELS.forEach((model: Model) => {
  model.anim = {
    up: `${model.imageKey}:up`,
    down: `${model.imageKey}:down`,
    left: `${model.imageKey}:left`,
    right: `${model.imageKey}:right`,
  }
});
