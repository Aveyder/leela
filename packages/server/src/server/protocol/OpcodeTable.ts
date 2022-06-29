import {Opcode} from "@leela/common";
import WorldPacketHandler from "./WorldPacketHandler";
import {handlePlayerJoin, handlePlayerMove, handlePlayerUpdateRateChange} from "../../handlers/player";

export default class OpcodeTable {

    public static readonly INSTANCE = new OpcodeTable();

    static {
        OpcodeTable.INSTANCE.init();
    }

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
