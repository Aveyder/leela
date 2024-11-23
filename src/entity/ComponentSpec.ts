import { ComponentId } from "../protocol/ComponentId";

export type ComponentSpec = {
  [key in ComponentId]: object;
};
