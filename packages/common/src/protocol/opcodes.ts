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
    SMSG_GATHER_SUCCESS,
    SMSG_GATHER_FAIL,
    CMSG_GATHER
}

enum Update {
    FULL,
    EMPTY,
    UNIT_SKIN,
    UNIT_POSITION
}

export {
    Opcode,
    Update
};
