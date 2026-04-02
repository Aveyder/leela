export const Image = {
  PLACEHOLDER: "image:placeholder",
  TILESET_BASE: "image:tileset_base",
  TILESET_GRASS: "image:tileset_grass",
  UNIT: "image:unit",
  ITEM: "image:item",
} as const;

export type Image = typeof Image[keyof typeof Image];
