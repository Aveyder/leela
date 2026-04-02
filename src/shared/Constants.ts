export const CollisionCategory = {
  WALL: 0x0001,
  PLAYER: 0x002,
} as const;
export type CollisionCategory = typeof CollisionCategory[keyof typeof CollisionCategory];

export const CHAR_WIDTH = 24;
export const CHAT_HEIGHT = 32;

export const INVENTORY_SIZE = 40;
