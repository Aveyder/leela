enum Opcode {
    CMSG_AUTH,
    SMSG_AUTH_SUCCESS,
    CMSG_UPDATE_RATE,
    CMSG_PING,
    SMSG_PONG,
    MSG_JOIN,
    CMSG_MOVE,
    SMSG_UPDATE,
    SMSG_DESTROY,
    CMSG_SWITCH_WALK,
    SMSG_PUT_ITEM,
    SMGS_FULL_BAG,
    CMSG_GATHER,
    SMSG_GATHER_SUCCESS,
    SMSG_GATHER_FAIL,
    SMSG_PUT_GOLD,
    CMSG_LEAVE
}

enum UpdateOpcode {
    UNIT_NEW,
    UNIT_ACK,
    UNIT_SKIN,
    UNIT_POS,
    PLAYER_MOV,
    PLAYER_INV,
    PLANT
}

const updateDataSize: Record<UpdateOpcode, number> = {
    [UpdateOpcode.UNIT_NEW]: 3,
    [UpdateOpcode.UNIT_ACK]: 0,
    [UpdateOpcode.UNIT_SKIN]: 1,
    [UpdateOpcode.UNIT_POS]: 4,
    [UpdateOpcode.PLAYER_MOV]: 2,
    [UpdateOpcode.PLAYER_INV]: 2,
    [UpdateOpcode.PLANT]: 3,
}

export {
    Opcode,
    UpdateOpcode,
    updateDataSize
};
