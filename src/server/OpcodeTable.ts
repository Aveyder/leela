import WorldPacketHandler, { WorldPacketHandlerFactory } from "./WorldPacketHandler";
import { Opcode } from "../protocol/Opcode";
import { WorldSessionStatus } from "./WorldSessionStatus";
import UpdateRateHandler from "./handler/UpdateRateHandler";
import JoinHandler from "./handler/JoinHandler";
import MoveHandler from "./handler/MoveHandler";
import WorldSession from "./WorldSession";
import { Constructor } from "../utils/Constructor";

export default class OpcodeTable {

  private readonly _table: [WorldSessionStatus, WorldPacketHandler][] = [];

  private readonly _: WorldPacketHandlerFactory;

  constructor(session: WorldSession) {
    this._ = new WorldPacketHandlerFactory(session);

    this.define(Opcode.CMSG_UPDATE_RATE, WorldSessionStatus.STATUS_AUTHED, UpdateRateHandler);
    this.define(Opcode.MSG_JOIN, WorldSessionStatus.STATUS_AUTHED, JoinHandler);
    this.define(Opcode.CMSG_MOVE, WorldSessionStatus.STATUS_JOINED, MoveHandler);
  }

  private define(opcode: Opcode, sessionStatus: WorldSessionStatus, handler: Constructor<WorldPacketHandler>) {
    this._table[opcode] = [sessionStatus, this._.handler(handler)];
  }

  public getSessionStatus(opcode: Opcode): WorldSessionStatus {
    return this._table[opcode][0];
  }

  public getHandler(opcode: Opcode): WorldPacketHandler {
    return this._table[opcode][1];
  }
}
