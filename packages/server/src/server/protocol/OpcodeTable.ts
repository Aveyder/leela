import {Opcode} from "@leela/common";
import WorldPacketHandler from "./WorldPacketHandler";
import {handlePlayerJoin, handlePlayerMove, handlePlayerUpdateRateChange} from "../../handlers/playerHandler";

export default class OpcodeTable {

    private readonly handlers: WorldPacketHandler[];

    constructor() {
        this.handlers = [];
    }

    public init(): void {
        this.defineHandler(Opcode.CMSG_UPDATE_RATE, handlePlayerUpdateRateChange);
        this.defineHandler(Opcode.MSG_JOIN, handlePlayerJoin);
        this.defineHandler(Opcode.CMSG_MOVE, handlePlayerMove);
    }

    private defineHandler(opcode: Opcode, handler: WorldPacketHandler) {
        this.handlers[opcode] = handler;
    }

    public get(opcode: Opcode): WorldPacketHandler {
        return this.handlers[opcode];
    }
}
