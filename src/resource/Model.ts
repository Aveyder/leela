import { Image } from "./Image";

export interface ModelDescriptor {
  id: number,
  imageKey: Image,
  type: ModelType,
  assetPrefix: string,
  anim: {
    up: string,
    down: string,
    left: string,
    right: string,
  }
}

export const ModelType = {
  CHAR: 0,
} as const;
export type ModelType = typeof ModelType[keyof typeof ModelType];

export const MODELS = [
  {
    id: 0,
    imageKey: Image.UNIT,
    type: ModelType.CHAR,
    assetPrefix: "unit_0",
  },
  {
    id: 1,
    imageKey: Image.UNIT,
    type: ModelType.CHAR,
    assetPrefix: "unit_1"
  },
  {
    id: 2,
    imageKey: Image.UNIT,
    type: ModelType.CHAR,
    assetPrefix: "unit_2"
  },
  {
    id: 3,
    imageKey: Image.UNIT,
    type: ModelType.CHAR,
    assetPrefix: "unit_3"
  },
  {
    id: 4,
    imageKey: Image.UNIT,
    type: ModelType.CHAR,
    assetPrefix: "unit_4"
  },
  {
    id: 5,
    imageKey: Image.UNIT,
    type: ModelType.CHAR,
    assetPrefix: "unit_5"
  },
  {
    id: 6,
    imageKey: Image.UNIT,
    type: ModelType.CHAR,
    assetPrefix: "unit_6"
  }
] as ModelDescriptor[];

MODELS.forEach((model: ModelDescriptor) => {
  model.anim = {
    up: `${model.assetPrefix}:up`,
    down: `${model.assetPrefix}:down`,
    left: `${model.assetPrefix}:left`,
    right: `${model.assetPrefix}:right`,
  }
});

export const MODELS_BY_ID: Map<number, ModelDescriptor> = MODELS.reduce(
  (acc: Map<number, ModelDescriptor>, model: ModelDescriptor) => {
    acc.set(model.id, model);

    return acc;
  },
  new Map<number, ModelDescriptor>()
);
