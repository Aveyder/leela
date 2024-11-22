import WorldPacketHandler, { NOOPHandler, WorldPacketHandlerFactory } from "./WorldPacketHandler";
import { Opcode } from "../protocol/Opcode";
import PongHandler from "./handler/PongHandler";
import WorldScene from "./world/WorldScene";
import JoinHandler from "./handler/JoinHandler";

export default class OpcodeTable {

  private readonly _table: WorldPacketHandler[] = [];

  constructor(scene: WorldScene) {
    const _ = new WorldPacketHandlerFactory(scene);

    this.define(Opcode.SMSG_PONG, _.handler(PongHandler));
    this.define(Opcode.MSG_JOIN, _.handler(JoinHandler));
  }

  private define(opcode: Opcode, handler: WorldPacketHandler) {
    this._table[opcode] = handler;
  }

  public getHandler(opcode: Opcode): WorldPacketHandler {
    return this._table[opcode];
  }
}
