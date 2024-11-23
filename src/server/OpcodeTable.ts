import WorldPacketHandler, { NOOPHandler, WorldPacketHandlerFactory } from "./WorldPacketHandler";
import { Opcode } from "../protocol/Opcode";
import { WorldSessionStatus } from "./WorldSessionStatus";
import UpdateRateHandler from "./handler/UpdateRateHandler";
import World from "./world/World";
import JoinHandler from "./handler/JoinHandler";
import MoveHandler from "./handler/MoveHandler";

export default class OpcodeTable {

  private readonly _table: [WorldSessionStatus, WorldPacketHandler][] = [];

  constructor(world: World) {
    const _ = new WorldPacketHandlerFactory(world);

    this.define(Opcode.CMSG_UPDATE_RATE, WorldSessionStatus.STATUS_AUTHED, _.handler(UpdateRateHandler));
    this.define(Opcode.MSG_JOIN, WorldSessionStatus.STATUS_AUTHED, _.handler(JoinHandler));
    this.define(Opcode.CMSG_MOVE, WorldSessionStatus.STATUS_JOINED, _.handler(MoveHandler));
  }

  private define(opcode: Opcode, sessionStatus: WorldSessionStatus, handler: WorldPacketHandler) {
    this._table[opcode] = [sessionStatus, handler];
  }

  public getSessionStatus(opcode: Opcode): WorldSessionStatus {
    return this._table[opcode][0];
  }

  public getHandler(opcode: Opcode): WorldPacketHandler {
    return this._table[opcode][1];
  }
}
