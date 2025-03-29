import WorldPacketHandler, { WorldPacketHandlerFactory } from "./WorldPacketHandler";
import { Opcode } from "../protocol/Opcode";
import PongHandler from "./handler/PongHandler";
import JoinHandler from "./handler/JoinHandler";
import WorldInitHandler from "./handler/WorldInitHandler";
import GameObjectNewHandler from "./handler/GameObjectNewHandler";
import GameObjectDestroyHandler from "./handler/GameObjectDestroyHandler";
import WorldUpdateHandler from "./handler/WorldUpdateHandler";
import WorldSession from "./WorldSession";
import { Constructor } from "../utils/Constructor";

export default class OpcodeTable {

  private readonly _table: WorldPacketHandler[] = [];

  private readonly _: WorldPacketHandlerFactory;

  constructor(session: WorldSession) {
    this._ = new WorldPacketHandlerFactory(session);

    this.define(Opcode.SMSG_PONG, PongHandler);
    this.define(Opcode.MSG_JOIN, JoinHandler);
    this.define(Opcode.SMSG_WORLD_INIT, WorldInitHandler);
    this.define(Opcode.SMSG_WORLD_UPDATE, WorldUpdateHandler);
    this.define(Opcode.SMSG_OBJECT, GameObjectNewHandler);
    this.define(Opcode.SMGS_OBJECT_DESTROY, GameObjectDestroyHandler);
  }

  private define(opcode: Opcode, handler: Constructor<WorldPacketHandler>) {
    this._table[opcode] = this._.handler(handler);
  }

  public getHandler(opcode: Opcode): WorldPacketHandler {
    return this._table[opcode];
  }
}
