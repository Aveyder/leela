import WorldPacketHandler, { WorldPacketHandlerFactory } from "./WorldPacketHandler";
import { Opcode } from "../protocol/Opcode";
import PongHandler from "./handler/PongHandler";
import JoinHandler from "./handler/JoinHandler";
import WorldInitHandler from "./handler/WorldInitHandler";
import GameObjectNewHandler from "./handler/GameObjectNewHandler";
import GameObjectDestroyHandler from "./handler/GameObjectDestroyHandler";
import WorldUpdateHandler from "./handler/WorldUpdateHandler";
import { Constructor } from "../utils/Constructor";
import GameContext from "./GameContext";

export default class OpcodeTable {

  private readonly _table: WorldPacketHandler[] = [];

  private readonly _: WorldPacketHandlerFactory;

  constructor(context: GameContext) {
    this._ = new WorldPacketHandlerFactory(context);

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
