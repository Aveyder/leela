import {Opcode} from "@leela/common";
import WorldPacketHandler from "./WorldPacketHandler";
import {handlePong} from "../../handlers/pong";
import {handleJoin} from "../../handlers/join";
import {handleDestroy, handleUpdate} from "../../handlers/update";

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
        this.defineHandler(Opcode.SMSG_PONG, handlePong);
        this.defineHandler(Opcode.MSG_JOIN, handleJoin);
        this.defineHandler(Opcode.SMSG_UPDATE, handleUpdate);
        this.defineHandler(Opcode.SMSG_DESTROY, handleDestroy);
    }

    private defineHandler(opcode: Opcode, handler: WorldPacketHandler) {
        this.handlers[opcode] = handler;
    }

    public get(opcode: Opcode): WorldPacketHandler {
        return this.handlers[opcode];
    }
}
