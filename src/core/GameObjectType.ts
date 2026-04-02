export const GameObjectType  = {
  None: 0,
  Player: 1,
  NPC: 2,
  Gatherable: 3,
} as const;
type GameObjectType = typeof GameObjectType[keyof typeof GameObjectType];
