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
    CMSG_SWITCH_WALK
}

enum Update {
    FULL,
    EMPTY,
    SKIN,
    POSITION
}

export {
    Opcode,
    Update
};
