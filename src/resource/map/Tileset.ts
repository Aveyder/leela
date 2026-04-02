export const Tileset = {
  BASE: "base",
  GRASS: "grass",
} as const;
export type Tileset = typeof Tileset[keyof typeof Tileset];
