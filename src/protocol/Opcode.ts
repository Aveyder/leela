export const Opcode = {
  CMSG_AUTH: 0,
  SMSG_AUTH_SUCCESS: 1,
  CMSG_UPDATE_RATE: 2,
  CMSG_PING: 3,
  SMSG_PONG: 4,
  MSG_JOIN: 5,
  CMSG_MOVE: 6,
  SMSG_WORLD_INIT: 7,
  SMSG_WORLD_UPDATE: 8,
  SMSG_OBJECT: 9,
  SMSG_OBJECT_DESTROY: 10,
  CMSG_SWAP_ITEM: 11,
  SMSG_UPDATE: 12,
  SMSG_DESTROY: 13,
  CMSG_LEAVE: 14
} as const;
export type Opcode = typeof Opcode[keyof typeof Opcode];
