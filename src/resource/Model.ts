import { Image } from "./Image";

export interface ModelDescriptor {
  id: number,
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

export class Model {
  public static readonly UNIT_0 = {
    id: 0,
    imageKey: Image.UNIT_0,
    type: ModelType.CHAR,
    asset: "unit_0.png",
  } as ModelDescriptor
  public static readonly UNIT_1 = {
    id: 1,
    imageKey: Image.UNIT_1,
    type: ModelType.CHAR,
    asset: "unit_1.png"
  } as ModelDescriptor
  public static readonly UNIT_2 = {
    id: 2,
    imageKey: Image.UNIT_2,
    type: ModelType.CHAR,
    asset: "unit_2.png"
  } as ModelDescriptor
  public static readonly UNIT_3 = {
    id: 3,
    imageKey: Image.UNIT_3,
    type: ModelType.CHAR,
    asset: "unit_3.png"
  } as ModelDescriptor
  public static readonly UNIT_4 = {
    id: 4,
    imageKey: Image.UNIT_4,
    type: ModelType.CHAR,
    asset: "unit_4.png"
  } as ModelDescriptor
  public static readonly UNIT_5 = {
    id: 5,
    imageKey: Image.UNIT_5,
    type: ModelType.CHAR,
    asset: "unit_5.png"
  } as ModelDescriptor
  public static readonly UNIT_6 = {
    id: 6,
    imageKey: Image.UNIT_6,
    type: ModelType.CHAR,
    asset: "unit_6.png"
  } as ModelDescriptor
}

export const MODELS: ModelDescriptor[] = Object.values(Model);

MODELS.forEach((model: ModelDescriptor) => {
  model.anim = {
    up: `${model.imageKey}:up`,
    down: `${model.imageKey}:down`,
    left: `${model.imageKey}:left`,
    right: `${model.imageKey}:right`,
  }
});

export const MODELS_BY_ID: Map<number, ModelDescriptor> = MODELS.reduce(
  (acc: Map<number, ModelDescriptor>, model: ModelDescriptor) => {
    acc.set(model.id, model);

    return acc;
  },
  new Map<number, ModelDescriptor>()
);
