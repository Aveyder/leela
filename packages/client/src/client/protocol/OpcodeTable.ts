import {Opcode} from "@leela/common";
import WorldPacketHandler from "./WorldPacketHandler";
import {handleJoin} from "../../player/join";
import {handleDestroy, handleUpdate} from "../../core/update";
import {handlePutItem} from "../../inventory/putItem";
import {handleGatherFail, handleGatherSuccess} from "../../plant/gather";
import {handlePong} from "../pong";
import {handlePutGold} from "../../inventory/putGold";

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
        this.defineHandler(Opcode.SMSG_PUT_ITEM, handlePutItem);
        this.defineHandler(Opcode.SMSG_GATHER_FAIL, handleGatherFail);
        this.defineHandler(Opcode.SMSG_GATHER_SUCCESS, handleGatherSuccess);
        this.defineHandler(Opcode.SMSG_PUT_GOLD, handlePutGold);
    }

    private defineHandler(opcode: Opcode, handler: WorldPacketHandler) {
        this.handlers[opcode] = handler;
    }

    public get(opcode: Opcode): WorldPacketHandler {
        return this.handlers[opcode];
    }
}
