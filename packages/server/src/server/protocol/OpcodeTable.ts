import {Opcode} from "@leela/common";
import WorldPacketHandler from "./WorldPacketHandler";
import {handleGatherPlant} from "../../plant/gather";
import {handleUpdateRateChange} from "../updateRate";
import {handlePlayerJoin} from "../../player/join";
import {handlePlayerMove, handleSwitchWalkMode} from "../../player/movement";

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
        this.defineHandler(Opcode.CMSG_UPDATE_RATE, handleUpdateRateChange);
        this.defineHandler(Opcode.MSG_JOIN, handlePlayerJoin);
        this.defineHandler(Opcode.CMSG_MOVE, handlePlayerMove);
        this.defineHandler(Opcode.CMSG_SWITCH_WALK, handleSwitchWalkMode);
        this.defineHandler(Opcode.CMSG_GATHER, handleGatherPlant);
    }

    private defineHandler(opcode: Opcode, handler: WorldPacketHandler) {
        this.handlers[opcode] = handler;
    }

    public get(opcode: Opcode): WorldPacketHandler {
        return this.handlers[opcode];
    }
}
