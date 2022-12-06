import {Opcode} from "@leela/common";
import WorldPacketHandler from "./WorldPacketHandler";
import {handleGatherPlant} from "../../plant/gather";
import {handleUpdateRateChange} from "../updateRate";
import {handlePlayerJoin} from "../../player/join";
import {handlePlayerMove, handleSwitchWalkMode} from "../../player/movement";
import {handlePlayerLeave} from "../../player/leave";
import SessionStatus from "./SessionStatus";

export default class OpcodeTable {

    public static readonly INSTANCE = new OpcodeTable();

    static {
        OpcodeTable.INSTANCE.init();
    }

    private readonly table: [SessionStatus, WorldPacketHandler][];

    constructor() {
        this.table = [];
    }

    public init(): void {
        this.defineHandler(Opcode.CMSG_UPDATE_RATE, SessionStatus.STATUS_AUTHED, handleUpdateRateChange);
        this.defineHandler(Opcode.MSG_JOIN, SessionStatus.STATUS_AUTHED, handlePlayerJoin);
        this.defineHandler(Opcode.CMSG_MOVE, SessionStatus.STATUS_IN_GAME, handlePlayerMove);
        this.defineHandler(Opcode.CMSG_SWITCH_WALK, SessionStatus.STATUS_IN_GAME, handleSwitchWalkMode);
        this.defineHandler(Opcode.CMSG_GATHER, SessionStatus.STATUS_IN_GAME, handleGatherPlant);
        this.defineHandler(Opcode.CMSG_LEAVE, SessionStatus.STATUS_IN_GAME, handlePlayerLeave);
    }

    private defineHandler(opcode: Opcode, sessionStatus: SessionStatus, handler: WorldPacketHandler) {
        this.table[opcode] = [sessionStatus, handler];
    }

    public getSessionStatus(opcode: Opcode): SessionStatus {
        return this.table[opcode][0];
    }

    public getHandler(opcode: Opcode): WorldPacketHandler {
        return this.table[opcode][1];
    }
}
