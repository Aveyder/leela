export enum GameObjectFlag {
  None = 0,                 // 0000
  Interactable = 1 << 0,    // 0001
  Destructible = 1 << 1,    // 0010
  Lootable = 1 << 1,        // 0100,
  Invisible = 1 << 1,       // 1000,
}

function addFlag(flags: number, flag: GameObjectFlag): number {
  return flags | flag;
}

function removeFlag(flags: number, flag: GameObjectFlag): number {
  return flags & ~flag;
}

function hasFlag(flags: number, flag: GameObjectFlag): boolean {
  return (flags & flag) !== 0;
}
