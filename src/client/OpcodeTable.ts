import WorldPacketHandler, { WorldPacketHandlerFactory } from "./WorldPacketHandler";
import { Opcode } from "../protocol/Opcode";
import PongHandler from "./handler/PongHandler";
import JoinHandler from "./handler/JoinHandler";
import WorldInitHandler from "./handler/WorldInitHandler";
import GameObjectHandler from "./handler/GameObjectHandler";
import GameObjectDestroyHandler from "./handler/GameObjectDestroyHandler";
import WorldUpdateHandler from "./handler/WorldUpdateHandler";
import WorldSession from "./WorldSession";

export default class OpcodeTable {

  private readonly _table: WorldPacketHandler[] = [];

  constructor(session: WorldSession) {
    const _ = new WorldPacketHandlerFactory(session);

    this.define(Opcode.SMSG_PONG, _.handler(PongHandler));
    this.define(Opcode.MSG_JOIN, _.handler(JoinHandler));
    this.define(Opcode.SMSG_WORLD_INIT, _.handler(WorldInitHandler));
    this.define(Opcode.SMSG_WORLD_UPDATE, _.handler(WorldUpdateHandler));
    this.define(Opcode.SMSG_OBJECT, _.handler(GameObjectHandler));
    this.define(Opcode.SMGS_OBJECT_DESTROY, _.handler(GameObjectDestroyHandler));
  }

  private define(opcode: Opcode, handler: WorldPacketHandler) {
    this._table[opcode] = handler;
  }

  public getHandler(opcode: Opcode): WorldPacketHandler {
    return this._table[opcode];
  }
}
